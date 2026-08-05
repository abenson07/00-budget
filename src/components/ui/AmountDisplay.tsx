import type { ReactNode } from "react";

export type AmountDisplayProps = {
  label?: ReactNode;
  value: ReactNode;
  sublabel?: ReactNode;
  size?: "display" | "lg";
  tone?: "dark" | "light";
};

export function AmountDisplay({
  label,
  value,
  sublabel,
  size = "display",
  tone = "dark",
}: AmountDisplayProps) {
  const textTone = tone === "light" ? "text-budget-on-dark" : "text-budget-ink";
  return (
    <div className="flex flex-col gap-1">
      {label ? <p className={`text-label opacity-80 ${textTone}`}>{label}</p> : null}
      <p
        className={`font-sans-condensed tabular-nums ${textTone} ${
          size === "display" ? "text-display" : "text-amount-lg"
        }`}
      >
        {value}
      </p>
      {sublabel ? <p className={`text-label opacity-80 ${textTone}`}>{sublabel}</p> : null}
    </div>
  );
}
