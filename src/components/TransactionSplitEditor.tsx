"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization -- split editor draft sync / validation memo */

import Link from "next/link";
import {
  transactionRoutesApp,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import { MONEY_EPSILON } from "@/lib/constants";
import type { Transaction, TransactionSplit } from "@/lib/types";
import { validateTransactionAllocation } from "@/lib/validation";
import { useBudgetStore } from "@/state/budget-store";

type Props = {
  transactionId: string;
  routes?: TransactionViewRoutes;
};

type DraftRow = { bucketId: string; amountStr: string };

type AllocationMode = "reassign" | "split";

function mergeIntoAmountStr(current: string, add: number): string {
  const base = Number.parseFloat(current);
  const a = Number.isFinite(base) ? base : 0;
  const sum = Math.round((a + add) * 100) / 100;
  return String(sum);
}

/** Full allocation editor (one bucket / split rows). Linked from transaction detail. */
export function TransactionSplitEditor({
  transactionId,
  routes = transactionRoutesApp,
}: Props) {
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const buckets = useBudgetStore((s) => s.buckets);
  const updateTransaction = useBudgetStore((s) => s.updateTransaction);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );

  const [mode, setMode] = useState<AllocationMode>("reassign");
  const [reassignBucketId, setReassignBucketId] = useState("");
  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const savedAllocationFingerprint = useMemo(() => {
    if (!tx) return `missing:${transactionId}`;
    const eff = getEffectiveSplits(tx);
    const part = eff.map((r) => `${r.bucketId}:${r.amount}`).join("|");
    return `${tx.id}|${String(tx.primary_bucket_id ?? "")}|${part}`;
  }, [tx, transactionId]);

  useEffect(() => {
    const current = useBudgetStore
      .getState()
      .transactions.find((t) => t.id === transactionId);
    if (!current) {
      setDraftRows([]);
      setReassignBucketId("");
      return;
    }
    const bucketsNow = useBudgetStore.getState().buckets;
    const sorted = [...bucketsNow].sort((a, b) => a.order - b.order);
    const effective = getEffectiveSplits(current);
    if (effective.length > 1) {
      setMode("split");
      setDraftRows(
        effective.map((s) => ({
          bucketId: s.bucketId,
          amountStr: String(s.amount),
        })),
      );
    } else {
      setMode("reassign");
      const bid = effective[0]?.bucketId ?? sorted[0]?.id ?? "";
      setReassignBucketId(bid);
      setDraftRows([
        {
          bucketId: bid,
          amountStr: String(current.amount),
        },
      ]);
    }
    setSubmitError(null);
  }, [transactionId, savedAllocationFingerprint]);

  const splitSum = useMemo(
    () =>
      draftRows.reduce(
        (s, r) => s + (Number.parseFloat(r.amountStr) || 0),
        0,
      ),
    [draftRows],
  );

  const splitMatchesTotal =
    tx != null && Math.abs(splitSum - tx.amount) <= MONEY_EPSILON;

  const validationMessages = useMemo(() => {
    if (!tx) return [];

    if (sortedBuckets.length === 0) {
      return ["No buckets available. Add a bucket before assigning."];
    }

    if (mode === "reassign") {
      if (!reassignBucketId.trim()) {
        return ["Pick a bucket."];
      }
      const draft: Transaction = {
        ...tx,
        primary_bucket_id: reassignBucketId,
        splits: undefined,
      };
      return validateTransactionAllocation(draft, buckets);
    }

    const parsed = draftRows.map((r) => ({
      bucketId: r.bucketId,
      amount: Number.parseFloat(r.amountStr),
    }));

    if (parsed.length === 0) {
      return ["Add at least one split row."];
    }

    for (const r of parsed) {
      if (!r.bucketId.trim()) {
        return ["Pick a bucket for each row."];
      }
    }

    const splits: TransactionSplit[] = parsed.map((p) => ({
      bucketId: p.bucketId,
      amount: p.amount,
    }));

    const draft: Transaction = {
      ...tx,
      primary_bucket_id: null,
      splits,
    };
    return validateTransactionAllocation(draft, buckets);
  }, [tx, mode, reassignBucketId, draftRows, buckets, sortedBuckets.length]);

  const canSave = validationMessages.length === 0 && tx != null;

  const save = useCallback(() => {
    if (!tx || !canSave) return;

    try {
      if (mode === "reassign") {
        updateTransaction(tx.id, {
          primary_bucket_id: reassignBucketId,
          splits: undefined,
        });
      } else {
        const parsed = draftRows.map((r) => ({
          bucketId: r.bucketId,
          amount: Number.parseFloat(r.amountStr),
        }));
        const splits: TransactionSplit[] = parsed.map((p) => ({
          bucketId: p.bucketId,
          amount: p.amount,
          percentage: tx.amount > 0 ? p.amount / tx.amount : undefined,
        }));
        updateTransaction(tx.id, {
          primary_bucket_id: null,
          splits,
        });
      }
      setSubmitError(null);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not save.");
    }
  }, [
    canSave,
    draftRows,
    mode,
    reassignBucketId,
    tx,
    updateTransaction,
  ]);

  const setSplitMode = useCallback(() => {
    if (!tx) return;
    const id = reassignBucketId || sortedBuckets[0]?.id || "";
    const total = tx.amount;
    const half = Math.round((total / 2) * 100) / 100;
    const rest = Math.round((total - half) * 100) / 100;
    const other =
      sortedBuckets.find((b) => b.id !== id) ?? sortedBuckets[0];
    setMode("split");
    setDraftRows([
      { bucketId: id, amountStr: String(half) },
      {
        bucketId: other?.id ?? "",
        amountStr: String(rest),
      },
    ]);
  }, [reassignBucketId, sortedBuckets, tx]);

  const setReassignMode = useCallback(() => {
    if (!tx) return;
    const firstId =
      draftRows[0]?.bucketId ||
      reassignBucketId ||
      sortedBuckets[0]?.id ||
      "";
    setMode("reassign");
    setReassignBucketId(firstId);
    setDraftRows([
      { bucketId: firstId, amountStr: String(tx.amount) },
    ]);
  }, [draftRows, reassignBucketId, sortedBuckets, tx]);

  const addSplitRow = useCallback(() => {
    if (!tx) return;
    setDraftRows((rows) => {
      if (rows.length === 1) {
        const [r0] = rows;
        const total = tx.amount;
        const half = Math.round((total / 2) * 100) / 100;
        const rest = Math.round((total - half) * 100) / 100;
        const other =
          sortedBuckets.find((b) => b.id !== r0.bucketId) ?? sortedBuckets[0];
        return [
          { bucketId: r0.bucketId, amountStr: String(half) },
          {
            bucketId: other?.id ?? "",
            amountStr: String(rest),
          },
        ];
      }
      const firstId = sortedBuckets[0]?.id ?? "";
      return [...rows, { bucketId: firstId, amountStr: "0" }];
    });
  }, [sortedBuckets, tx]);

  const removeRow = useCallback((index: number) => {
    setDraftRows((rows) => {
      if (rows.length <= 1) return rows;
      const removed = Number.parseFloat(rows[index].amountStr);
      const add = Number.isFinite(removed) ? removed : 0;
      const next = rows.filter((_, i) => i !== index);
      const [head, ...rest] = next;
      if (!head) return rows;
      return [
        {
          ...head,
          amountStr: mergeIntoAmountStr(head.amountStr, add),
        },
        ...rest,
      ];
    });
  }, []);

  if (!tx) {
    return (
      <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
        <div className="mx-auto max-w-md px-4 pb-10 pt-8">
          <p className="text-[#1e0403]/70">Transaction not found.</p>
          <Link
            href={routes.transactionsList}
            className="mt-4 inline-block font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto max-w-md px-4 pb-10 pt-8">
        <nav>
          <Link
            href={routes.transaction(tx.id)}
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Transaction
          </Link>
        </nav>

        <h1 className="mt-6 font-[family-name:var(--font-instrument-serif)] text-2xl text-[#1e1e1e]">
          {tx.merchant || "Transaction"}
        </h1>
        <p className="mt-1 text-sm text-[#1e1e1e]/80">{tx.date}</p>
        <p className="mt-4 text-[48px] font-bold leading-none tracking-tight tabular-nums text-[#1e1e1e]">
          ${tx.amount.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-[#1e0403]/55">
          Amount is fixed; allocations must total this value.
        </p>

        <section className="mt-8 rounded-lg border border-[#bbb] bg-[#efeeea]/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-medium text-[#1e1e1e]">
                Edit allocations
              </h2>
              <p className="mt-1 text-xs text-[#1e0403]/55">
                Reassign the full amount to one bucket, or split across several.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {savedFlash ? (
                <span className="text-xs font-medium text-emerald-800">
                  Saved
                </span>
              ) : null}
              <button
                type="button"
                disabled={!canSave}
                onClick={save}
                className="rounded-lg bg-[#1e0403] px-3 py-1.5 font-mono text-xs font-medium text-[#faf9f6] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>

          <fieldset className="mt-4 flex flex-wrap gap-4 border-0 p-0">
            <legend className="sr-only">Allocation mode</legend>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1e0403]">
              <input
                type="radio"
                name="alloc-mode"
                className="accent-[#1e0403]"
                checked={mode === "reassign"}
                onChange={() => setReassignMode()}
              />
              One bucket
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1e0403]">
              <input
                type="radio"
                name="alloc-mode"
                className="accent-[#1e0403]"
                checked={mode === "split"}
                onChange={() => setSplitMode()}
              />
              Split
            </label>
          </fieldset>

          {(validationMessages.length > 0 || submitError) && (
            <div className="mt-3 space-y-1 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900">
              {validationMessages.map((m) => (
                <p key={m}>{m}</p>
              ))}
              {submitError ? <p>{submitError}</p> : null}
            </div>
          )}

          {mode === "reassign" ? (
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#1e0403]/70">
                Bucket
                <select
                  className="mt-1 w-full max-w-md rounded-lg border border-[#bbb] bg-white px-2 py-2 text-sm text-[#1e0403]"
                  value={reassignBucketId}
                  onChange={(e) => setReassignBucketId(e.target.value)}
                >
                  {sortedBuckets.length === 0 ? (
                    <option value="">—</option>
                  ) : (
                    sortedBuckets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.type === "essential"
                          ? ` · ${b.essential_subtype}`
                          : ""}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <p className="mt-3 text-sm tabular-nums text-[#1e0403]/80">
                Full amount:{" "}
                <span className="font-semibold">${tx.amount.toFixed(2)}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addSplitRow}
                  className="rounded-lg border border-[#bbb] bg-white px-2 py-1 font-mono text-xs font-medium text-[#1e0403] hover:bg-[#faf9f6]"
                >
                  Add split row
                </button>
              </div>

              <ul className="mt-4 space-y-3">
                {draftRows.map((row, index) => (
                  <li
                    key={`split-row-${index}`}
                    className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  >
                    <label className="block flex-1 text-xs font-medium text-[#1e0403]/70">
                      Bucket
                      <select
                        className="mt-1 w-full rounded-lg border border-[#bbb] bg-white px-2 py-2 text-sm text-[#1e0403]"
                        value={row.bucketId}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftRows((rows) =>
                            rows.map((r, i) =>
                              i === index ? { ...r, bucketId: v } : r,
                            ),
                          );
                        }}
                      >
                        {sortedBuckets.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                            {b.type === "essential"
                              ? ` · ${b.essential_subtype}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block w-full sm:w-36 text-xs font-medium text-[#1e0403]/70">
                      Amount
                      <input
                        type="text"
                        inputMode="decimal"
                        className="mt-1 w-full rounded-lg border border-[#bbb] bg-white px-2 py-2 text-sm tabular-nums text-[#1e0403]"
                        value={row.amountStr}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftRows((rows) =>
                            rows.map((r, i) =>
                              i === index ? { ...r, amountStr: v } : r,
                            ),
                          );
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={draftRows.length <= 1}
                      onClick={() => removeRow(index)}
                      className="rounded-lg border border-[#bbb] px-2 py-2 font-mono text-xs font-medium text-[#1e0403]/70 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-[#1e0403]/55">
                Removing a row moves its amount into the first row (adjust as
                needed).
              </p>
              <p
                className={
                  splitMatchesTotal
                    ? "mt-2 text-xs text-[#1e0403]/70"
                    : "mt-2 text-xs font-medium text-red-800"
                }
              >
                Split total:{" "}
                <span className="tabular-nums">${splitSum.toFixed(2)}</span>
                {" · "}
                must equal{" "}
                <span className="tabular-nums">${tx.amount.toFixed(2)}</span>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
