"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BucketMetadataForm,
  BucketRulesDatesCard,
} from "@/components/bucket-detail";
import { getBucketById } from "@/lib/allocation";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function BucketSettingsPage() {
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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav className="flex flex-col gap-2">
          <Link
            href={appRoutes.bucket(bucketId)}
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← {bucket?.name ?? "Bucket"}
          </Link>
        </nav>

        {bucket ? (
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-[#1e1e1e]">
            Settings
          </h1>
        ) : null}

        {!bucket ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
            <h1 className="text-lg font-semibold">Bucket not found</h1>
            <p className="mt-1 text-sm text-amber-900/90">
              No bucket matches this link.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <BucketRulesDatesCard bucket={bucket} />
            <BucketMetadataForm bucketId={bucketId} bucket={bucket} />
          </div>
        )}
      </div>
    </div>
  );
}
