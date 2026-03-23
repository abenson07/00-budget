import type { SupabaseClient } from "@supabase/supabase-js";
import { getEffectiveSplits } from "@/lib/allocation";
import { createMockDataset } from "@/lib/mockData";
import type { Account, Bucket, MockDataset, Transaction } from "@/lib/types";

type BucketRow = {
  id: string;
  account_id: string;
  name: string;
  type: string;
  essential_subtype: string | null;
  amount: string | number;
  sort_order: number;
  top_off: string | number | null;
  percentage: string | number | null;
  due_date: string | null;
  alert_date: string | null;
  locked?: boolean | null;
};

type TxRow = {
  id: string;
  account_id: string;
  amount: string | number;
  merchant: string;
  date: string;
  spending_type: string;
  primary_bucket_id: string | null;
  status?: string | null;
  transaction_splits?: SplitRow[] | null;
};

type SplitRow = {
  bucket_id: string;
  amount: string | number | null;
  percentage: string | number | null;
};

function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : Number(v);
}

export function rowToBucket(row: BucketRow): Bucket {
  const base = {
    id: row.id,
    name: row.name,
    order: row.sort_order,
    amount: num(row.amount),
    top_off: row.top_off != null ? num(row.top_off) : null,
    percentage: row.percentage != null ? num(row.percentage) : null,
  };

  if (row.type === "discretionary") {
    const gtd = row.due_date;
    return {
      ...base,
      type: "discretionary" as const,
      goal_target_date:
        typeof gtd === "string" && gtd.trim() !== "" ? gtd.trim() : null,
      locked: row.locked === true,
    };
  }

  const sub = row.essential_subtype ?? "essential_spending";
  if (sub === "bill") {
    return {
      ...base,
      type: "essential" as const,
      essential_subtype: "bill" as const,
      due_date: row.due_date ?? "",
      alert_date: row.alert_date ?? "",
    };
  }

  return {
    ...base,
    type: "essential" as const,
    essential_subtype: "essential_spending" as const,
  };
}

export function rowToTransaction(row: TxRow): Transaction {
  const splitRows = row.transaction_splits ?? [];
  const splits =
    splitRows.length > 0
      ? splitRows.map((s) => ({
          bucketId: s.bucket_id,
          amount: num(s.amount),
          percentage:
            s.percentage != null ? num(s.percentage) : undefined,
        }))
      : undefined;

  const dateStr =
    typeof row.date === "string"
      ? row.date.slice(0, 10)
      : String(row.date).slice(0, 10);

  const pending = row.status?.toLowerCase() === "pending";

  return {
    id: row.id,
    account_id: row.account_id,
    amount: num(row.amount),
    merchant: row.merchant ?? "",
    date: dateStr,
    spending_type: "debit",
    primary_bucket_id: row.primary_bucket_id,
    splits,
    ...(pending ? { status: "pending" as const } : {}),
  };
}

export async function fetchBudgetDataset(
  supabase: SupabaseClient,
): Promise<MockDataset | null> {
  const { data: accounts, error: accErr } = await supabase
    .from("accounts")
    .select("id,name")
    .order("created_at", { ascending: true })
    .limit(1);

  if (accErr || !accounts?.length) return null;

  const account: Account = {
    id: accounts[0].id as string,
    name: accounts[0].name as string,
  };

  const { data: bucketRows, error: bErr } = await supabase
    .from("buckets")
    .select("*")
    .eq("account_id", account.id)
    .order("sort_order", { ascending: true });

  if (bErr || !bucketRows?.length) return null;

  const buckets = (bucketRows as BucketRow[]).map(rowToBucket);

  const { data: txRows, error: tErr } = await supabase
    .from("transactions")
    .select(
      `
      id, account_id, amount, merchant, date, spending_type, primary_bucket_id, status,
      transaction_splits ( bucket_id, amount, percentage )
    `,
    )
    .eq("account_id", account.id)
    .order("date", { ascending: false });

  if (tErr || !txRows) return null;

  const transactions = (txRows as TxRow[])
    .filter((r) => r.spending_type === "debit")
    .map(rowToTransaction);

  return { account, buckets, transactions };
}

export async function seedDemoIfEmpty(
  supabase: SupabaseClient,
  seed = 42,
): Promise<boolean> {
  const { count, error: countErr } = await supabase
    .from("accounts")
    .select("*", { count: "exact", head: true });

  if (countErr) return false;
  if (count && count > 0) return false;

  const demo = createMockDataset(seed);

  const { error: aErr } = await supabase.from("accounts").insert({
    id: demo.account.id,
    name: demo.account.name,
  });
  if (aErr) return false;

  for (const b of demo.buckets) {
    const row: Record<string, unknown> = {
      id: b.id,
      account_id: demo.account.id,
      name: b.name,
      type: b.type,
      essential_subtype:
        b.type === "essential" ? b.essential_subtype : null,
      amount: b.amount,
      sort_order: b.order,
      top_off: b.top_off,
      percentage: b.percentage,
      locked: b.type === "discretionary" ? (b.locked === true) : null,
    };
    if (b.type === "essential" && b.essential_subtype === "bill") {
      row.due_date = b.due_date;
      row.alert_date = b.alert_date;
    }
    const { error: bIns } = await supabase.from("buckets").insert(row);
    if (bIns) return false;
  }

  for (const tx of demo.transactions) {
    const { error: txErr } = await supabase.from("transactions").insert({
      id: tx.id,
      account_id: tx.account_id,
      amount: tx.amount,
      merchant: tx.merchant,
      date: tx.date,
      spending_type: tx.spending_type,
      primary_bucket_id: tx.primary_bucket_id ?? null,
      status: tx.status === "pending" ? "pending" : "cleared",
    });
    if (txErr) return false;

    const splits = tx.splits ?? [];
    for (const s of splits) {
      const { error: sErr } = await supabase.from("transaction_splits").insert({
        transaction_id: tx.id,
        bucket_id: s.bucketId,
        amount: s.amount,
        percentage: s.percentage ?? null,
      });
      if (sErr) return false;
    }
  }

  return true;
}

