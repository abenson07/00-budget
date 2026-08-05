import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_INSTITUTIONS } from "@/lib/demo-institutions";
import { generateImportedTransactions } from "@/lib/generate-import-history";
import type { ConnectedAccountSummary, Transaction } from "@/lib/types";

type OnboardingState = {
  connectedAccounts: ConnectedAccountSummary[];
  importedTransactions: Transaction[];
  connected: boolean;
  importing: boolean;
};

type OnboardingActions = {
  connectAccounts: (institutionId: string) => void;
  completeImport: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      connectedAccounts: [],
      importedTransactions: [],
      connected: false,
      importing: false,

      connectAccounts: (institutionId) => {
        const inst = DEMO_INSTITUTIONS.find((i) => i.id === institutionId);
        if (!inst) return;
        const accounts: ConnectedAccountSummary[] = inst.accounts.map((a, i) => ({
          ...a,
          id: `${institutionId}-${i}`,
          institutionName: inst.name,
        }));
        set({ connectedAccounts: accounts, connected: true, importing: true });
      },

      completeImport: () => {
        const checking = get().connectedAccounts.find((a) => a.accountType === "checking");
        if (!checking) {
          set({ importing: false });
          return;
        }
        const imported = generateImportedTransactions(checking.id, new Date());
        set({ importedTransactions: imported, importing: false });
      },

      reset: () => set({ connectedAccounts: [], importedTransactions: [], connected: false, importing: false }),
    }),
    { name: "budget-onboarding", partialize: (s) => ({ connected: s.connected }) },
  ),
);
