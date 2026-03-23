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
        "flex size-full w-full max-w-[408px] flex-col items-start rounded-xl px-6 py-8",
        atRisk ? "bg-[#fbdbba]" : "bg-[#e6e8dd]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node={atRisk ? "28:5237" : "28:5225"}
      data-top-card-variant={variant}
      data-top-card-state={state}
    >
      <div className="flex w-full shrink-0 flex-col items-start">
        <div className="flex shrink-0 items-start gap-2">
          <p
            className={[
              "font-display relative w-[285px] shrink-0 text-[24px] leading-normal not-italic",
              atRisk ? "text-[#f35226]" : "text-[#1c3812]",
            ].join(" ")}
          >
            {title}
          </p>
          <div className="relative flex shrink-0 flex-col items-start">
            <div className="relative flex shrink-0 items-center">
              <p
                className={[
                  "relative shrink-0 whitespace-nowrap text-right text-[12px] leading-normal not-italic",
                  atRisk ? "text-[#f35226]" : "text-[#222]",
                ].join(" ")}
              >
                {totalReservedLabel}
              </p>
            </div>
            <p
              className={[
                "relative w-[min-content] min-w-full shrink-0 text-right text-[16px] font-bold leading-normal not-italic",
                atRisk ? "text-[#f35226]" : "text-[#222] opacity-50",
              ].join(" ")}
            >
              {totalReservedAmount}
            </p>
          </div>
        </div>
        <div className="relative flex w-full shrink-0 flex-col items-start" data-name="Balance">
          <p
            className={[
              "w-[min-content] min-w-full shrink-0 text-[72px] font-bold leading-normal not-italic",
              atRisk ? "text-[#f35226]" : "text-[#1c3812]",
            ].join(" ")}
          >
            {mainAmount}
          </p>
          <div
            className={[
              "flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5",
              atRisk ? "bg-[#f35226]" : "bg-[#cae0b9]",
            ].join(" ")}
          >
            <p
              className={[
                "relative shrink-0 whitespace-nowrap text-[13px] font-bold leading-normal not-italic",
                atRisk ? "text-[#fbdbba]" : "text-[#1c3812]",
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
