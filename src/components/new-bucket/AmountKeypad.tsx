"use client";

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
        className="rounded-xl border border-[#bbb] bg-white px-4 py-4 text-center font-[family-name:var(--font-instrument-serif)] text-3xl tabular-nums text-[#1e1e1e]"
        aria-live="polite"
      >
        {formatUsd(dollars)}
      </output>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChangeCents(appendDigit(cents, n))}
            className="rounded-xl bg-[#efeeea] py-4 text-lg font-medium text-[#1b1b1b] transition-opacity active:opacity-80 disabled:opacity-40"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeCents(backspace(cents))}
          className="rounded-xl bg-[#dbdad6] py-4 text-sm font-mono font-medium text-[#010101] transition-opacity active:opacity-80 disabled:opacity-40"
        >
          Delete
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeCents(appendDigit(cents, 0))}
          className="rounded-xl bg-[#efeeea] py-4 text-lg font-medium text-[#1b1b1b] transition-opacity active:opacity-80 disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeCents(0)}
          className="rounded-xl border border-[#bbb] bg-white py-4 text-sm font-medium text-[#1e0403] transition-opacity active:opacity-80 disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
