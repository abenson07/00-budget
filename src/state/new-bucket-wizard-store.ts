import { create } from "zustand";
import { addDaysToIsoLocal } from "@/lib/dates";
import type { NewBucketCategoryId } from "@/lib/new-bucket-from-category";
import type { PaycheckMode } from "@/lib/paycheck-allocation";

export type { PaycheckMode } from "@/lib/paycheck-allocation";

function localIsoDate(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export type ActiveNewBucketWizard = {
  category: NewBucketCategoryId;
  step: number;
  billTransactionId: string | null;
  billPresetLabel: string | null;
  billManualAmountCents: number;
  dueDate: string;
  alertDate: string;
  paycheckMode: PaycheckMode;
  paycheckSplit: number;
  subcategoryLabel: string | null;
  keypadCents: number;
  goalName: string;
  targetPurchaseDate: string;
};

function defaultDates() {
  const today = localIsoDate(new Date());
  const due = addDaysToIsoLocal(today, 14) ?? today;
  const alert = addDaysToIsoLocal(due, -5) ?? addDaysToIsoLocal(today, 7) ?? today;
  return { dueDate: due, alertDate: alert, targetPurchaseDate: due };
}

function initialWizard(category: NewBucketCategoryId): ActiveNewBucketWizard {
  const { dueDate, alertDate, targetPurchaseDate } = defaultDates();
  return {
    category,
    step: 2,
    billTransactionId: null,
    billPresetLabel: null,
    billManualAmountCents: 0,
    dueDate,
    alertDate,
    paycheckMode: "paycheck_1",
    paycheckSplit: 0.5,
    subcategoryLabel: null,
    keypadCents: 0,
    goalName: "",
    targetPurchaseDate,
  };
}

export function maxStepForCategory(category: NewBucketCategoryId): number {
  if (category === "future_planning") return 4;
  return 3;
}

type NewBucketWizardStore = {
  wizard: ActiveNewBucketWizard | null;
  startWizard: (category: NewBucketCategoryId) => void;
  patchWizard: (patch: Partial<ActiveNewBucketWizard>) => void;
  setStep: (step: number) => void;
  resetWizard: () => void;
};

export const useNewBucketWizardStore = create<NewBucketWizardStore>((set) => ({
  wizard: null,
  startWizard: (category) => set({ wizard: initialWizard(category) }),
  patchWizard: (patch) =>
    set((s) =>
      s.wizard ? { wizard: { ...s.wizard, ...patch } } : s,
    ),
  setStep: (step) =>
    set((s) => (s.wizard ? { wizard: { ...s.wizard, step } } : s)),
  resetWizard: () => set({ wizard: null }),
}));
