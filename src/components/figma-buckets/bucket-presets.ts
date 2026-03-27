import type { BucketCardProps } from "./BucketCard";

export const BUCKET_REFERENCE = {
  home: {
    variant: "home" as const,
    state: "default" as const,
    title: "Eating out",
    amountLabel: "$232",
    percentLabel: "20% ",
    risk: "atRisk" as const,
  } satisfies Extract<BucketCardProps, { variant: "home" }>,
  spendingMoney: {
    variant: "spendingMoney" as const,
    state: "default" as const,
    title: "Eating out",
    cadence: { mode: "perPaycheck" as const, label: "$200 per paycheck" },
    balanceLabel: "$41",
    percentLabel: "40% ",
    risk: "safe" as const,
  } satisfies Extract<BucketCardProps, { variant: "spendingMoney" }>,
  spendingMoneyLocked: {
    variant: "spendingMoney" as const,
    state: "locked" as const,
    title: "Date night",
    cadence: { mode: "perPaycheck" as const, label: "$400 per paycheck" },
    balanceLabel: "$100",
    percentLabel: "20% ",
    risk: "atRisk" as const,
  } satisfies Extract<BucketCardProps, { variant: "spendingMoney" }>,
  monthlySpending: {
    variant: "monthlySpending" as const,
    state: "default" as const,
    title: "Groceries",
    cadence: { mode: "topOff" as const, label: "$400 per paycheck" },
    balanceLabel: "$100",
    percentLabel: "20% ",
    risk: "atRisk" as const,
  } satisfies Extract<BucketCardProps, { variant: "monthlySpending" }>,
  bill: {
    variant: "bill" as const,
    state: "default" as const,
    title: "Rent",
    cadence: { mode: "perPaycheck" as const, label: "$495 per paycheck" },
    balanceLabel: "$840",
    percentLabel: "20% ",
    due: { label: "Due in 3 days" },
    risk: "atRisk" as const,
  } satisfies Extract<BucketCardProps, { variant: "bill" }>,
  transaction: {
    variant: "transaction" as const,
    state: "default" as const,
    title: "Groceries",
    amountLabel: "$45.23",
  } satisfies Extract<BucketCardProps, { variant: "transaction" }>,
  transactionSplit: {
    variant: "transaction" as const,
    title: "Shopping",
    amountLabel: "$45.23",
    splitLabel: "12% of transaction",
    state: "split" as const,
  } satisfies Extract<BucketCardProps, { variant: "transaction" }>,
};