export async function persistBucketCreate(
  supabase: SupabaseClient,
  accountId: string,
  bucket: Bucket,
): Promise<void> {
  const row: Record<string, unknown> = {
    id: bucket.id,
    account_id: accountId,
    name: bucket.name,
    type: bucket.type,
    essential_subtype:
      bucket.type === "essential" ? bucket.essential_subtype : null,
    amount: bucket.amount,
    sort_order: bucket.order,
    top_off: bucket.top_off,
    percentage: bucket.percentage,
    locked: bucket.type === "discretionary" ? bucket.locked === true : null,
  };
  if (bucket.type === "essential" && bucket.essential_subtype === "bill") {
    row.due_date = bucket.due_date;
    row.alert_date = bucket.alert_date;
  } else if (bucket.type === "discretionary") {
    row.due_date = bucket.goal_target_date;
    row.alert_date = null;
  } else {
    row.due_date = null;
    row.alert_date = null;
  }
  const { error } = await supabase.from("buckets").insert(row);
  if (error) throw error;
}

export async function persistBucketAmounts(
  supabase: SupabaseClient,
  buckets: Bucket[],
): Promise<void> {
  await Promise.all(
    buckets.map((b) =>
      supabase.from("buckets").update({ amount: b.amount }).eq("id", b.id),
    ),
  );
}

/** Maps app `Bucket` to DB columns for a full row update (metadata + balance). */
export function bucketToDbUpdate(b: Bucket): Record<string, unknown> {
  const row: Record<string, unknown> = {
    name: b.name,
    type: b.type,
    sort_order: b.order,
    amount: b.amount,
    top_off: b.top_off,
    percentage: b.percentage,
  };
  if (b.type === "essential") {
    row.essential_subtype = b.essential_subtype;
    row.locked = null;
    if (b.essential_subtype === "bill") {
      row.due_date = b.due_date;
      row.alert_date = b.alert_date;
    } else {
      row.due_date = null;
      row.alert_date = null;
    }
  } else {
    row.essential_subtype = null;
    row.due_date = b.goal_target_date;
    row.alert_date = null;
    row.locked = b.locked === true;
  }
  return row;
}

export async function persistBucketUpdate(
  supabase: SupabaseClient,
  bucket: Bucket,
): Promise<void> {
  const { error } = await supabase
    .from("buckets")
    .update(bucketToDbUpdate(bucket))
    .eq("id", bucket.id);
  if (error) throw error;
}

export async function persistTransactionCreate(
  supabase: SupabaseClient,
  tx: Transaction,
): Promise<void> {
  const splits = getEffectiveSplits(tx);

  const { error: tErr } = await supabase.from("transactions").insert({
    id: tx.id,
    account_id: tx.account_id,
    amount: tx.amount,
    merchant: tx.merchant,
    date: tx.date,
    spending_type: tx.spending_type,
    primary_bucket_id: tx.primary_bucket_id ?? null,
    status: tx.status === "pending" ? "pending" : "cleared",
  });
  if (tErr) throw tErr;

  for (const s of splits) {
    const { error: sErr } = await supabase.from("transaction_splits").insert({
      transaction_id: tx.id,
      bucket_id: s.bucketId,
      amount: s.amount,
      percentage: s.percentage ?? null,
    });
    if (sErr) throw sErr;
  }
}

export async function persistTransactionUpdate(
  supabase: SupabaseClient,
  tx: Transaction,
): Promise<void> {
  const splits = getEffectiveSplits(tx);

  const { error: uErr } = await supabase
    .from("transactions")
    .update({
      amount: tx.amount,
      merchant: tx.merchant,
      date: tx.date,
      spending_type: tx.spending_type,
      primary_bucket_id: tx.primary_bucket_id ?? null,
      status: tx.status === "pending" ? "pending" : "cleared",
    })
    .eq("id", tx.id);
  if (uErr) throw uErr;

  const { error: dErr } = await supabase
    .from("transaction_splits")
    .delete()
    .eq("transaction_id", tx.id);
  if (dErr) throw dErr;

  for (const s of splits) {
    const { error: sErr } = await supabase.from("transaction_splits").insert({
      transaction_id: tx.id,
      bucket_id: s.bucketId,
      amount: s.amount,
      percentage: s.percentage ?? null,
    });
    if (sErr) throw sErr;
  }
}

export async function persistTransactionDelete(
  supabase: SupabaseClient,
  txId: string,
): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", txId);
  if (error) throw error;
}
