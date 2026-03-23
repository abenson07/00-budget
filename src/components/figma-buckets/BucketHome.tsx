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
        "flex size-full min-h-[7.5rem] w-full flex-col items-start justify-between rounded-lg bg-[#e6e8dd] p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5533"
      data-bucket-variant={variant}
      data-bucket-state={state}
    >
      <div className="flex w-full shrink-0 flex-col items-start">
        <p className="w-full text-[12px] font-bold leading-normal text-[#1c3812] opacity-80">
          {title}
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-col items-center justify-end">
        <div className="flex w-full shrink-0 items-end justify-between">
          <p className="font-sans-condensed min-h-px min-w-px flex-1 text-[32px] font-bold leading-normal text-[#1b1b1b]">
            {amountLabel}
          </p>
          <FigmaPercentageTag inverse={false} variant={atRisk ? "atRisk" : "safe"}>
            {percentLabel}
          </FigmaPercentageTag>
        </div>
      </div>
    </div>
  );
}
