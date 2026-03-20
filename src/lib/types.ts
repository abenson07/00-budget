export type Account = {
  id: string;
  name: string;
};

type BucketBase = {
  id: string;
  name: string;
  order: number;
  amount: number;
  top_off: number | null;
  /** Incoming-money fraction 0–1 (e.g. 0.1 = 10%). */
  percentage: number | null;
};

export type EssentialBillBucket = BucketBase & {
  type: "essential";
  essential_subtype: "bill";
  due_date: string;
  alert_date: string;
};

export type EssentialSpendingBucket = BucketBase & {
  type: "essential";
  essential_subtype: "essential_spending";
};

export type DiscretionaryBucket = BucketBase & {
  type: "discretionary";
};

export type Bucket =
  | EssentialBillBucket
  | EssentialSpendingBucket
  | DiscretionaryBucket;

export type TransactionSplit = {
  bucketId: string;
  /** Primary source of truth for Phase 1 UI. */
  amount: number;
  /** Optional; can be derived from amounts vs transaction total. */
  percentage?: number;
};

export type Transaction = {
  id: string;
  account_id: string;
  /** Positive amount. */
  amount: number;
  merchant: string;
  date: string;
  spending_type: "debit";
  /** When set and `splits` is empty, full amount applies to this bucket. */
  primary_bucket_id?: string | null;
  splits?: TransactionSplit[];
};

export type MockDataset = {
  account: Account;
  buckets: Bucket[];
  transactions: Transaction[];
};
