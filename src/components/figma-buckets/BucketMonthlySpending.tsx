import { FIGMA_BUCKET_IMG_GROCERIES } from "./assets";
import type { BucketMonthlySpendingState, BucketVariant } from "./bucket-types";
import { FigmaPercentageTag } from "./FigmaPercentageTag";

export type BucketMonthlySpendingProps = {
  variant?: Extract<BucketVariant, "monthlySpending">;
  state?: BucketMonthlySpendingState;
  imageSrc?: string;
  title?: string;
  cadenceLabel?: string;
  balanceLabel?: string;
  percentLabel?: string;
  atRisk?: boolean;
  className?: string;
};

/**
 * Figma: Bucket — Monthly Spending (node 28:5582)
 */
export function BucketMonthlySpending({
  variant = "monthlySpending",
  state = "default",
  imageSrc = FIGMA_BUCKET_IMG_GROCERIES,
  title = "Groceries",
  cadenceLabel = "$400 per paycheck",
  balanceLabel = "$100",
  percentLabel = "20% ",
  atRisk = false,
  className,
}: BucketMonthlySpendingProps) {
  return (
    <div
      className={[
        "flex min-h-[72px] w-full max-w-full items-center rounded-tile bg-budget-sage-panel p-px",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5582"
      data-bucket-variant={variant}
      data-bucket-state={state}
    >
      <div className="flex h-full flex-row items-center self-stretch">
        <div className="flex h-full shrink-0 items-center p-0.5">
          <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
              src={imageSrc}
            />
          </div>
        </div>
      </div>
      <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-4 py-4">
        <div className="flex h-full min-w-0 flex-1 flex-row items-center self-stretch">
          <div className="flex h-full min-w-0 w-full flex-col items-start gap-1 leading-normal not-italic">
            <p className="relative w-full truncate text-xl font-bold text-budget-ink">
              {title}
            </p>
            <p className="relative shrink-0 text-label text-budget-forest opacity-50">
              {cadenceLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-start justify-end gap-2">
          <p className="relative shrink-0 whitespace-nowrap text-amount-lg tabular-nums text-budget-ink">
            {balanceLabel}
          </p>
          <FigmaPercentageTag inverse={false} variant={atRisk ? "atRisk" : "safe"}>
            {percentLabel}
          </FigmaPercentageTag>
        </div>
      </div>
    </div>
  );
}
