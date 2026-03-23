import { FIGMA_BUCKET_IMG_GROCERIES, FIGMA_BUCKET_LOCK_ICON } from "./assets";
import { BucketSpendingMoney, type BucketSpendingMoneyProps } from "./BucketSpendingMoney";

export type BucketSpendingMoneyLockedProps = Omit<
  BucketSpendingMoneyProps,
  "locked"
>;

/**
 * Figma: Bucket — Spending Money — Locked (node 28:5566)
 */
export function BucketSpendingMoneyLocked({
  imageSrc = FIGMA_BUCKET_IMG_GROCERIES,
  lockIconSrc = FIGMA_BUCKET_LOCK_ICON,
  atRisk = true,
  className,
  title = "Date night",
  cadenceLabel = "$400 per paycheck",
  balanceLabel = "$100",
  percentLabel = "20% ",
  ...props
}: BucketSpendingMoneyLockedProps) {
  return (
    <BucketSpendingMoney
      {...props}
      atRisk={atRisk}
      balanceLabel={balanceLabel}
      cadenceLabel={cadenceLabel}
      className={className}
      imageSrc={imageSrc}
      lockIconSrc={lockIconSrc}
      locked
      state="locked"
      percentLabel={percentLabel}
      title={title}
    />
  );
}
