import { FIGMA_BUCKET_IMG_SPENDING, FIGMA_BUCKET_LOCK_ICON } from "./assets";
import { FigmaPercentageTag } from "./FigmaPercentageTag";

export type BucketSpendingMoneyProps = {
  imageSrc?: string;
  lockIconSrc?: string;
  title?: string;
  cadenceLabel?: string;
  balanceLabel?: string;
  percentLabel?: string;
  locked?: boolean;
  atRisk?: boolean;
  className?: string;
};

/**
 * Figma: Bucket — Spending Money (node 28:5541)
 */
export function BucketSpendingMoney({
  imageSrc = FIGMA_BUCKET_IMG_SPENDING,
  lockIconSrc = FIGMA_BUCKET_LOCK_ICON,
  title = "Eating out",
  cadenceLabel = "$200 per paycheck",
  balanceLabel = "$41",
  percentLabel = "40% ",
  locked = false,
  atRisk = false,
  className,
}: BucketSpendingMoneyProps) {
  return (
    <div
      className={[
        "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5541"
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
      <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
        <div className="flex h-full flex-row items-center self-stretch">
          <div className="flex h-full shrink-0 flex-col items-start gap-1 leading-normal not-italic">
            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <p className="relative shrink-0 text-[24px] font-bold text-[#1b1b1b]">
                {title}
              </p>
              {locked ? (
                <img
                  alt=""
                  className="size-4 shrink-0"
                  src={lockIconSrc}
                />
              ) : null}
            </div>
            <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
              {cadenceLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-start justify-end gap-2">
          <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
            {balanceLabel}
          </p>
          <FigmaPercentageTag variant={atRisk ? "at-risk-default" : "safe-default"}>
            {percentLabel}
          </FigmaPercentageTag>
        </div>
      </div>
    </div>
  );
}
