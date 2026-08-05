"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TOP_CARD_TRANSACTION_REFERENCE,
  TopCardTransaction,
} from "@/components/figma-buckets";
import { Chip, ListRow, PageHeader, PageShell, SectionHeading } from "@/components/ui";
import { getEffectiveSplits } from "@/lib/allocation";
import { unmatchedTransactions } from "@/lib/merchant-matching";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";
import { useMerchantRulesStore } from "@/state/merchant-rules-store";

/** Full transactions list (Figma: Transactions / mobile screen). */
export function TransactionsScreen() {
  const transactions = useBudgetStore((s) => s.transactions);
  const buckets = useBudgetStore((s) => s.buckets);
  const runAutoMatch = useMerchantRulesStore((s) => s.runAutoMatch);
  const [filter, setFilter] = useState<"all" | "unmatched">("all");

  useEffect(() => {
    runAutoMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );
  const visible = useMemo(
    () => (filter === "unmatched" ? unmatchedTransactions(sorted) : sorted),
    [filter, sorted],
  );

  return (
    <PageShell>
      <PageHeader title="Transactions" />
      <TopCardTransaction {...TOP_CARD_TRANSACTION_REFERENCE} />

      <section className="flex flex-col gap-4">
        <SectionHeading>Money spent</SectionHeading>

        <div className="flex gap-2">
          {(["all", "unmatched"] as const).map((f) => (
            <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : "Unmatched"}
            </Chip>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-budget-ink-soft">
            {filter === "unmatched" ? "No unmatched transactions." : "No transactions yet."}
          </p>
        ) : (
          <div className="border-y border-budget-hairline">
            {visible.map((tx, index) => {
              const firstSplit = getEffectiveSplits(tx)[0];
              const bucket = firstSplit
                ? buckets.find((item) => item.id === firstSplit.bucketId)
                : undefined;
              const bucketName = bucket?.name ?? "Unassigned";
              return (
                <ListRow
                  key={tx.id}
                  href={appRoutes.transaction(tx.id)}
                  title={tx.merchant || "Target"}
                  subtitle={bucketName}
                  amount={`$${Math.round(tx.amount)}`}
                  divider={index < visible.length - 1}
                />
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
