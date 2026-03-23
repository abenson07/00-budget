import { formatOrdinalLongDate } from "@/lib/format";

type TransactionHeaderProps = {
  merchant: string;
  amountFormatted: string;
  dateStr: string;
  pending?: boolean;
};

/**
 * Detail header: cream card, placeholder logo, merchant (serif), amount, date corner.
 */
export function TransactionHeader({
  merchant,
  amountFormatted,
  dateStr,
  pending = false,
}: TransactionHeaderProps) {
  const dateLine = formatOrdinalLongDate(dateStr);

  return (
    <div className="relative rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-card)] px-5 pb-5 pt-6">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--budget-tag-neutral-bg)] text-sm font-semibold text-[var(--budget-tag-neutral-fg)]">
        {(merchant.trim().slice(0, 1) || "?").toUpperCase()}
      </div>
      <div className="flex flex-col gap-3 pr-24">
        <h1 className="font-display text-xl leading-tight text-[var(--budget-ink)]">
          {merchant.trim() || "—"}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-3xl font-bold tabular-nums leading-none tracking-tight text-[var(--budget-ink)]">
            {amountFormatted}
          </p>
          {pending ? (
            <span className="rounded-[var(--radius-pill)] bg-[var(--budget-tag-neutral-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--budget-tag-neutral-fg)]">
              Pending
            </span>
          ) : null}
        </div>
      </div>
      <p className="absolute bottom-4 right-5 max-w-[10rem] text-right text-xs leading-snug text-[var(--budget-ink-soft)]">
        {dateLine}
      </p>
    </div>
  );
}
