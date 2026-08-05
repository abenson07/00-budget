"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDaysToIsoLocal } from "@/lib/dates";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

function defaultPaycheckDate(): string {
  const today = new Date().toISOString().slice(0, 10);
  return addDaysToIsoLocal(today, 7) ?? today;
}

export default function OnboardingPaycheckPage() {
  const router = useRouter();
  const connected = useOnboardingStore((s) => s.connected);
  const [date, setDate] = useState(defaultPaycheckDate);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!connected) router.replace(appRoutes.onboardingConnect);
  }, [connected, router]);

  const amountNum = Number(amount);
  const canContinue = date !== "" && amount !== "" && Number.isFinite(amountNum) && amountNum > 0;

  const onContinue = () => {
    if (!canContinue) return;
    useOnboardingStore.getState().setPaycheckInfo(date, amountNum);
    useOnboardingStore.getState().generateDetections();
    router.push(appRoutes.onboardingDetected);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">When&apos;s your next paycheck?</h1>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2000"
            className="rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="rounded-lg bg-[#1c3812] px-4 py-3 text-center text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
