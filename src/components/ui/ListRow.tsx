import Link from "next/link";
import type { ReactNode } from "react";

export type ListRowProps = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  amount?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  divider?: boolean;
  className?: string;
};

function initials(text: string) {
  return text.trim().slice(0, 1).toUpperCase();
}

export function ListRow({
  leading,
  title,
  subtitle,
  amount,
  meta,
  trailing,
  href,
  onClick,
  divider,
  className,
}: ListRowProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-budget-sage-panel text-meta font-semibold text-budget-forest">
        {leading ?? (typeof title === "string" ? initials(title) : null)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-budget-ink">{title}</p>
        {subtitle ? <p className="mt-0.5 truncate text-meta text-budget-ink-soft">{subtitle}</p> : null}
      </div>
      {amount != null || meta != null || trailing != null ? (
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          {amount != null ? (
            <span className="text-amount tabular-nums text-budget-ink">{amount}</span>
          ) : null}
          {meta != null ? (
            <span className="text-label tabular-nums text-budget-ink-soft">{meta}</span>
          ) : null}
          {trailing}
        </div>
      ) : null}
    </>
  );

  const rowClassName = [
    "flex min-h-[72px] w-full items-center gap-3 py-3 text-left transition-colors active:bg-black/[0.03]",
    divider ? "border-b border-budget-hairline" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClassName}>
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
