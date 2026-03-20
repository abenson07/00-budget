"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import type { TransactionSplit } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";
import { MONEY_EPSILON } from "@/lib/constants";

type Props = { transactionId: string };

type DraftRow = { bucketId: string; amountStr: string };

type AllocationMode = "reassign" | "split";

function mergeIntoAmountStr(current: string, add: number): string {
  const base = Number.parseFloat(current);
  const a = Number.isFinite(base) ? base : 0;
  const sum = Math.round((a + add) * 100) / 100;
  return String(sum);
}

export function TransactionDetail({ transactionId }: Props) {
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const buckets = useBudgetStore((s) => s.buckets);
  const updateTransaction = useBudgetStore((s) => s.updateTransaction);
  const getBucketById = useBudgetStore((s) => s.getBucketById);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );

  const bucketIdSet = useMemo(
    () => new Set(buckets.map((b) => b.id)),
    [buckets],
  );

  const [mode, setMode] = useState<AllocationMode>("reassign");
  const [reassignBucketId, setReassignBucketId] = useState("");
  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  /** Only changes when saved allocation on the server/store changes — not on every zustand re-render or buckets ref change. */
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
    const msgs: string[] = [];
    if (!tx) return msgs;

    if (sortedBuckets.length === 0) {
      msgs.push("No buckets available. Add a bucket before assigning.");
      return msgs;
    }

    if (mode === "reassign") {
      if (!reassignBucketId.trim()) {
        msgs.push("Pick a bucket.");
      } else if (!bucketIdSet.has(reassignBucketId)) {
        msgs.push("Selected bucket no longer exists. Choose another.");
      }
      return msgs;
    }

    const parsed = draftRows.map((r) => ({
      bucketId: r.bucketId,
      amount: Number.parseFloat(r.amountStr),
    }));

    if (parsed.length === 0) {
      msgs.push("Add at least one split row.");
      return msgs;
    }

    for (const r of parsed) {
      if (!r.bucketId.trim()) {
        msgs.push("Pick a bucket for each row.");
        break;
      }
      if (!bucketIdSet.has(r.bucketId)) {
        msgs.push("One or more rows reference a bucket that no longer exists.");
        break;
      }
      if (!Number.isFinite(r.amount) || r.amount < 0) {
        msgs.push("Each amount must be a non-negative number.");
        break;
      }
    }

    const bucketIds = parsed.map((r) => r.bucketId).filter(Boolean);
    if (new Set(bucketIds).size !== bucketIds.length) {
      msgs.push("Use each bucket at most once per transaction.");
    }

    if (!splitMatchesTotal) {
      msgs.push(
        `Split total must equal $${tx.amount.toFixed(2)} (currently $${splitSum.toFixed(2)}).`,
      );
    }

    return msgs;
  }, [
    tx,
    mode,
    reassignBucketId,
    draftRows,
    bucketIdSet,
    sortedBuckets.length,
    splitMatchesTotal,
    splitSum,
  ]);

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
      <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
        <p className="text-zinc-600">Transaction not found.</p>
        <Link
          href="/transactions"
          className="mt-4 inline-block text-sm font-medium text-zinc-700 underline"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const liveSplits = getEffectiveSplits(tx);

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
      <Link
        href="/transactions"
        className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
      >
        ← Transactions
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {tx.merchant}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">{tx.date}</p>
      <p className="mt-4 text-3xl font-semibold tabular-nums">
        ${tx.amount.toFixed(2)}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Amount is fixed; allocations must total this value.
      </p>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">Edit allocations</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Reassign the full amount to one bucket, or split across several.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {savedFlash ? (
              <span className="text-xs font-medium text-emerald-700">
                Saved
              </span>
            ) : null}
            <button
              type="button"
              disabled={!canSave}
              onClick={save}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>

        <fieldset className="mt-4 flex flex-wrap gap-4 border-0 p-0">
          <legend className="sr-only">Allocation mode</legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
            <input
              type="radio"
              name="alloc-mode"
              className="accent-zinc-900"
              checked={mode === "reassign"}
              onChange={() => setReassignMode()}
            />
            One bucket
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
            <input
              type="radio"
              name="alloc-mode"
              className="accent-zinc-900"
              checked={mode === "split"}
              onChange={() => setSplitMode()}
            />
            Split
          </label>
        </fieldset>

        {(validationMessages.length > 0 || submitError) && (
          <div className="mt-3 space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {validationMessages.map((m) => (
              <p key={m}>{m}</p>
            ))}
            {submitError ? <p>{submitError}</p> : null}
          </div>
        )}

        {mode === "reassign" ? (
          <div className="mt-4">
            <label className="block text-xs font-medium text-zinc-600">
              Bucket
              <select
                className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900"
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
            <p className="mt-3 text-sm tabular-nums text-zinc-700">
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
                className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
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
                  <label className="block flex-1 text-xs font-medium text-zinc-600">
                    Bucket
                    <select
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900"
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
                  <label className="block w-full sm:w-36 text-xs font-medium text-zinc-600">
                    Amount
                    <input
                      type="text"
                      inputMode="decimal"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm tabular-nums text-zinc-900"
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
                    className="rounded-md border border-zinc-200 px-2 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-xs text-zinc-500">
              Removing a row moves its amount into the first row (adjust as
              needed).
            </p>
            <p
              className={
                splitMatchesTotal
                  ? "mt-2 text-xs text-zinc-600"
                  : "mt-2 text-xs font-medium text-red-700"
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

      <h2 className="mt-8 text-lg font-medium">Current (saved)</h2>
      {liveSplits.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No allocation rows.</p>
      ) : (
        <ul className="mt-3 divide-y rounded-lg border border-zinc-200 bg-white">
          {liveSplits.map((row) => {
            const bucket = getBucketById(row.bucketId);
            const pct =
              row.percentage != null
                ? `${(row.percentage * 100).toFixed(1)}%`
                : tx.amount > 0
                  ? `${((row.amount / tx.amount) * 100).toFixed(1)}%`
                  : "—";
            return (
              <li
                key={row.bucketId}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="font-medium">
                  {bucket?.name ?? row.bucketId}
                  {!bucket ? (
                    <span className="ml-2 text-xs font-normal text-red-600">
                      (unknown bucket)
                    </span>
                  ) : null}
                </span>
                <span className="text-right text-sm tabular-nums text-zinc-700">
                  ${row.amount.toFixed(2)}
                  <span className="ml-2 text-xs text-zinc-500">({pct})</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
