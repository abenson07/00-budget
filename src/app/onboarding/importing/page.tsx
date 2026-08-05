"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

export default function OnboardingImportingPage() {
  const router = useRouter();

  useEffect(() => {
    const state = useOnboardingStore.getState();
    if (!state.importing && !state.connected) {
      router.replace(appRoutes.onboardingConnect);
      return;
    }
    const timeout = setTimeout(() => {
      useOnboardingStore.getState().completeImport();
      router.push(appRoutes.onboardingPaycheck);
    }, 900);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[#1c3812]/20 border-t-[#1c3812]"
          aria-hidden
        />
        <p className="text-sm text-[#222]/70">Importing your last 3 months...</p>
      </div>
    </div>
  );
}
