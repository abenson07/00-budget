import type { BucketBillProps } from "./BucketBill";
import type { BucketHomeProps } from "./BucketHome";
import type { BucketMonthlySpendingProps } from "./BucketMonthlySpending";
import type { BucketSpendingMoneyLockedProps } from "./BucketSpendingMoneyLocked";
import type { BucketSpendingMoneyProps } from "./BucketSpendingMoney";
import type { BucketTransactionPropsWithState } from "./BucketTransaction";
import type { BucketTransactionSplitProps } from "./BucketTransactionSplit";

export const BUCKET_REFERENCE = {
  home: {
    variant: "home" as const,
    state: "default" as const,
    title: "Eating out",
    amountLabel: "$232",
    percentLabel: "20% ",
  } satisfies BucketHomeProps,
  spendingMoney: {
    variant: "spendingMoney" as const,
    state: "default" as const,
    locked: false,
    atRisk: false,
    title: "Eating out",
    cadenceLabel: "$200 per paycheck",
    balanceLabel: "$41",
    percentLabel: "40% ",
  } satisfies BucketSpendingMoneyProps,
  spendingMoneyLocked: {
    variant: "spendingMoney" as const,
    state: "locked" as const,
    atRisk: true,
    title: "Date night",
    cadenceLabel: "$400 per paycheck",
    balanceLabel: "$100",
    percentLabel: "20% ",
  } satisfies BucketSpendingMoneyLockedProps,
  monthlySpending: {
    variant: "monthlySpending" as const,
    state: "default" as const,
    atRisk: true,
    title: "Groceries",
    cadenceLabel: "$400 per paycheck",
    balanceLabel: "$100",
    percentLabel: "20% ",
  } satisfies BucketMonthlySpendingProps,
  bill: {
    variant: "bill" as const,
    state: "default" as const,
    atRisk: true,
    title: "Rent",
    cadenceLabel: "$495 per paycheck",
    balanceLabel: "$840",
    percentLabel: "20% ",
    dueLabel: "Due in 3 days",
  } satisfies BucketBillProps,
  transaction: {
    variant: "transaction" as const,
    state: "default" as const,
    split: false,
    title: "Groceries",
    amountLabel: "$45.23",
  } satisfies BucketTransactionPropsWithState,
  transactionSplit: {
    variant: "transaction" as const,
    title: "Shopping",
    amountLabel: "$45.23",
    splitLabel: "12% of transaction",
  } satisfies BucketTransactionSplitProps,
};

