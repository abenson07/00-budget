"use client";

import { Keypad } from "@/components/ui";
import { formatUsd } from "@/lib/format";

const MAX_CENTS = 99_999_999;

function appendDigit(cents: number, digit: number): number {
  return Math.min(MAX_CENTS, cents * 10 + digit);
}

function backspace(cents: number): number {
  return Math.floor(cents / 10);
}

type AmountKeypadProps = {
  cents: number;
  onChangeCents: (cents: number) => void;
  disabled?: boolean;
};

export function AmountKeypad({
  cents,
  onChangeCents,
  disabled,
}: AmountKeypadProps) {
  const dollars = cents / 100;

  return (
    <div className="flex flex-col gap-4">
      <output
        className="rounded-control border border-budget-card-border bg-white px-4 py-4 text-center text-display tabular-nums text-budget-ink"
        aria-live="polite"
      >
        {formatUsd(dollars)}
      </output>
      <Keypad
        disabled={disabled}
        onDigit={(digit) => onChangeCents(appendDigit(cents, Number(digit)))}
        onDelete={() => onChangeCents(backspace(cents))}
        onClear={() => onChangeCents(0)}
      />
    </div>
  );
}
