import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import { formatUsd } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type BucketAllocationTransactionRowProps = {
  transaction: Transaction;
  allocationLabel: string;
  /** Amount allocated to this bucket (split or full). */
  bucketAmount: number;
};

export function BucketAllocationTransactionRow({
  transaction: tx,
  allocationLabel,
  bucketAmount,
}: BucketAllocationTransactionRowProps) {
  return (
    <Link
      href={appRoutes.transaction(tx.id)}
      className="flex items-start justify-between gap-3 rounded-lg px-4 py-3 transition-colors active:bg-black/[0.04]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-medium text-[#222]">
          {tx.merchant || "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-[#1e0403]/50">
          {allocationLabel}
        </p>
      </div>
      <p className="shrink-0 text-2xl font-semibold text-[#222]">
        {formatUsd(bucketAmount)}
      </p>
    </Link>
  );
}
