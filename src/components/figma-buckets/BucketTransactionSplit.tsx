import { FIGMA_BUCKET_IMG_SPENDING } from "./assets";
import { BucketTransaction, type BucketTransactionProps } from "./BucketTransaction";

export type BucketTransactionSplitProps = Omit<
  BucketTransactionProps,
  "split" | "splitLabel"
> & {
  splitLabel?: string;
};

/**
 * Figma: Bucket — Transaction — Split (node 28:5694)
 */
export function BucketTransactionSplit({
  imageSrc = FIGMA_BUCKET_IMG_SPENDING,
  splitLabel = "12% of transaction",
  className,
  ...props
}: BucketTransactionSplitProps) {
  return (
    <BucketTransaction
      {...props}
      className={className}
      imageSrc={imageSrc}
      split
      splitLabel={splitLabel}
    />
  );
}
