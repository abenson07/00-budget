"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MONEY_EPSILON } from "@/lib/constants";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";

const MAX_INPUT_CENTS = 999_999_999_99;

function sortBucketsOriginFirst(
  list: Bucket[],
  originBucketId: string,
): Bucket[] {
  return [...list].sort((a, b) => {
    const aOrigin = a.id === originBucketId ? 0 : 1;
    const bOrigin = b.id === originBucketId ? 0 : 1;
    if (aOrigin !== bOrigin) return aOrigin - bOrigin;
    return a.order - b.order;
  });
}

type BucketTransferFormProps = { bucketId: string };

export function BucketTransferForm({ bucketId: originBucketId }: BucketTransferFormProps) {
  const buckets = useBudgetStore((s) => s.buckets);
  const transferAction = useBudgetStore((s) => s.transferBetweenBuckets);

  const [fromBucketId, setFromBucketId] = useState(originBucketId);
  const [toBucketId, setToBucketId] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [picker, setPicker] = useState<null | "from" | "to">(null);

  const fromBucket = buckets.find((b) => b.id === fromBucketId);
  const toBucket = buckets.find((b) => b.id === toBucketId);

  const pickerBuckets = useMemo(() => {
    const exclude =
      picker === "from" ? toBucketId : picker === "to" ? fromBucketId : "";
    return sortBucketsOriginFirst(
      buckets.filter((b) => b.id !== exclude),
      originBucketId,
    );
  }, [buckets, picker, fromBucketId, toBucketId, originBucketId]);

  useEffect(() => {
    setFromBucketId(originBucketId);
  }, [originBucketId]);

  useEffect(() => {
    const candidates = sortBucketsOriginFirst(
      buckets.filter((b) => b.id !== fromBucketId),
      originBucketId,
    );
    setToBucketId((prev) => {
      if (candidates.length === 0) return "";
      if (prev && candidates.some((b) => b.id === prev)) return prev;
      return candidates[0]!.id;
    });
  }, [buckets, fromBucketId, originBucketId]);

  const amountUsd = amountCents / 100;

  const appendDigit = useCallback((d: number) => {
    setAmountCents((c) => {
      const next = c * 10 + d;
      return next > MAX_INPUT_CENTS ? c : next;
    });
  }, []);

  const backspace = useCallback(() => {
    setAmountCents((c) => Math.floor(c / 10));
  }, []);

  const onConfirmTransfer = useCallback(() => {
    setTransferError(null);
    try {
      transferAction(fromBucketId, toBucketId, amountUsd);
      setAmountCents(0);
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : String(err));
    }
  }, [transferAction, fromBucketId, toBucketId, amountUsd]);

  const selectBucket = useCallback(
    (id: string) => {
      if (picker === "from") {
        setFromBucketId(id);
        if (id === toBucketId) {
          const next = sortBucketsOriginFirst(
            buckets.filter((b) => b.id !== id),
            originBucketId,
          )[0];
          if (next) setToBucketId(next.id);
        }
      } else if (picker === "to") {
        setToBucketId(id);
        if (id === fromBucketId) {
          const next = sortBucketsOriginFirst(
            buckets.filter((b) => b.id !== id),
            originBucketId,
          )[0];
          if (next) setFromBucketId(next.id);
        }
      }
      setPicker(null);
    },
    [picker, toBucketId, fromBucketId, buckets, originBucketId],
  );

  if (buckets.length < 2) {
    return (
      <p className="text-sm text-[#1e0403]/65">
        Add another bucket to move balance between buckets.
      </p>
    );
  }

  const canSubmit =
    amountUsd > MONEY_EPSILON &&
    fromBucketId !== toBucketId &&
    !!fromBucket &&
    !!toBucket;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <Link
          href={appRoutes.bucket(originBucketId)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-[#1b1b1b] transition-colors hover:bg-black/5"
          aria-label="Back"
        >
          ‹
        </Link>
        <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1b1b1b]">
          Between buckets
        </h2>
        <Link
          href={appRoutes.bucket(originBucketId)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[#1b1b1b] transition-colors hover:bg-black/5"
          aria-label="Close"
        >
          ×
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-1">
        <p className="text-[2.5rem] font-bold leading-none tracking-tight tabular-nums text-[#1b1b1b]">
          {formatUsd(amountUsd)}
        </p>
        <p className="text-sm text-[#1e0403]/45">
          Total account balance unchanged
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPicker("from")}
          className="relative flex min-h-[7.5rem] flex-col rounded-2xl bg-[#d4ea3a] p-3.5 text-left text-[#0f0f0f] shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
            From
          </span>
          <span className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
            {fromBucket?.name ?? "—"}
          </span>
          <span className="mt-auto pt-2 text-lg font-bold tabular-nums">
            {fromBucket ? formatUsd(fromBucket.amount) : "—"}
          </span>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold opacity-35"
            aria-hidden
          >
            ⋮
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPicker("to")}
          className="relative flex min-h-[7.5rem] flex-col rounded-2xl bg-[#0f0f0f] p-3.5 text-left text-white shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
            To
          </span>
          <span className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
            {toBucket?.name ?? "—"}
          </span>
          <span className="mt-auto pt-2 text-lg font-bold tabular-nums">
            {toBucket ? formatUsd(toBucket.amount) : "—"}
          </span>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold text-white/35"
            aria-hidden
          >
            ⋮
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => appendDigit(n)}
            className="rounded-full border border-[#ddd] bg-white py-3.5 text-lg font-semibold text-[#1b1b1b] shadow-sm transition-colors hover:bg-[#f7f7f4] active:bg-[#efeeea]"
          >
            {n}
          </button>
        ))}
        <div aria-hidden className="py-3.5" />
        <button
          type="button"
          onClick={() => appendDigit(0)}
          className="rounded-full border border-[#ddd] bg-white py-3.5 text-lg font-semibold text-[#1b1b1b] shadow-sm transition-colors hover:bg-[#f7f7f4] active:bg-[#efeeea]"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          className="rounded-full border border-[#ddd] bg-white py-3.5 text-lg font-semibold text-[#1b1b1b] shadow-sm transition-colors hover:bg-[#f7f7f4] active:bg-[#efeeea]"
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {transferError ? (
        <p className="text-center text-sm text-red-700">{transferError}</p>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onConfirmTransfer}
        className="w-full rounded-2xl bg-[#0f0f0f] py-4 text-center text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35 active:opacity-90"
      >
        Transfer {formatUsd(amountUsd)}
      </button>

      {picker ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={picker === "from" ? "Choose source bucket" : "Choose destination bucket"}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Dismiss"
            onClick={() => setPicker(null)}
          />
          <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl bg-[#faf9f6] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e4e0] px-4 py-3">
              <span className="text-sm font-semibold text-[#1b1b1b]">
                {picker === "from" ? "Transfer from" : "Transfer to"}
              </span>
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="rounded-full px-2 py-1 text-sm text-[#1e0403]/60 hover:bg-black/5"
              >
                Done
              </button>
            </div>
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto py-1">
              {pickerBuckets.map((b) => {
                const active =
                  picker === "from"
                    ? b.id === fromBucketId
                    : b.id === toBucketId;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => selectBucket(b.id)}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors ${
                        active ? "bg-[#1e0403]/8" : "hover:bg-black/[0.04]"
                      }`}
                    >
                      <span className="text-sm font-medium text-[#1b1b1b]">
                        {b.name}
                        {b.id === originBucketId ? (
                          <span className="ml-2 text-xs font-normal text-[#1e0403]/45">
                            (from this bucket)
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs tabular-nums text-[#1e0403]/55">
                        {formatUsd(b.amount)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
