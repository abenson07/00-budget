"use client";

import { useEffect, useRef } from "react";
import { useBudgetStore } from "@/state/budget-store";

export function BudgetSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void useBudgetStore.getState().syncFromSupabase();
  }, []);
  return <>{children}</>;
}
