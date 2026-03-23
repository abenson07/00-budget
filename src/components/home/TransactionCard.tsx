import Link from "next/link";
import { transactionListSplitSubtext } from "@/lib/transaction-row-subtext";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Transaction } from "@/lib/types";

type TransactionCardProps = {
  transaction: Transaction;
};

/** Figma: Bucket – Transaction / Transaction – Split (subtext only when split). */
export function TransactionCard({ transaction: tx }: TransactionCardProps) {
  const initial = (tx.merchant?.trim().slice(0, 1) || "—").toUpperCase();
  const subtext = transactionListSplitSubtext(tx);

  return (
    <Link
      href={appRoutes.transaction(tx.id)}
      className="flex min-h-[72px] items-center gap-3 px-3 py-3 transition-colors active:bg-black/[0.03]"
    >
      <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[var(--budget-sage-panel)] text-base font-semibold text-[var(--budget-forest)] ring-1 ring-[var(--budget-card-border)] ring-inset">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-[var(--budget-ink)]">
          {tx.merchant || "—"}
        </p>
        {subtext != null ? (
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--budget-ink-soft)]">
            {subtext}
          </p>
        ) : null}
      </div>
      <p className="shrink-0 text-lg font-bold tabular-nums text-[var(--budget-ink)]">
        {formatUsd(tx.amount)}
      </p>
    </Link>
  );
}
