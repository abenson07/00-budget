export type BucketVariant =
  | "home"
  | "spendingMoney"
  | "monthlySpending"
  | "bill"
  | "transaction";

export type BucketHomeState = "default";
export type BucketSpendingMoneyState = "default" | "locked";
export type BucketMonthlySpendingState = "default";
export type BucketBillState = "default";
export type BucketTransactionState = "default" | "split";

