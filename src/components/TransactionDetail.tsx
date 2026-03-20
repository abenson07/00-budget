"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import type { TransactionSplit } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";
import { MONEY_EPSILON } from "@/lib/constants";

type Props = { transactionId: string };

type DraftRow = { bucketId: string; amountStr: string };

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

  const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!tx) {
      setDraftRows([]);
      return;
    }
    setDraftRows(
      getEffectiveSplits(tx).map((s) => ({
        bucketId: s.bucketId,
        amountStr: String(s.amount),
      })),
    );
    setError(null);
  }, [tx, transactionId]);

  const applyPatch = useCallback(() => {
    if (!tx) return;

    const parsed = draftRows.map((r) => ({
      bucketId: r.bucketId,
      amount: Number.parseFloat(r.amountStr),
    }));

    for (const r of parsed) {
      if (!r.bucketId.trim()) {
        setError("Pick a bucket for each row.");
        return;
      }
      if (!Number.isFinite(r.amount) || r.amount < 0) {
        setError("Each amount must be a non-negative number.");
        return;
      }
    }

    const bucketIds = parsed.map((r) => r.bucketId);
    if (new Set(bucketIds).size !== bucketIds.length) {
      setError("Use each bucket at most once per transaction.");
      return;
    }

    const sum = parsed.reduce((s, r) => s + r.amount, 0);
    if (Math.abs(sum - tx.amount) > MONEY_EPSILON) {
      setError(
        `Allocations must sum to $${tx.amount.toFixed(2)} (currently $${sum.toFixed(2)}).`,
      );
      return;
    }

    if (parsed.length === 0) {
      setError("Add at least one allocation row.");
      return;
    }

    try {
      if (parsed.length === 1) {
        updateTransaction(tx.id, {
          primary_bucket_id: parsed[0].bucketId,
          splits: undefined,
        });
      } else {
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
      setError(null);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }, [draftRows, tx, updateTransaction]);

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
        Amount is fixed; allocations below must total this value.
      </p>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-medium">Edit allocations</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Split across buckets: add rows so each line&apos;s amount sums to
              the transaction total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedFlash ? (
              <span className="text-xs font-medium text-emerald-700">
                Saved
              </span>
            ) : null}
            <button
              type="button"
              onClick={addSplitRow}
              className="rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Add split
            </button>
            <button
              type="button"
              onClick={applyPatch}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

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

        <p className="mt-4 text-xs text-zinc-500">
          Removing a row adds its amount to the first row so the total stays
          aligned with the transaction.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Sum of rows:{" "}
          <span className="font-medium tabular-nums text-zinc-800">
            $
            {draftRows
              .reduce(
                (s, r) => s + (Number.parseFloat(r.amountStr) || 0),
                0,
              )
              .toFixed(2)}
          </span>{" "}
          · must equal ${tx.amount.toFixed(2)}
        </p>
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
