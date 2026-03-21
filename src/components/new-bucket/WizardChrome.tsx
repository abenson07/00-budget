"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { appRoutes } from "@/lib/routes";

type WizardChromeProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  /** Clears wizard state when user taps close (in addition to navigating away). */
  onCloseClick?: () => void;
  monoLabel: string;
  children: ReactNode;
};

export function WizardChrome({
  currentStep,
  totalSteps,
  onBack,
  onCloseClick,
  monoLabel,
  children,
}: WizardChromeProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <header className="flex shrink-0 items-center justify-between px-4 pt-6 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1e0403] transition-opacity hover:opacity-70"
          aria-label="Go back"
        >
          <span className="text-lg leading-none" aria-hidden>
            ←
          </span>
        </button>
        <div
          className="flex items-center gap-1.5"
          role="img"
          aria-label={`Step ${currentStep} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < currentStep ? "bg-[#1e0403]" : "bg-[#1e0403]/20"
              }`}
            />
          ))}
        </div>
        <Link
          href={appRoutes.buckets}
          onClick={onCloseClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#1e0403] transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          <span className="text-lg leading-none" aria-hidden>
            ×
          </span>
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-4">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#1e0403]/65">
          {monoLabel}
        </p>
        {children}
      </div>
    </div>
  );
}
