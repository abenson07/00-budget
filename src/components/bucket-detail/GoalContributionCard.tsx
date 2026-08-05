import { Card, SectionHeading } from "@/components/ui";
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
    <Card>
      <SectionHeading>Goal contribution</SectionHeading>
      <p className="mt-1 text-xs text-budget-ink-soft">
        {daysUntil} days and {paychecksUntil} paychecks until your goal date.
      </p>
      <p className="mt-2 text-amount-lg tabular-nums text-budget-ink">
        {formatUsd(perPaycheck)}{" "}
        <span className="text-sm font-normal text-budget-ink-soft">per paycheck</span>
      </p>
    </Card>
  );
}
