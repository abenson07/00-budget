import type { ReactNode } from "react";

export type SectionHeadingProps = {
  children: ReactNode;
  action?: ReactNode;
};

export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-section text-budget-ink">{children}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
