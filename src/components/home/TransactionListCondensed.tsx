import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import { txAllocationLabel } from "@/lib/tx-allocation-label";
import type { Bucket, Transaction } from "@/lib/types";
import { TransactionCard } from "./TransactionCard";

type TransactionListCondensedProps = {
  transactions: Transaction[];
  getBucketById: (id: string) => Bucket | undefined;
};

/** Transactions section on mobile home (Figma: TransactionList / Condensed). */
export function TransactionListCondensed({
  transactions,
  getBucketById,
}: TransactionListCondensedProps) {
  return (
    <section className="flex flex-col gap-3.5">
      <Link
        href={appRoutes.transactions}
        className="flex items-center justify-between px-4"
      >
        <span className="text-xs font-bold tracking-wide text-black">
          Transactions
        </span>
        <span aria-hidden className="text-lg text-[#222]">
          →
        </span>
      </Link>

      {transactions.length === 0 ? (
        <p className="px-4 text-sm text-[#1e0403]/60">
          No transactions yet.{" "}
          <Link
            href={appRoutes.transactions}
            className="font-medium text-[#1e0403] underline underline-offset-2"
          >
            Transactions
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <TransactionCard
                transaction={tx}
                allocationLabel={txAllocationLabel(tx, getBucketById)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
