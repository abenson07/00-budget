"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AmountDisplay, Button, Keypad, PageHeader, Sheet } from "@/components/ui";
import { bankedAheadAmount } from "@/lib/bucket-runway";
import { MONEY_EPSILON } from "@/lib/constants";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";
import { HoldToTransferButton } from "./HoldToTransferButton";

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

  const dippingIntoBankedAhead =
    !!fromBucket &&
    fromBucket.type === "discretionary" &&
    bankedAheadAmount(fromBucket) > 0 &&
    fromBucket.amount - amountUsd < (fromBucket.top_off ?? 0);

  const essentialToDiscretionary =
    !!fromBucket &&
    !!toBucket &&
    fromBucket.type === "essential" &&
    toBucket.type === "discretionary";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PageHeader
        size="compact"
        title="Between buckets"
        backHref={appRoutes.bucket(originBucketId)}
        onClose={() => {}}
      />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-1">
        <AmountDisplay value={formatUsd(amountUsd)} sublabel="Total account balance unchanged" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPicker("from")}
          className="relative flex min-h-[6.5rem] flex-col rounded-card bg-budget-lime p-4 text-left text-[#0f0f0f] shadow-card transition-transform active:scale-[0.99]"
        >
          <span className="text-label font-semibold uppercase tracking-wide opacity-80">
            From
          </span>
          <span className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
            {fromBucket?.name ?? "—"}
          </span>
          <span className="mt-auto pt-2 text-lg font-bold tabular-nums">
            {fromBucket ? formatUsd(fromBucket.amount) : "—"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPicker("to")}
          className="relative flex min-h-[6.5rem] flex-col rounded-card bg-budget-forest p-4 text-left text-budget-on-dark shadow-card transition-transform active:scale-[0.99]"
        >
          <span className="text-label font-semibold uppercase tracking-wide opacity-70">
            To
          </span>
          <span className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
            {toBucket?.name ?? "—"}
          </span>
          <span className="mt-auto pt-2 text-lg font-bold tabular-nums">
            {toBucket ? formatUsd(toBucket.amount) : "—"}
          </span>
        </button>
      </div>

      <Keypad
        onDigit={(digit) => appendDigit(Number(digit))}
        onDelete={backspace}
      />

      {transferError ? (
        <p className="text-center text-sm text-red-700">{transferError}</p>
      ) : null}

      <div className="sticky bottom-0 -mx-5 mt-auto bg-budget-page px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        {dippingIntoBankedAhead ? (
          <HoldToTransferButton
            label={`transfer ${formatUsd(amountUsd)}`}
            onConfirm={onConfirmTransfer}
            disabled={!canSubmit}
          />
        ) : essentialToDiscretionary ? (
          <HoldToTransferButton
            label={`transfer ${formatUsd(amountUsd)}`}
            onConfirm={onConfirmTransfer}
            disabled={!canSubmit}
            holdMs={60_000}
          />
        ) : (
          <Button
            variant="primary"
            size="cta"
            fullWidth
            disabled={!canSubmit}
            onClick={onConfirmTransfer}
          >
            Transfer {formatUsd(amountUsd)}
          </Button>
        )}
      </div>

      <Sheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker === "from" ? "Transfer from" : "Transfer to"}
      >
        <ul className="max-h-[min(24rem,70vh)] overflow-y-auto">
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
                  className={`flex min-h-[56px] w-full flex-col items-start justify-center gap-0.5 rounded-control px-4 py-3 text-left transition-colors ${
                    active ? "bg-budget-forest/10" : "hover:bg-black/[0.04]"
                  }`}
                >
                  <span className="text-sm font-medium text-budget-ink">
                    {b.name}
                    {b.id === originBucketId ? (
                      <span className="ml-2 text-xs font-normal text-budget-ink-soft">
                        (from this bucket)
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs tabular-nums text-budget-ink-soft">
                    {formatUsd(b.amount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </div>
  );
}
