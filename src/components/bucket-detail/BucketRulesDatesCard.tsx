import { Card, SectionHeading } from "@/components/ui";
import { formatUsd } from "@/lib/format";
import type { Bucket } from "@/lib/types";

type BucketRulesDatesCardProps = { bucket: Bucket };

export function BucketRulesDatesCard({ bucket }: BucketRulesDatesCardProps) {
  return (
    <Card>
      <SectionHeading>Rules &amp; dates</SectionHeading>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-budget-ink-soft">Top off</dt>
          <dd className="font-medium tabular-nums text-budget-ink">
            {bucket.top_off != null ? formatUsd(bucket.top_off) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-budget-ink-soft">Percentage</dt>
          <dd className="font-medium tabular-nums text-budget-ink">
            {bucket.percentage != null
              ? `${(bucket.percentage * 100).toFixed(2)}%`
              : "—"}
          </dd>
        </div>
        {bucket.type === "essential" && bucket.essential_subtype === "bill" ? (
          <>
            <div>
              <dt className="text-budget-ink-soft">Due date</dt>
              <dd className="font-medium text-budget-ink">{bucket.due_date}</dd>
            </div>
            <div>
              <dt className="text-budget-ink-soft">Alert date</dt>
              <dd className="font-medium text-budget-ink">{bucket.alert_date}</dd>
            </div>
          </>
        ) : null}
      </dl>
    </Card>
  );
}
