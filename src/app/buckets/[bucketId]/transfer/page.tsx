"use client";

import { useParams } from "next/navigation";
import { BucketTransferForm } from "@/components/bucket-detail";
import { getBucketById } from "@/lib/allocation";
import { useBudgetStore } from "@/state/budget-store";

export default function BucketTransferPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const buckets = useBudgetStore((s) => s.buckets);
  const bucket = getBucketById(buckets, bucketId);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pb-10 pt-6">
        {!bucket ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
            <h1 className="text-lg font-semibold">Bucket not found</h1>
            <p className="mt-1 text-sm text-amber-900/90">
              No bucket matches this link.
            </p>
          </div>
        ) : (
          <BucketTransferForm bucketId={bucketId} />
        )}
      </div>
    </div>
  );
}
