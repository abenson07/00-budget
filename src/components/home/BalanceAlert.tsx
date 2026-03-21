type BalanceAlertProps = {
  variant?: "dashboardRule" | "paycheck";
  /** When variant is `paycheck`, shown as "~N days until your next paycheck". */
  paycheckDays?: number;
};

/** Small caption under the top-card balance (Figma: BalanceAlert). */
export function BalanceAlert({
  variant = "dashboardRule",
  paycheckDays,
}: BalanceAlertProps) {
  if (variant === "paycheck" && paycheckDays != null) {
    return (
      <p className="mt-2 text-xs opacity-80">
        ~{paycheckDays} days until your next paycheck
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs opacity-80">
      Discretionary buckets and Unassigned — same rule as the legacy dashboard.
    </p>
  );
}
