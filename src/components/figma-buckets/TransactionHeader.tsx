"use client";

import { MerchantLogo } from "@/components/ui/MerchantLogo";

export type TransactionHeaderVariant = "default";
export type TransactionHeaderState = "default" | "pending";

export type TransactionHeaderProps = {
  /** Component variant label for consistency with other figma components. */
  variant?: TransactionHeaderVariant;
  state?: TransactionHeaderState;
  /** Convenience state prop from spec sheet (`Pending = true|false`). */
  pending?: boolean;
  merchantLabel: string;
  amountLabel: string;
  dateLabel: string;
  timeLabel: string;
  className?: string;
};

export const TRANSACTION_HEADER_REFERENCE = {
  default: {
    variant: "default" as const,
    state: "default" as const,
    pending: false,
    merchantLabel: "Target",
    amountLabel: "$232.24",
    dateLabel: "March 2nd, 2025",
    timeLabel: "3:02pm",
  },
  pending: {
    variant: "default" as const,
    state: "default" as const,
    pending: true,
    merchantLabel: "Target",
    amountLabel: "$232.24",
    dateLabel: "March 2nd, 2025",
    timeLabel: "3:02pm",
  },
};

/**
 * Figma Transaction Header component:
 * - Default: 28:5472
 * - Pending: 28:5496
 */
export function TransactionHeader({
  variant = "default",
  state = "default",
  pending,
  merchantLabel,
  amountLabel,
  dateLabel,
  timeLabel,
  className,
}: TransactionHeaderProps) {
  const resolvedState: TransactionHeaderState = pending
    ? "pending"
    : state;
  const showPendingBadge = resolvedState === "pending";

  return (
    <div
      className={[
        "flex w-full flex-col items-start gap-1 bg-budget-page p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node={showPendingBadge ? "28:5496" : "28:5472"}
      data-transaction-header-variant={variant}
      data-transaction-header-state={resolvedState}
    >
      <div className="flex w-full shrink-0 items-center justify-center py-4">
        <MerchantLogo merchant={merchantLabel} size={62} shape="square" />
      </div>

      <p className="font-display w-full shrink-0 text-title text-budget-ink not-italic">
        {merchantLabel}
      </p>

      <div className="flex w-full shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 shrink flex-col items-start">
          <div className="flex w-full shrink-0 flex-col items-start">
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <p className="font-sans-condensed shrink-0 whitespace-nowrap text-display tabular-nums text-budget-ink not-italic">
                {amountLabel}
              </p>
              {showPendingBadge ? (
                <div className="flex h-full shrink-0 flex-col items-center justify-end">
                  <div className="flex shrink-0 items-center justify-center rounded-pill bg-[var(--budget-tag-neutral-bg)] px-2 py-0.5">
                    <p className="shrink-0 whitespace-nowrap text-label font-normal text-budget-ink not-italic">
                      Pending
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center whitespace-nowrap text-right text-label text-budget-ink not-italic">
          <p className="font-semibold">{dateLabel}</p>
          <p className="font-medium">{timeLabel}</p>
        </div>
      </div>
    </div>
  );
}
