export type FigmaPercentageTagVariant = "safe" | "atRisk" | "noValue";
export type FigmaPercentageTagState = "default" | "inverse";
export type FigmaPercentageTagLegacyVariant =
  | "safe-default"
  | "safe-inverse"
  | "at-risk-default"
  | "at-risk-inverse"
  | "no-value";

export const PERCENTAGE_TAG_REFERENCE = {
  safeDefault: { variant: "safe" as const, inverse: false, valueLabel: "40% " },
  safeInverse: { variant: "safe" as const, inverse: true, valueLabel: "40% " },
  atRiskDefault: { variant: "atRisk" as const, inverse: false, valueLabel: "20% " },
  atRiskInverse: { variant: "atRisk" as const, inverse: true, valueLabel: "20% " },
  noValue: { variant: "noValue" as const, valueLabel: "0% " },
};

export type FigmaPercentageTagProps = {
  /**
   * Preferred API: logical variant.
   * Legacy strings (e.g. `safe-inverse`) are also accepted.
   */
  variant: FigmaPercentageTagVariant | FigmaPercentageTagLegacyVariant;
  /** Preferred API for tone. Ignored for `noValue`. */
  state?: FigmaPercentageTagState;
  /** Convenience prop equivalent to `state="inverse"`. Ignored for `noValue`. */
  inverse?: boolean;
  /** Preferred text prop. */
  valueLabel?: string;
  /** Legacy text slot, still supported. */
  children?: string;
  className?: string;
};

type CanonicalVariant = {
  variant: FigmaPercentageTagVariant;
  state: FigmaPercentageTagState;
};

const STYLES: Record<
  FigmaPercentageTagVariant,
  Record<FigmaPercentageTagState, { box: string; label: string; node: string }>
> = {
  safe: {
    default: { box: "bg-[#cae0b9]", label: "text-[#1c3812]", node: "28:6415" },
    inverse: { box: "bg-[#1c3812]", label: "text-[#cae0b9]", node: "28:6418" },
  },
  atRisk: {
    default: { box: "bg-[#fbdbba]", label: "text-[#f35226]", node: "28:6347" },
    inverse: { box: "bg-[#912a0e]", label: "text-[#fbdbba]", node: "28:6413" },
  },
  noValue: {
    default: { box: "bg-[#d0d0d0]", label: "text-[#5b5b5b]", node: "28:6423" },
    inverse: { box: "bg-[#d0d0d0]", label: "text-[#5b5b5b]", node: "28:6423" },
  },
};

const DEFAULT_LABELS: Record<FigmaPercentageTagVariant, string> = {
  safe: "40% ",
  atRisk: "20% ",
  noValue: "0% ",
};

function toCanonicalVariant(
  variant: FigmaPercentageTagVariant | FigmaPercentageTagLegacyVariant,
  state: FigmaPercentageTagState | undefined,
  inverse: boolean | undefined,
): CanonicalVariant {
  switch (variant) {
    case "safe-default":
      return { variant: "safe", state: "default" };
    case "safe-inverse":
      return { variant: "safe", state: "inverse" };
    case "at-risk-default":
      return { variant: "atRisk", state: "default" };
    case "at-risk-inverse":
      return { variant: "atRisk", state: "inverse" };
    case "no-value":
      return { variant: "noValue", state: "default" };
    default: {
      if (variant === "noValue") return { variant: "noValue", state: "default" };
      const computedState =
        state ?? (inverse ? "inverse" : "default");
      return { variant, state: computedState };
    }
  }
}

/**
 * Figma “Apps” percentage pills (Instrument Sans SemiCondensed Bold 13px).
 */
export function FigmaPercentageTag({
  variant,
  state,
  inverse,
  valueLabel,
  children,
  className,
}: FigmaPercentageTagProps) {
  const canonical = toCanonicalVariant(variant, state, inverse);
  const v = STYLES[canonical.variant][canonical.state];
  const label = valueLabel ?? children ?? DEFAULT_LABELS[canonical.variant];

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5",
        v.box,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node={v.node}
    >
      <span
        className={[
          "whitespace-nowrap text-[13px] font-bold leading-normal not-italic",
          v.label,
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}
