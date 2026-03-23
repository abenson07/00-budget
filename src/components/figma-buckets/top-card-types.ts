import type { FigmaPercentageTagVariant } from "./FigmaPercentageTag";

/** Product taxonomy: which TopCard layout this is. */
export type TopCardVariant = "home" | "essentials" | "transaction";

/** Home card: collapsed sage strip vs expanded essentials list. */
export type TopCardHomeState = "default" | "expanded";

/** Essentials card: on-track vs shortfall styling. */
export type TopCardEssentialsState = "default" | "atRisk";

/** Transaction card: single default layout for now. */
export type TopCardTransactionState = "default";

export type TopCardHomeEssentialLine = {
  title: string;
  subtitle: string;
  amount: string;
  /** Trailing space matches Figma, e.g. `100% ` */
  percentLabel: string;
  /** Rent row subtitle uses forest tint; others use neutral #222 */
  subtitleTone?: "forest" | "neutral";
  /**
   * Expanded list pills: inverse tokens (dark / rust fill, light label)
   * — same as `FigmaPercentageTag` variant with `inverse=true`.
   */
  percentageTagVariant: Extract<
    FigmaPercentageTagVariant,
    "safe" | "atRisk"
  >;
  percentageTagInverse?: boolean;
};
