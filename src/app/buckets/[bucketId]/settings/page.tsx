"use client";

import { useParams } from "next/navigation";
import {
  BillSmoothingCard,
  BucketMetadataForm,
  BucketRulesDatesCard,
  GoalContributionCard,
} from "@/components/bucket-detail";
import { PageHeader, PageShell } from "@/components/ui";
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
    <PageShell>
      <PageHeader
        size="compact"
        title={bucket ? "Settings" : undefined}
        backHref={appRoutes.bucket(bucketId)}
      />

      {!bucket ? (
        <div className="rounded-card border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
          <h1 className="text-lg font-semibold">Bucket not found</h1>
          <p className="mt-1 text-sm text-amber-900/90">
            No bucket matches this link.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <BucketRulesDatesCard bucket={bucket} />
          {bucket.type === "essential" && bucket.essential_subtype === "bill" ? (
            <BillSmoothingCard bucket={bucket} />
          ) : null}
          {bucket.type === "discretionary" ? <GoalContributionCard bucket={bucket} /> : null}
          <BucketMetadataForm bucketId={bucketId} bucket={bucket} />
        </div>
      )}
    </PageShell>
  );
}
