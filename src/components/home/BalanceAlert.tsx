type BalanceAlertProps = {
  variant?: "dashboardRule" | "paycheck";
  /** When variant is `paycheck`, shown under the balance. */
  paycheckDays?: number;
  /** Optional “per day” line, e.g. formatted currency. */
  perDayFormatted?: string;
};

/** Caption under the safe-to-spend / top-card balance. */
export function BalanceAlert({
  variant = "dashboardRule",
  paycheckDays,
  perDayFormatted,
}: BalanceAlertProps) {
  if (variant === "paycheck" && paycheckDays != null) {
    const daysPart = `~${paycheckDays} days until your next paycheck`;
    const second =
      perDayFormatted != null && perDayFormatted.trim() !== ""
        ? ` · ${perDayFormatted} per day`
        : "";
    return (
      <p className="text-xs leading-relaxed text-white/85">
        {daysPart}
        {second}
      </p>
    );
  }

  return (
    <p className="text-xs leading-relaxed text-white/85">
      Discretionary buckets and Unassigned — same rule as the legacy dashboard.
    </p>
  );
}
