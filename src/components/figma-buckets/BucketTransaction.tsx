import { FIGMA_BUCKET_IMG_SPENDING } from "./assets";

type BucketTransactionBaseProps = {
  imageSrc?: string;
  title?: string;
  amountLabel?: string;
  className?: string;
};

type BucketTransactionDefaultState = {
  split?: false;
  splitLabel?: string;
};

type BucketTransactionSplitState = {
  split: true;
  splitLabel: string;
};

export type BucketTransactionProps = BucketTransactionBaseProps &
  (BucketTransactionDefaultState | BucketTransactionSplitState);

/**
 * Figma: Bucket — Transaction (node 28:5675)
 */
export function BucketTransaction({
  imageSrc = FIGMA_BUCKET_IMG_SPENDING,
  title = "Groceries",
  amountLabel = "$45.23",
  split = false,
  splitLabel = "12% of transaction",
  className,
}: BucketTransactionProps) {
  return (
    <div
      className={[
        "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5675"
    >
      <div className="relative flex h-full shrink-0 items-center p-0.5">
        <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
          <img
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
            src={imageSrc}
          />
        </div>
      </div>
      <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
        <div className="flex h-full flex-row items-center self-stretch">
          <div className="flex h-full shrink-0 flex-col items-start gap-1 whitespace-nowrap leading-normal not-italic">
            <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
              {title}
            </p>
            {split ? (
              <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
                {splitLabel}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-start justify-end">
          <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
            {amountLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
