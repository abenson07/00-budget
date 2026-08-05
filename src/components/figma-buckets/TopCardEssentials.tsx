import type { TopCardEssentialsState, TopCardVariant } from "./top-card-types";

export type TopCardEssentialsProps = {
  /** Always `"essentials"` for this component. */
  variant?: Extract<TopCardVariant, "essentials">;
  /** `default` = on track cream card · `atRisk` = peach / shortfall copy. */
  state: TopCardEssentialsState;
  title: string;
  totalReservedLabel: string;
  totalReservedAmount: string;
  mainAmount: string;
  statusPill: string;
  className?: string;
};

/**
 * **Variant:** `essentials` · **States:** `default` | `atRisk`
 * Figma: 28:5225 (default) · 28:5237 (at risk)
 */
export function TopCardEssentials({
  variant = "essentials",
  state,
  title,
  totalReservedLabel,
  totalReservedAmount,
  mainAmount,
  statusPill,
  className,
}: TopCardEssentialsProps) {
  const atRisk = state === "atRisk";
  return (
    <div
      className={[
        "flex size-full w-full flex-col items-start rounded-card px-5 py-6",
        atRisk ? "bg-budget-risk-bg" : "bg-budget-sage-panel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node={atRisk ? "28:5237" : "28:5225"}
      data-top-card-variant={variant}
      data-top-card-state={state}
    >
      <div className="flex w-full shrink-0 flex-col items-start gap-1">
        <div className="flex w-full shrink-0 items-start justify-between gap-2">
          <p
            className={[
              "font-display relative max-w-[18rem] shrink-0 text-section not-italic",
              atRisk ? "text-budget-risk-ink" : "text-budget-forest",
            ].join(" ")}
          >
            {title}
          </p>
          <div className="relative flex shrink-0 flex-col items-end">
            <p
              className={[
                "relative shrink-0 whitespace-nowrap text-right text-label not-italic",
                atRisk ? "text-budget-risk-ink" : "text-budget-ink",
              ].join(" ")}
            >
              {totalReservedLabel}
            </p>
            <p
              className={[
                "relative shrink-0 whitespace-nowrap text-right text-sm font-bold not-italic",
                atRisk ? "text-budget-risk-ink" : "text-budget-ink opacity-50",
              ].join(" ")}
            >
              {totalReservedAmount}
            </p>
          </div>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start gap-1" data-name="Balance">
          <p
            className={[
              "font-sans-condensed shrink-0 text-display tabular-nums not-italic",
              atRisk ? "text-budget-risk-ink" : "text-budget-forest",
            ].join(" ")}
          >
            {mainAmount}
          </p>
          <div
            className={[
              "flex shrink-0 items-center justify-center rounded-pill px-2 py-0.5",
              atRisk ? "bg-budget-risk-ink" : "bg-budget-sage",
            ].join(" ")}
          >
            <p
              className={[
                "relative shrink-0 whitespace-nowrap text-label font-bold not-italic",
                atRisk ? "text-budget-risk-bg" : "text-budget-forest",
              ].join(" ")}
            >
              {statusPill}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
