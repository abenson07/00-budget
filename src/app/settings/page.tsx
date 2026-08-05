"use client";

import Link from "next/link";
import { Card, PageHeader, PageShell, SectionHeading } from "@/components/ui";
import { appRoutes } from "@/lib/routes";
import { useSettingsStore } from "@/state/settings-store";

export default function SettingsPage() {
  const nearLimitThresholdPct = useSettingsStore((s) => s.nearLimitThresholdPct);
  const setNearLimitThresholdPct = useSettingsStore((s) => s.setNearLimitThresholdPct);
  const surplusMode = useSettingsStore((s) => s.surplusMode);
  const setSurplusMode = useSettingsStore((s) => s.setSurplusMode);

  return (
    <PageShell>
      <PageHeader title="Settings" />

      <Card className="flex flex-col gap-2">
        <SectionHeading>Pay schedule</SectionHeading>
        <Link href={appRoutes.paySchedule} className="text-sm text-budget-forest underline">
          Manage pay schedule
        </Link>
      </Card>

      <Card className="flex flex-col gap-2">
        <SectionHeading>Bucket priorities</SectionHeading>
        <p className="text-sm text-budget-ink-soft">
          Reorder discretionary buckets from the Buckets screen.
        </p>
        <Link href={appRoutes.buckets} className="text-sm text-budget-forest underline">
          Go to Buckets
        </Link>
      </Card>

      <Card className="flex flex-col gap-2">
        <SectionHeading>Notifications</SectionHeading>
        <label className="flex flex-col gap-2 text-sm text-budget-ink-soft">
          Alert me when a bucket has less than {nearLimitThresholdPct}% left
          <input
            type="range"
            min={0}
            max={100}
            value={nearLimitThresholdPct}
            onChange={(e) => setNearLimitThresholdPct(Number(e.target.value))}
            className="h-2 w-full accent-[var(--budget-forest)]"
          />
        </label>
      </Card>

      <Card className="flex flex-col gap-2">
        <SectionHeading>Extra paycheck money</SectionHeading>
        <label className="flex items-center gap-2 text-sm text-budget-ink">
          <input
            type="radio"
            name="surplusMode"
            checked={surplusMode === "unassigned"}
            onChange={() => setSurplusMode("unassigned")}
            className="h-5 w-5 accent-[var(--budget-forest)]"
          />
          Send leftover to Unassigned
        </label>
        <label className="flex items-center gap-2 text-sm text-budget-ink">
          <input
            type="radio"
            name="surplusMode"
            checked={surplusMode === "goals_first"}
            onChange={() => setSurplusMode("goals_first")}
            className="h-5 w-5 accent-[var(--budget-forest)]"
          />
          Top off savings goals first
        </label>
      </Card>
    </PageShell>
  );
}
