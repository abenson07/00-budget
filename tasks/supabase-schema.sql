-- Buckets & Safe-to-Spend — Supabase schema (Phase 1 + Phase 2-friendly columns)
-- Run in Supabase SQL Editor. RLS: leave OFF for prototype (per human-tasks.md).
-- Uses gen_random_uuid() (available on Supabase / modern Postgres).

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- buckets
-- type: discretionary | essential
-- essential_subtype: bill | essential_spending | loan (loan = Phase 2)
-- percentage: store as fraction 0–1 (e.g. 0.10 = 10% of incoming paycheck in simulator logic)
-- ---------------------------------------------------------------------------
create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  type text not null check (type in ('discretionary', 'essential')),
  essential_subtype text
    check (
      essential_subtype is null
      or essential_subtype in ('bill', 'essential_spending', 'loan')
    ),
  amount numeric(14, 2) not null default 0,
  sort_order int not null default 0,
  top_off numeric(14, 2),
  percentage numeric(9, 6),
  due_date date,
  alert_date date,
  locked boolean not null default false,
  -- Phase 2: loan bucket fields (nullable when not a loan)
  loan_debt numeric(14, 2),
  minimum_payment numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buckets_account_id_idx on public.buckets (account_id);
create index if not exists buckets_sort_order_idx on public.buckets (account_id, sort_order);

-- ---------------------------------------------------------------------------
-- transactions
-- spending_type: debit | credit_card (credit_card used when feature flag on)
-- primary_bucket_id: optional convenience; splits are source of truth when present
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  amount numeric(14, 2) not null check (amount >= 0),
  merchant text not null default '',
  date date not null default (current_date),
  spending_type text not null default 'debit'
    check (spending_type in ('debit', 'credit_card')),
  status text not null default 'cleared'
    check (status in ('cleared', 'pending')),
  primary_bucket_id uuid references public.buckets (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_account_id_idx on public.transactions (account_id);
create index if not exists transactions_date_idx on public.transactions (account_id, date desc);

-- ---------------------------------------------------------------------------
-- transaction_splits
-- For single-bucket transactions, either one row here OR only primary_bucket_id on transactions (app should normalize)
-- ---------------------------------------------------------------------------
create table if not exists public.transaction_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  bucket_id uuid not null references public.buckets (id) on delete cascade,
  amount numeric(14, 2),
  percentage numeric(9, 6)
);

create index if not exists transaction_splits_tx_idx on public.transaction_splits (transaction_id);
create index if not exists transaction_splits_bucket_idx on public.transaction_splits (bucket_id);
