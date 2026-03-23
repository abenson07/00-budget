"use client";

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
  imageSrc?: string;
  className?: string;
};

const FIGMA_TRANSACTION_HEADER_IMAGE =
  "http://localhost:3845/assets/119f60c39c28e556ed73a7a1b7c6b323ae5ec9c6.png";

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
  imageSrc = FIGMA_TRANSACTION_HEADER_IMAGE,
  className,
}: TransactionHeaderProps) {
  const resolvedState: TransactionHeaderState = pending
    ? "pending"
    : state;
  const showPendingBadge = resolvedState === "pending";

  return (
    <div
      className={[
        "flex w-full max-w-[408px] flex-col items-start gap-1 bg-[#faf9f6] p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node={showPendingBadge ? "28:5496" : "28:5472"}
      data-transaction-header-variant={variant}
      data-transaction-header-state={resolvedState}
    >
      <div className="flex w-full shrink-0 items-center justify-center py-4">
        <div className="relative size-[62px] shrink-0 rounded-lg">
          <img
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-lg object-cover"
            src={imageSrc}
          />
        </div>
      </div>

      <p className="font-display w-[285px] shrink-0 text-[28px] leading-normal text-[#222] not-italic">
        {merchantLabel}
      </p>

      <div className="flex w-full shrink-0 items-start justify-between">
        <div className="flex w-[182px] shrink-0 flex-col items-start">
          <div className="flex w-full shrink-0 flex-col items-start">
            <div className="flex shrink-0 items-center justify-center gap-2">
              <p className="shrink-0 whitespace-nowrap text-[48px] font-bold leading-normal text-[#222] not-italic">
                {amountLabel}
              </p>
              {showPendingBadge ? (
                <div className="flex h-full shrink-0 flex-col items-center justify-end">
                  <div className="flex shrink-0 items-center justify-center rounded-lg bg-[#d0d0d0] px-2 py-0.5">
                    <p className="shrink-0 whitespace-nowrap text-[13px] font-normal leading-normal text-[#1b1b1b] not-italic">
                      Pending
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full w-10 shrink-0" />
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center whitespace-nowrap text-right text-[12px] leading-normal text-[#222] not-italic">
          <p className="font-semibold">{dateLabel}</p>
          <p className="font-medium">{timeLabel}</p>
        </div>
      </div>
    </div>
  );
}
