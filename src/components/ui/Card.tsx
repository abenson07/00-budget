import type { ReactNode } from "react";

export type CardTone = "surface" | "panel" | "forest" | "alert" | "risk";

export type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  padded?: boolean;
  className?: string;
};

const toneClasses: Record<CardTone, string> = {
  surface: "bg-white border border-budget-card-border shadow-card",
  panel: "bg-budget-sage-panel",
  forest: "bg-budget-forest text-budget-on-dark shadow-hero",
  alert: "bg-budget-alert-bg text-budget-alert-ink",
  risk: "bg-budget-risk-bg text-budget-risk-ink",
};

export function Card({ children, tone = "surface", padded = true, className }: CardProps) {
  return (
    <div
      className={[
        "rounded-card",
        padded ? "p-5" : "",
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
