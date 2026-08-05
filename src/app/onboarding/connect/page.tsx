"use client";

import { useRouter } from "next/navigation";
import { DEMO_INSTITUTIONS } from "@/lib/demo-institutions";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

export default function OnboardingConnectPage() {
  const router = useRouter();

  const onConnect = (institutionId: string) => {
    useOnboardingStore.getState().connectAccounts(institutionId);
    router.push(appRoutes.onboardingImporting);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Connect your accounts</h1>
        <ul className="flex flex-col gap-2">
          {DEMO_INSTITUTIONS.map((inst) => (
            <li key={inst.id}>
              <button
                type="button"
                onClick={() => onConnect(inst.id)}
                className="flex w-full flex-col items-start gap-0.5 rounded-lg border border-[#222]/10 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-[#faf9f6]"
              >
                <span className="text-base font-semibold">{inst.name}</span>
                <span className="text-xs text-[#222]/55">Checking, Savings</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
