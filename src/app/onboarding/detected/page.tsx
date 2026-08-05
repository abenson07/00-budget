"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Here&apos;s what we found</h1>

        {detectedEssentials.length === 0 ? (
          <p className="text-sm text-[#222]/70">
            No recurring bills detected in your imported history.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {detectedEssentials.map((essential) => (
              <li
                key={essential.id}
                className="flex items-center gap-3 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={includedEssentialIds.includes(essential.id)}
                  onChange={() => toggleEssentialIncluded(essential.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{essential.name}</p>
                  <p className="text-xs text-[#222]/55">{formatUsd(essential.amount)}</p>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={essential.amount}
                  onChange={(e) => updateEssentialAmount(essential.id, Number(e.target.value))}
                  className="w-24 rounded-md border border-[#bbb] px-2 py-1 text-right text-sm"
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-3 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Spending money (Unassigned)</p>
            <p className="text-xs text-[#222]/55">{formatUsd(detectedDiscretionary.amount)}</p>
          </div>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={detectedDiscretionary.amount}
            onChange={(e) => updateDiscretionaryAmount(Number(e.target.value))}
            className="w-24 rounded-md border border-[#bbb] px-2 py-1 text-right text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => router.push(appRoutes.onboardingReview)}
          className="rounded-lg bg-[#1c3812] px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
