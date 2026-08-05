import Link from "next/link";
import type { ReactNode } from "react";

type IconButtonProps = {
  icon: string;
  onClick?: () => void;
  href?: string;
  label: string;
};

function IconButton({ icon, onClick, href, label }: IconButtonProps) {
  const className =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-budget-ink transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]";
  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        <span className="material-symbols-outlined text-[22px]" aria-hidden>
          {icon}
        </span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      <span className="material-symbols-outlined text-[22px]" aria-hidden>
        {icon}
      </span>
    </button>
  );
}

export type PageHeaderProps = {
  title?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: ReactNode;
  size?: "title" | "compact";
};

export function PageHeader({
  title,
  backHref,
  onBack,
  onClose,
  right,
  size = "title",
}: PageHeaderProps) {
  const hasBack = Boolean(backHref || onBack);

  if (size === "compact") {
    return (
      <div className="flex min-h-11 items-center gap-2">
        {hasBack ? (
          <IconButton icon="arrow_back" href={backHref} onClick={onBack} label="Back" />
        ) : (
          <div className="h-11 w-11 shrink-0" aria-hidden />
        )}
        {title ? (
          <h1 className="min-w-0 flex-1 truncate text-center text-section">{title}</h1>
        ) : (
          <div className="flex-1" />
        )}
        {onClose ? (
          <IconButton icon="close" onClick={onClose} label="Close" />
        ) : right ? (
          <div className="shrink-0">{right}</div>
        ) : (
          <div className="h-11 w-11 shrink-0" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hasBack || onClose ? (
        <div className="flex items-center justify-between">
          {hasBack ? (
            <IconButton icon="arrow_back" href={backHref} onClick={onBack} label="Back" />
          ) : (
            <span />
          )}
          {onClose ? <IconButton icon="close" onClick={onClose} label="Close" /> : null}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {title ? <h1 className="text-title">{title}</h1> : null}
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
