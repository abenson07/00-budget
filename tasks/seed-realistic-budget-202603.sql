-- ---------------------------------------------------------------------------
-- Realistic budget seed (idempotent, non-destructive)
-- ---------------------------------------------------------------------------
-- Safe to run on an existing database: uses fixed UUIDs + ON CONFLICT DO NOTHING.
-- Does not TRUNCATE, DELETE, or UPDATE existing rows.
--
-- Schema reference: tasks/supabase-schema.sql
--   - Bills & essential spending → type 'essential' (subtype bill | essential_spending)
--   - Spending money → type 'discretionary'
--   - Income is NOT stored in DB; see comment block at bottom for your reference numbers.
--
-- App behavior: src/lib/budget-sync.ts loads the FIRST account by created_at.
-- This seed sets the account created_at to 2000-01-01 so it wins over newer demo
-- accounts. Adjust that timestamp if you want a different account to load.
-- ---------------------------------------------------------------------------

begin;

-- Account
insert into public.accounts (id, name, created_at)
values (
  '5eed0000-0000-4000-8000-000000000001'::uuid,
  'Seed User',
  timestamptz '2000-01-01 12:00:00+00'
)
on conflict (id) do nothing;

-- Buckets (Unassigned first; then bills, essential spending, discretionary)
insert into public.buckets (
  id, account_id, name, type, essential_subtype,
  amount, sort_order, top_off, percentage, due_date, alert_date
) values
  -- Unassigned (discretionary catch-all; order 0)
  (
    '5eed0000-0000-4000-8000-000000000010'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Unassigned',
    'discretionary',
    null,
    1469.00,
    0,
    null,
    null,
    null,
    null
  ),
  -- Upcoming bills (essential / bill)
  (
    '5eed0000-0000-4000-8000-000000000011'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Rent',
    'essential',
    'bill',
    0.00,
    10,
    1050.00,
    null,
    date '2026-04-01',
    date '2026-03-29'
  ),
  (
    '5eed0000-0000-4000-8000-000000000012'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Electric',
    'essential',
    'bill',
    0.00,
    20,
    85.00,
    null,
    date '2026-04-15',
    date '2026-04-12'
  ),
  (
    '5eed0000-0000-4000-8000-000000000013'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Gas Utility',
    'essential',
    'bill',
    0.00,
    30,
    40.00,
    null,
    date '2026-04-18',
    date '2026-04-15'
  ),
  (
    '5eed0000-0000-4000-8000-000000000014'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Internet',
    'essential',
    'bill',
    65.00,
    40,
    65.00,
    null,
    date '2026-04-22',
    date '2026-04-19'
  ),
  (
    '5eed0000-0000-4000-8000-000000000015'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Phone',
    'essential',
    'bill',
    0.00,
    50,
    75.00,
    null,
    date '2026-04-08',
    date '2026-04-05'
  ),
  (
    '5eed0000-0000-4000-8000-000000000016'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Renters Insurance',
    'essential',
    'bill',
    0.00,
    60,
    18.00,
    null,
    date '2026-04-01',
    date '2026-03-29'
  ),
  (
    '5eed0000-0000-4000-8000-000000000017'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Spotify',
    'essential',
    'bill',
    0.00,
    70,
    11.00,
    null,
    date '2026-04-10',
    date '2026-04-07'
  ),
  (
    '5eed0000-0000-4000-8000-000000000018'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Car Insurance',
    'essential',
    'bill',
    0.00,
    80,
    112.00,
    null,
    date '2026-04-01',
    date '2026-03-29'
  ),
  (
    '5eed0000-0000-4000-8000-000000000019'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Student Loan',
    'essential',
    'bill',
    0.00,
    90,
    210.00,
    null,
    date '2026-04-15',
    date '2026-04-12'
  ),
  (
    '5eed0000-0000-4000-8000-00000000001a'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Netflix',
    'essential',
    'bill',
    0.00,
    100,
    15.00,
    null,
    date '2026-04-05',
    date '2026-04-02'
  ),
  -- Essential spending (goals: top_off = 2× goal_per_paycheck; amount = remainder after sample txs)
  (
    '5eed0000-0000-4000-8000-000000000021'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Groceries',
    'essential',
    'essential_spending',
    178.00,
    110,
    400.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000022'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Gas',
    'essential',
    'essential_spending',
    50.00,
    120,
    150.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000023'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Household Supplies',
    'essential',
    'essential_spending',
    42.00,
    130,
    60.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000024'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Personal Care',
    'essential',
    'essential_spending',
    28.00,
    140,
    50.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000025'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Pet Supplies',
    'essential',
    'essential_spending',
    42.00,
    150,
    80.00,
    null,
    null,
    null
  ),
  -- Discretionary (spending money)
  (
    '5eed0000-0000-4000-8000-000000000031'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Dining Out',
    'discretionary',
    null,
    81.00,
    200,
    160.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000032'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Entertainment',
    'discretionary',
    null,
    52.00,
    210,
    80.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000033'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Shopping / Clothing',
    'discretionary',
    null,
    31.00,
    220,
    100.00,
    null,
    null,
    null
  ),
  (
    '5eed0000-0000-4000-8000-000000000034'::uuid,
    '5eed0000-0000-4000-8000-000000000001'::uuid,
    'Hobbies',
    'discretionary',
    null,
    70.00,
    230,
    70.00,
    null,
    null,
    null
  )
