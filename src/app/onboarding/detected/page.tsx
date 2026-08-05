"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, PageHeader, PageShell } from "@/components/ui";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

export default function OnboardingDetectedPage() {
  const router = useRouter();
  const detectedEssentials = useOnboardingStore((s) => s.detectedEssentials);
  const includedEssentialIds = useOnboardingStore((s) => s.includedEssentialIds);
  const detectedDiscretionary = useOnboardingStore((s) => s.detectedDiscretionary);
  const toggleEssentialIncluded = useOnboardingStore((s) => s.toggleEssentialIncluded);
  const updateEssentialAmount = useOnboardingStore((s) => s.updateEssentialAmount);
  const updateDiscretionaryAmount = useOnboardingStore((s) => s.updateDiscretionaryAmount);

  useEffect(() => {
    if (!detectedDiscretionary) {
      router.replace(appRoutes.onboardingPaycheck);
    }
  }, [detectedDiscretionary, router]);

  if (!detectedDiscretionary) return null;

  return (
    <PageShell>
      <PageHeader title={"Here's what we found"} />

      {detectedEssentials.length === 0 ? (
        <p className="text-sm text-budget-ink-soft">
          No recurring bills detected in your imported history.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {detectedEssentials.map((essential) => (
            <Card key={essential.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includedEssentialIds.includes(essential.id)}
                onChange={() => toggleEssentialIncluded(essential.id)}
                className="h-5 w-5 rounded accent-[var(--budget-forest)]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-budget-ink">{essential.name}</p>
                <p className="text-xs text-budget-ink-soft">{formatUsd(essential.amount)}</p>
              </div>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={essential.amount}
                onChange={(e) => updateEssentialAmount(essential.id, Number(e.target.value))}
                className="mt-0 w-28 text-right"
              />
            </Card>
          ))}
        </div>
      )}

      <Card className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-budget-ink">Spending money (Unassigned)</p>
          <p className="text-xs text-budget-ink-soft">{formatUsd(detectedDiscretionary.amount)}</p>
        </div>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={detectedDiscretionary.amount}
          onChange={(e) => updateDiscretionaryAmount(Number(e.target.value))}
          className="mt-0 w-28 text-right"
        />
      </Card>

      <Button
        variant="primary"
        size="cta"
        fullWidth
        onClick={() => router.push(appRoutes.onboardingReview)}
      >
        Continue
      </Button>
    </PageShell>
  );
}
