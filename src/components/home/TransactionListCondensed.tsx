import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import type { Transaction } from "@/lib/types";
import { TransactionCard } from "./TransactionCard";

type TransactionListCondensedProps = {
  transactions: Transaction[];
};

/** Transactions section on mobile home (Figma: TransactionList / Condensed). */
export function TransactionListCondensed({
  transactions,
}: TransactionListCondensedProps) {
  return (
    <section className="flex flex-col gap-3.5">
      <Link
        href={appRoutes.transactions}
        className="flex items-center justify-between px-1"
      >
        <span className="font-display text-lg text-[var(--budget-forest)]">
          Transactions
        </span>
        <span aria-hidden className="text-[var(--budget-ink-soft)]">
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
              <TransactionCard transaction={tx} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
