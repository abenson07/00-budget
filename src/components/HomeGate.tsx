"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileHome } from "@/components/MobileHome";
import { appRoutes } from "@/lib/routes";
import { useOnboardingStore } from "@/state/onboarding-store";

export function HomeGate() {
  const router = useRouter();
  const onboardingComplete = useOnboardingStore((s) => s.onboardingComplete);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    return useOnboardingStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  useEffect(() => {
    if (hasHydrated && !onboardingComplete) router.replace(appRoutes.onboardingConnect);
  }, [hasHydrated, onboardingComplete, router]);

  if (!hasHydrated || !onboardingComplete) return null;
  return <MobileHome />;
}
