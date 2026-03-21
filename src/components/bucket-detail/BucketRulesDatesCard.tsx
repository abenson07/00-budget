import { formatUsd } from "@/lib/format";
import type { Bucket } from "@/lib/types";

type BucketRulesDatesCardProps = { bucket: Bucket };

export function BucketRulesDatesCard({ bucket }: BucketRulesDatesCardProps) {
  return (
    <section className="rounded-lg border border-[#bbb] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1e1e1e]">Rules &amp; dates</h2>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[#1e0403]/55">Top off</dt>
          <dd className="font-medium tabular-nums text-[#222]">
            {bucket.top_off != null ? formatUsd(bucket.top_off) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[#1e0403]/55">Percentage</dt>
          <dd className="font-medium tabular-nums text-[#222]">
            {bucket.percentage != null
              ? `${(bucket.percentage * 100).toFixed(2)}%`
              : "—"}
          </dd>
        </div>
        {bucket.type === "essential" && bucket.essential_subtype === "bill" ? (
          <>
            <div>
              <dt className="text-[#1e0403]/55">Due date</dt>
              <dd className="font-medium text-[#222]">{bucket.due_date}</dd>
            </div>
            <div>
              <dt className="text-[#1e0403]/55">Alert date</dt>
              <dd className="font-medium text-[#222]">{bucket.alert_date}</dd>
            </div>
          </>
        ) : null}
      </dl>
    </section>
  );
}