on conflict (id) do nothing;

-- Transactions (primary_bucket_id only; app treats missing splits like a single-bucket debit)
insert into public.transactions (
  id, account_id, amount, merchant, date, spending_type, primary_bucket_id
) values
  ('5eed0000-0000-4000-8000-0000ff000001'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 1050.00, 'Rent — March', date '2026-03-06', 'debit', '5eed0000-0000-4000-8000-000000000011'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000002'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 18.00, 'Renters Insurance', date '2026-03-06', 'debit', '5eed0000-0000-4000-8000-000000000016'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000003'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 112.00, 'Car Insurance', date '2026-03-06', 'debit', '5eed0000-0000-4000-8000-000000000018'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000004'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 67.00, 'Hy-Vee', date '2026-03-07', 'debit', '5eed0000-0000-4000-8000-000000000021'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000005'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 75.00, 'Phone Bill', date '2026-03-08', 'debit', '5eed0000-0000-4000-8000-000000000015'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000006'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 14.00, 'Chipotle', date '2026-03-09', 'debit', '5eed0000-0000-4000-8000-000000000031'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000007'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 15.00, 'Netflix', date '2026-03-10', 'debit', '5eed0000-0000-4000-8000-00000000001a'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000008'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 43.00, 'Target', date '2026-03-10', 'debit', '5eed0000-0000-4000-8000-000000000033'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000009'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 11.00, 'Spotify', date '2026-03-10', 'debit', '5eed0000-0000-4000-8000-000000000017'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000a'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 52.00, 'QuikTrip', date '2026-03-11', 'debit', '5eed0000-0000-4000-8000-000000000022'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000b'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 84.00, 'Hy-Vee', date '2026-03-12', 'debit', '5eed0000-0000-4000-8000-000000000021'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000c'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 28.00, 'Alamo Drafthouse', date '2026-03-13', 'debit', '5eed0000-0000-4000-8000-000000000032'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000d'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 18.00, 'Dollar Tree', date '2026-03-14', 'debit', '5eed0000-0000-4000-8000-000000000023'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000e'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 85.00, 'Electric Bill', date '2026-03-15', 'debit', '5eed0000-0000-4000-8000-000000000012'::uuid),
  ('5eed0000-0000-4000-8000-0000ff00000f'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 210.00, 'Student Loan', date '2026-03-15', 'debit', '5eed0000-0000-4000-8000-000000000019'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000010'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 34.00, 'Local Bar', date '2026-03-15', 'debit', '5eed0000-0000-4000-8000-000000000031'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000011'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 22.00, 'CVS', date '2026-03-16', 'debit', '5eed0000-0000-4000-8000-000000000024'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000012'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 38.00, 'PetSmart', date '2026-03-17', 'debit', '5eed0000-0000-4000-8000-000000000025'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000013'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 31.00, 'DoorDash', date '2026-03-17', 'debit', '5eed0000-0000-4000-8000-000000000031'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000014'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 40.00, 'Gas Utility', date '2026-03-18', 'debit', '5eed0000-0000-4000-8000-000000000013'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000015'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 48.00, 'QuikTrip', date '2026-03-18', 'debit', '5eed0000-0000-4000-8000-000000000022'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000016'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 26.00, 'Amazon', date '2026-03-19', 'debit', '5eed0000-0000-4000-8000-000000000033'::uuid),
  ('5eed0000-0000-4000-8000-0000ff000017'::uuid, '5eed0000-0000-4000-8000-000000000001'::uuid, 71.00, 'Hy-Vee', date '2026-03-19', 'debit', '5eed0000-0000-4000-8000-000000000021'::uuid)
on conflict (id) do nothing;

commit;

-- ---------------------------------------------------------------------------
-- Reference: income (not persisted — app has no income table in Phase 1 schema)
-- ---------------------------------------------------------------------------
-- gross_biweekly:   2692
-- takehome_biweekly: 2150
-- frequency:        biweekly
-- Implied cash-in for two pay periods in March: 4300 take-home
-- Sum of seeded bucket.amount: 2108 (= 4300 − 2192 in sample outflows)
-- ---------------------------------------------------------------------------
