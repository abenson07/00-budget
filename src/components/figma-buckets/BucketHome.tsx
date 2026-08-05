import type { BucketHomeState, BucketVariant } from "./bucket-types";
import { FigmaPercentageTag } from "./FigmaPercentageTag";

export type BucketHomeProps = {
  variant?: Extract<BucketVariant, "home">;
  state?: BucketHomeState;
  title?: string;
  amountLabel?: string;
  percentLabel?: string;
  atRisk?: boolean;
  className?: string;
};

/**
 * Figma: Bucket — Home (node 28:5533)
 */
export function BucketHome({
  variant = "home",
  state = "default",
  title = "Eating out",
  amountLabel = "$232",
  percentLabel = "20% ",
  atRisk = true,
  className,
}: BucketHomeProps) {
  return (
    <div
      className={[
        "flex size-full min-h-[8.5rem] w-full flex-col items-start justify-between rounded-tile bg-budget-sage-panel p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5533"
      data-bucket-variant={variant}
      data-bucket-state={state}
    >
      <div className="flex w-full shrink-0 flex-col items-start">
        <p className="w-full text-label font-semibold text-budget-forest/80">
          {title}
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-col items-start gap-1.5">
        <p className="font-sans-condensed w-full truncate text-2xl tabular-nums text-budget-ink">
          {amountLabel}
        </p>
        <FigmaPercentageTag inverse={false} variant={atRisk ? "atRisk" : "safe"}>
          {percentLabel}
        </FigmaPercentageTag>
      </div>
    </div>
  );
}
