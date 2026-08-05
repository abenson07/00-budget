"use client";

import { useRouter } from "next/navigation";
import { Button, Card, PageHeader, PageShell, SectionHeading } from "@/components/ui";
import { buildFinalizedBudgetDataset } from "@/lib/finalize-onboarding";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";
import { useOnboardingStore } from "@/state/onboarding-store";

export default function OnboardingReviewPage() {
  const router = useRouter();
  const connectedAccounts = useOnboardingStore((s) => s.connectedAccounts);
  const importedTransactions = useOnboardingStore((s) => s.importedTransactions);
  const initialBudgetState = useOnboardingStore((s) => s.initialBudgetState);
  const detectedEssentials = useOnboardingStore((s) => s.detectedEssentials);
  const includedEssentialIds = useOnboardingStore((s) => s.includedEssentialIds);
  const detectedDiscretionary = useOnboardingStore((s) => s.detectedDiscretionary);
  const checking = connectedAccounts.find((a) => a.accountType === "checking");
  const includedEssentials = detectedEssentials.filter((e) => includedEssentialIds.includes(e.id));

  const onContinue = () => {
    const checkingAccount = connectedAccounts.find((a) => a.accountType === "checking");
    if (!detectedDiscretionary || !checkingAccount) {
      router.replace(appRoutes.onboardingConnect);
      return;
    }
    const result = buildFinalizedBudgetDataset({
      checkingAccount,
      importedTransactions,
      detectedEssentials,
      includedEssentialIds,
      detectedDiscretionary,
    });
    useBudgetStore.getState().loadFinalizedDataset(result);
    useOnboardingStore.getState().markOnboardingComplete();
    router.push(appRoutes.home);
  };

  return (
    <PageShell>
      <PageHeader title={"You're connected"} />
      {checking ? (
        <Card>
          <p className="text-base font-semibold text-budget-ink">
            {checking.accountName} •••{checking.mask}
          </p>
          <p className="text-amount-lg tabular-nums text-budget-ink">{formatUsd(checking.balance)}</p>
        </Card>
      ) : null}
      <p className="text-sm text-budget-ink-soft">
        {importedTransactions.length} transactions imported
      </p>

      {initialBudgetState ? (
        <Card className="flex flex-col gap-3">
          <div>
            <p className="text-label text-budget-ink-soft">Current cash</p>
            <p className="text-lg font-semibold tabular-nums text-budget-ink">
              {formatUsd(initialBudgetState.currentCash)}
            </p>
          </div>
          <div>
            <p className="text-label text-budget-ink-soft">Estimated obligations before payday</p>
            <p className="text-lg font-semibold tabular-nums text-budget-ink">
              {formatUsd(initialBudgetState.estimatedObligations)}
            </p>
            {initialBudgetState.obligationMerchants.length > 0 ? (
              <ul className="mt-1 flex flex-col gap-0.5 text-sm text-budget-ink-soft">
                {initialBudgetState.obligationMerchants.map((m) => (
                  <li key={m.merchant}>
                    {m.merchant}: {formatUsd(m.amount)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-budget-ink-soft">
                No recurring obligations detected in your imported history.
              </p>
            )}
          </div>
          <div>
            <p className="text-label text-budget-ink-soft">Available to allocate now</p>
            <p className="text-lg font-semibold tabular-nums text-budget-ink">
              {formatUsd(initialBudgetState.availableToAllocate)}
            </p>
          </div>
          <p className="text-sm text-budget-ink-soft">
            {initialBudgetState.daysUntilPaycheck < 0
              ? "Your paycheck date has already passed — you can update it later."
              : `${initialBudgetState.daysUntilPaycheck} days until your next paycheck`}
          </p>
        </Card>
      ) : (
        <Button
          variant="ghost"
          size="cta"
          fullWidth
          onClick={() => router.push(appRoutes.onboardingPaycheck)}
        >
          Set up your paycheck
        </Button>
      )}

      {detectedDiscretionary ? (
        <Card className="flex flex-col gap-2">
          <SectionHeading
            action={
              <button
                type="button"
                onClick={() => router.push(appRoutes.onboardingDetected)}
                className="text-xs font-semibold text-budget-forest underline underline-offset-2"
              >
                Edit
              </button>
            }
          >
            Your starting buckets
          </SectionHeading>
          <ul className="flex flex-col gap-1 text-sm text-budget-ink">
            {includedEssentials.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>{e.name}</span>
                <span className="tabular-nums">{formatUsd(e.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between font-semibold">
              <span>Spending money (Unassigned)</span>
              <span className="tabular-nums">{formatUsd(detectedDiscretionary.amount)}</span>
            </li>
          </ul>
        </Card>
      ) : null}

      <Button variant="primary" size="cta" fullWidth onClick={onContinue}>
        Continue
      </Button>
    </PageShell>
  );
}
