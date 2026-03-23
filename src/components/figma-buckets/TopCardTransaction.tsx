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
        "flex size-full w-full max-w-[408px] flex-col items-start rounded-xl bg-[#e6e8dd] px-6 py-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5270"
      data-top-card-variant={variant}
      data-top-card-state={state}
    >
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <div className="flex w-full shrink-0 justify-center px-1">
          <p className="text-center font-display text-[24px] leading-normal text-[#222] not-italic">
            {title}
          </p>
        </div>
        <div
          className="relative flex w-full shrink-0 flex-col items-center"
          data-name="Balance"
        >
          <p className="w-[min-content] min-w-full shrink-0 text-center text-[72px] font-bold leading-normal text-[#1c3812] not-italic">
            {amount}
          </p>
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-[#cae0b9] px-2 py-0.5">
            <p className="relative shrink-0 whitespace-nowrap text-[13px] font-bold leading-normal text-[#1c3812] not-italic">
              {subtitlePill}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
