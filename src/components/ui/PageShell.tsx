import type { ReactNode } from "react";

export type PageShellProps = {
  children: ReactNode;
  gap?: "section" | "tight";
  className?: string;
};

export function PageShell({ children, gap = "section", className }: PageShellProps) {
  return (
    <div className="min-h-screen bg-budget-page text-budget-ink">
      <div
        className={[
          "mx-auto flex w-full max-w-md flex-col px-5 pb-10 pt-6",
          gap === "tight" ? "gap-5" : "gap-8",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
