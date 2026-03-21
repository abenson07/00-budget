"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { formatUsd } from "@/lib/format";
import { useBudgetStore } from "@/state/budget-store";

function labelClass() {
  return "block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55";
}

function inputClass() {
  return "mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm text-[#222] shadow-sm focus:border-[#1e0403]/40 focus:outline-none focus:ring-1 focus:ring-[#1e0403]/25";
}

type BucketTransferFormProps = { bucketId: string };

export function BucketTransferForm({ bucketId }: BucketTransferFormProps) {
  const buckets = useBudgetStore((s) => s.buckets);
  const transferAction = useBudgetStore((s) => s.transferBetweenBuckets);

  const otherBuckets = useMemo(
    () =>
      buckets
        .filter((b) => b.id !== bucketId)
        .sort((a, b) => a.order - b.order),
    [buckets, bucketId],
  );

  const [toBucketId, setToBucketId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    if (!otherBuckets.length) {
      setToBucketId("");
      return;
    }
    setToBucketId((prev) =>
      prev && otherBuckets.some((b) => b.id === prev)
        ? prev
        : otherBuckets[0]!.id,
    );
  }, [bucketId, otherBuckets]);

  const onTransfer = (e: FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    const amt = Number(transferAmount);
    try {
      transferAction(bucketId, toBucketId, amt);
      setTransferAmount("");
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : String(err));
    }
  };

  if (otherBuckets.length === 0) {
    return (
      <p className="text-sm text-[#1e0403]/65">
        Add another bucket to move balance between buckets.
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={onTransfer}>
      <p className="text-xs text-[#1e0403]/65">
        Moves balance between buckets only; total account balance stays the
        same. Source cannot go negative.
      </p>
      <div>
        <label htmlFor="to-bucket" className={labelClass()}>
          Destination
        </label>
        <select
          id="to-bucket"
          className={inputClass()}
          value={toBucketId}
          onChange={(e) => setToBucketId(e.target.value)}
        >
          {otherBuckets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({formatUsd(b.amount)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="xfer-amt" className={labelClass()}>
          Amount (USD)
        </label>
        <input
          id="xfer-amt"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className={inputClass()}
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      {transferError ? (
        <p className="text-sm text-red-700">{transferError}</p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-lg bg-[#1e1e1e] px-4 py-2.5 text-sm font-medium text-white transition-opacity active:opacity-90"
      >
        Transfer
      </button>
    </form>
  );
}
