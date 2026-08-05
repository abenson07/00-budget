import { biweeklyPerPaycheckAmount } from "@/lib/biweekly-savings-breakdown";
import { formatUsd } from "@/lib/format";
import type { DiscretionaryBucket } from "@/lib/types";

export function GoalContributionCard({ bucket }: { bucket: DiscretionaryBucket }) {
  if (bucket.top_off == null || !bucket.goal_target_date) return null;
  const { perPaycheck, paychecksUntil, daysUntil } = biweeklyPerPaycheckAmount(
    bucket.top_off,
    bucket.goal_target_date,
  );
  return (
    <section className="rounded-lg border border-[#bbb] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1e1e1e]">Goal contribution</h2>
      <p className="mt-1 text-xs text-[#1e0403]/65">
        {daysUntil} days and {paychecksUntil} paychecks until your goal date.
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#222]">
        {formatUsd(perPaycheck)}{" "}
        <span className="text-sm font-normal text-[#1e0403]/55">per paycheck</span>
      </p>
    </section>
  );
}
