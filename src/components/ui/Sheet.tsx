"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--budget-scrim)] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-card bg-budget-page p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet outline-none sm:rounded-card sm:pb-5"
      >
        {title ? <h2 className="mb-4 text-section text-budget-ink">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
