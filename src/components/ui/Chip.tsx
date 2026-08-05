import type { ReactNode } from "react";

export type ChipProps = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

export function Chip({ children, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "inline-flex h-9 shrink-0 items-center rounded-pill px-4 text-label font-semibold transition-colors",
        selected ? "bg-budget-forest text-budget-on-dark" : "bg-budget-sage-panel text-budget-forest",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
