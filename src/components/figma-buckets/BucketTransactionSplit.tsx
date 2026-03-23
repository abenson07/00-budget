import { FIGMA_BUCKET_IMG_SPENDING } from "./assets";
import {
  BucketTransaction,
  type BucketTransactionPropsWithState,
} from "./BucketTransaction";

export type BucketTransactionSplitProps = Omit<
  BucketTransactionPropsWithState,
  "split" | "splitLabel" | "state"
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
      state="split"
      splitLabel={splitLabel}
    />
  );
}
