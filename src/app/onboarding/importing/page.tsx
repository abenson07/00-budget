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
    <div className="flex min-h-screen items-center justify-center bg-budget-page text-budget-ink">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-budget-forest/20 border-t-budget-forest"
          aria-hidden
        />
        <p className="text-sm text-budget-ink-soft">Importing your last 3 months...</p>
      </div>
    </div>
  );
}
