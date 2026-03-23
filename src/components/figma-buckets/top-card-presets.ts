import type { TopCardEssentialsState, TopCardHomeEssentialLine } from "./top-card-types";

/** Reference essentials rows (spec sheet: mostly 100% safe-inverse; Groceries 4% at-risk-inverse). */
export const TOP_CARD_HOME_REFERENCE_ESSENTIALS: TopCardHomeEssentialLine[] = [
  {
    title: "Rent",
    subtitle: "Due in 4 days",
    amount: "$1000",
    percentLabel: "100% ",
    subtitleTone: "forest",
    percentageTagVariant: "safe",
    percentageTagInverse: true,
  },
  {
    title: "Utilities",
    subtitle: "Due in 8 days",
    amount: "$400",
    percentLabel: "100% ",
    subtitleTone: "neutral",
    percentageTagVariant: "safe",
    percentageTagInverse: true,
  },
  {
    title: "Groceries",
    subtitle: "Goal: $400",
    amount: "$24",
    percentLabel: "4% ",
    subtitleTone: "neutral",
    percentageTagVariant: "atRisk",
    percentageTagInverse: true,
  },
  {
    title: "Netflix",
    subtitle: "Goal: $400",
    amount: "$12",
    percentLabel: "100% ",
    subtitleTone: "neutral",
    percentageTagVariant: "safe",
    percentageTagInverse: true,
  },
  {
    title: "Gas",
    subtitle: "Goal: $50",
    amount: "$130",
    percentLabel: "100% ",
    subtitleTone: "neutral",
    percentageTagVariant: "safe",
    percentageTagInverse: true,
  },
];

/** Shared copy for all home TopCard examples (matches labeled spec). */
export const TOP_CARD_HOME_REFERENCE_CONTENT = {
  variant: "home" as const,
  headline: "Safe to spend",
  amount: "$421",
  paycheckLine: "14 days until your next paycheck",
  essentialsLabel: "Essentials",
  dueThisWeekShort: "$200 due this week",
  monthlyStatusLine: "On track this month",
  expandedFooterLine: "$200 due this week",
  essentials: TOP_CARD_HOME_REFERENCE_ESSENTIALS,
};

/** @deprecated Use `TOP_CARD_HOME_REFERENCE_ESSENTIALS` */
export const FIGMA_TOP_CARD_HOME_SAMPLE_ESSENTIALS = TOP_CARD_HOME_REFERENCE_ESSENTIALS;

type TopCardEssentialsPreset = {
  state: TopCardEssentialsState;
  title: string;
  totalReservedLabel: string;
  totalReservedAmount: string;
  mainAmount: string;
  statusPill: string;
};

export const TOP_CARD_ESSENTIALS_REFERENCE: Record<
  TopCardEssentialsState,
  TopCardEssentialsPreset
> = {
  default: {
    state: "default",
    title: "Due this week",
    totalReservedLabel: "Total reserved",
    totalReservedAmount: "$3,234.23",
    mainAmount: "$200",
    statusPill: "Good and ready",
  },
  atRisk: {
    state: "atRisk",
    title: "Due this week",
    totalReservedLabel: "Total reserved",
    totalReservedAmount: "$128.23",
    mainAmount: "$200",
    statusPill: "$24 short - transfer money to cover it",
  },
};

export const TOP_CARD_TRANSACTION_REFERENCE = {
  variant: "transaction" as const,
  state: "default" as const,
  title: "Spent this week",
  amount: "$2,480.31",
  subtitlePill: "$2,000 spent on bills",
};
