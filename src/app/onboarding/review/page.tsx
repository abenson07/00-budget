"use client";

import { useRouter } from "next/navigation";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

/** Placeholder for this L2 only — BEN-1304 replaces this body with detected essentials/discretionary. */
export default function OnboardingReviewPage() {
  const router = useRouter();
  const connectedAccounts = useOnboardingStore((s) => s.connectedAccounts);
  const importedTransactions = useOnboardingStore((s) => s.importedTransactions);
  const initialBudgetState = useOnboardingStore((s) => s.initialBudgetState);
  const checking = connectedAccounts.find((a) => a.accountType === "checking");

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">You&apos;re connected</h1>
        {checking ? (
          <div className="rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
            <p className="text-base font-semibold">
              {checking.accountName} •••{checking.mask}
            </p>
            <p className="text-2xl font-bold tabular-nums">{formatUsd(checking.balance)}</p>
          </div>
        ) : null}
        <p className="text-sm text-[#222]/70">
          {importedTransactions.length} transactions imported
        </p>

        {initialBudgetState ? (
          <div className="flex flex-col gap-3 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs text-[#222]/55">Current cash</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatUsd(initialBudgetState.currentCash)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#222]/55">Estimated obligations before payday</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatUsd(initialBudgetState.estimatedObligations)}
              </p>
              {initialBudgetState.obligationMerchants.length > 0 ? (
                <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[#222]/70">
                  {initialBudgetState.obligationMerchants.map((m) => (
                    <li key={m.merchant}>
                      {m.merchant}: {formatUsd(m.amount)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-[#222]/70">
                  No recurring obligations detected in your imported history.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#222]/55">Available to allocate now</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatUsd(initialBudgetState.availableToAllocate)}
              </p>
            </div>
            <p className="text-sm text-[#222]/70">
              {initialBudgetState.daysUntilPaycheck < 0
                ? "Your paycheck date has already passed — you can update it later."
                : `${initialBudgetState.daysUntilPaycheck} days until your next paycheck`}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => router.push(appRoutes.onboardingPaycheck)}
            className="rounded-lg border border-[#1c3812]/30 px-4 py-3 text-center text-sm font-semibold text-[#1c3812]"
          >
            Set up your paycheck
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push(appRoutes.home)}
          className="rounded-lg bg-[#1c3812] px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
