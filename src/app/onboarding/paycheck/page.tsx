"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Label, PageHeader, PageShell } from "@/components/ui";
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
    <PageShell>
      <PageHeader title={"When's your next paycheck?"} />
      <Field>
        <Label htmlFor="onboarding-paycheck-date">Date</Label>
        <Input
          id="onboarding-paycheck-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field>
        <Label htmlFor="onboarding-paycheck-amount">Amount</Label>
        <Input
          id="onboarding-paycheck-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="2000"
        />
      </Field>
      <Button variant="primary" size="cta" fullWidth disabled={!canContinue} onClick={onContinue}>
        Continue
      </Button>
    </PageShell>
  );
}
