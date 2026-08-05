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
    <div className="flex min-h-screen flex-col bg-budget-page text-budget-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        <header className="flex shrink-0 items-center justify-between pt-6 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-pill text-budget-ink transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden>
              arrow_back
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
                  i < currentStep ? "bg-budget-ink" : "bg-budget-ink/20"
                }`}
              />
            ))}
          </div>
          <Link
            href={appRoutes.buckets}
            onClick={onCloseClick}
            className="flex h-11 w-11 items-center justify-center rounded-pill text-budget-ink transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden>
              close
            </span>
          </Link>
        </header>
        <div className="flex flex-1 flex-col pb-8 pt-2">
          <p className="text-label uppercase tracking-wide text-budget-ink-soft">
            {monoLabel}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
