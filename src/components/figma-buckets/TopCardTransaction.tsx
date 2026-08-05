import type { TopCardTransactionState, TopCardVariant } from "./top-card-types";

export type TopCardTransactionProps = {
  variant?: Extract<TopCardVariant, "transaction">;
  state?: TopCardTransactionState;
  title: string;
  amount: string;
  subtitlePill: string;
  className?: string;
};

/**
 * **Variant:** `transaction` · **States:** `default`
 * Figma: 28:5270
 */
export function TopCardTransaction({
  variant = "transaction",
  state = "default",
  title,
  amount,
  subtitlePill,
  className,
}: TopCardTransactionProps) {
  return (
    <div
      className={[
        "flex size-full w-full flex-col items-start rounded-card bg-budget-sage-panel px-5 py-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5270"
      data-top-card-variant={variant}
      data-top-card-state={state}
    >
      <div className="relative flex w-full shrink-0 flex-col items-start gap-1">
        <div className="flex w-full shrink-0 justify-center">
          <p className="text-center font-display text-section text-budget-ink not-italic">
            {title}
          </p>
        </div>
        <div
          className="relative flex w-full shrink-0 flex-col items-center gap-1"
          data-name="Balance"
        >
          <p className="font-sans-condensed w-[min-content] min-w-full shrink-0 text-center text-display tabular-nums text-budget-forest not-italic">
            {amount}
          </p>
          <div className="flex shrink-0 items-center justify-center rounded-pill bg-budget-sage px-2 py-0.5">
            <p className="relative shrink-0 whitespace-nowrap text-label font-bold text-budget-forest not-italic">
              {subtitlePill}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
