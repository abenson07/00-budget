import type { ReactNode } from "react";
import { formatUsd } from "@/lib/format";

/** Forest “Safe to spend” block — home & buckets header. */
export function TopCardForest({
  formattedSafe,
  balanceAlert,
  className = "",
}: {
  formattedSafe: string;
  balanceAlert: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius-card)] bg-[var(--budget-forest)] px-6 py-7 text-white ${className}`.trim()}
    >
      <p className="font-display text-lg leading-snug text-[var(--budget-mint)]">
        Safe to spend
      </p>
      <p className="mt-2 text-[2.75rem] font-bold leading-none tracking-tight">
        {formattedSafe}
      </p>
      <div className="mt-2">{balanceAlert}</div>
    </section>
  );
}

/** Transactions screen — “Spent this week” summary card. */
export function TopCardSpentThisWeek({
  spentFormatted,
  billsSpentFormatted,
  className = "",
}: {
  spentFormatted: string;
  billsSpentFormatted: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-sage-panel)] px-5 py-5 ${className}`.trim()}
    >
      <p className="text-xs font-medium leading-snug text-[var(--budget-forest)]">
        Spent this week
      </p>
      <p className="font-display mt-1 text-[2.25rem] font-bold leading-none tracking-tight text-[var(--budget-forest)]">
        {spentFormatted}
      </p>
      <p className="mt-3 inline-flex rounded-[var(--radius-pill)] bg-[var(--budget-forest)] px-3 py-1.5 text-xs font-semibold text-white">
        {billsSpentFormatted} spent on bills
      </p>
    </section>
  );
}

type EssentialsHeroTone = "ok" | "atRisk";

/** Essentials list — “Due this week” hero. */
export function TopCardEssentialsDue({
  dueThisWeekFormatted,
  totalReservedFormatted,
  tone,
  statusPill,
  className = "",
}: {
  dueThisWeekFormatted: string;
  totalReservedFormatted: string;
  tone: EssentialsHeroTone;
  statusPill: ReactNode;
  className?: string;
}) {
  const shell =
    tone === "atRisk"
      ? "border-[var(--budget-tag-risk-bg)] bg-[var(--budget-alert-bg)]"
      : "border-[var(--budget-sage-deep)] bg-[var(--budget-sage-panel)]";

  const amountCls =
    tone === "atRisk"
      ? "text-[var(--budget-alert-ink)]"
      : "text-[var(--budget-forest)]";

  return (
    <section
      className={`relative rounded-[var(--radius-card)] border px-5 py-5 ${shell} ${className}`.trim()}
    >
      <p className="text-right text-xs leading-tight text-[var(--budget-ink-soft)]">
        Total reserved
        <br />
        <span className="font-semibold text-[var(--budget-ink)]">
          {totalReservedFormatted}
        </span>
      </p>
      <p className="font-display mt-1 text-sm leading-snug text-[var(--budget-ink)]">
        Due this week
      </p>
      <p
        className={`mt-1 text-[2.25rem] font-bold leading-none tracking-tight ${amountCls}`}
      >
        {dueThisWeekFormatted}
      </p>
      <div className="mt-3">{statusPill}</div>
    </section>
  );
}

/** @deprecated Use TopCardForest — kept for gradual migration of imports. */
export function TopCard({
  formattedSafe,
  balanceAlert,
  variant = "hero",
}: {
  formattedSafe: string;
  balanceAlert: ReactNode;
  essentials?: ReactNode;
  variant?: "hero" | "plain";
}) {
  if (variant === "plain") {
    return (
      <section className="flex w-full flex-col gap-6 text-[var(--budget-ink)]">
        <p className="font-display text-2xl leading-tight">Safe to spend</p>
        <div>
          <p className="text-[48px] font-bold leading-none tracking-tight">
            {formattedSafe}
          </p>
          <div className="mt-2 text-sm text-[var(--budget-ink-soft)]">
            {balanceAlert}
          </div>
        </div>
      </section>
    );
  }

  return (
    <TopCardForest formattedSafe={formattedSafe} balanceAlert={balanceAlert} />
  );
}

/** Format currency for essentials shortfall pill. */
export function formatShortfallPill(shortfall: number): string {
  if (shortfall <= 0) return "Saved and ready";
  return `${formatUsd(shortfall)} short — Transfer money to cover it`;
}
