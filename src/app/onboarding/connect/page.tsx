"use client";

import { useRouter } from "next/navigation";
import { ListRow, PageHeader, PageShell } from "@/components/ui";
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
    <PageShell>
      <PageHeader title="Connect your accounts" />
      <div className="flex flex-col gap-2">
        {DEMO_INSTITUTIONS.map((inst) => (
          <div key={inst.id} className="rounded-card border border-budget-card-border bg-white shadow-card">
            <ListRow
              onClick={() => onConnect(inst.id)}
              title={inst.name}
              subtitle="Checking, Savings"
            />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
