import type { PercentageTagVariant } from "@/lib/bucket-percentage-tag";

type PercentageTagProps = {
  variant: PercentageTagVariant;
  inverse?: boolean;
  children: string;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-bold tabular-nums leading-none tracking-tight";

export function PercentageTag({
  variant,
  inverse = false,
  children,
  className = "",
}: PercentageTagProps) {
  const styles: Record<PercentageTagVariant, { on: string; inv: string }> = {
    safe: {
      on: "bg-[var(--budget-tag-safe-bg)] text-[var(--budget-tag-safe-fg)]",
      inv:
        "bg-[var(--budget-tag-safe-inverse-bg)] text-[var(--budget-tag-safe-inverse-fg)]",
    },
    atRisk: {
      on: "bg-[var(--budget-tag-risk-bg)] text-[var(--budget-tag-risk-fg)]",
      inv:
        "bg-[var(--budget-tag-risk-inverse-bg)] text-[var(--budget-tag-risk-inverse-fg)]",
    },
    noValue: {
      on: "bg-[var(--budget-tag-neutral-bg)] text-[var(--budget-tag-neutral-fg)]",
      inv: "bg-[#6b7280] text-white",
    },
  };

  const cls = inverse ? styles[variant].inv : styles[variant].on;

  return (
    <span className={`${base} ${cls} ${className}`.trim()}>{children}</span>
  );
}
