import type { ConnectedAccountSummary } from "./types";

export type DemoInstitution = {
  id: string;
  name: string;
  accounts: Omit<ConnectedAccountSummary, "id" | "institutionName">[];
};

export const DEMO_INSTITUTIONS: DemoInstitution[] = [
  {
    id: "demo-chase",
    name: "Chase",
    accounts: [
      { accountName: "Total Checking", accountType: "checking", mask: "4821", balance: 2140.55 },
      { accountName: "Savings", accountType: "savings", mask: "9013", balance: 5320.0 },
    ],
  },
  {
    id: "demo-ally",
    name: "Ally Bank",
    accounts: [
      { accountName: "Interest Checking", accountType: "checking", mask: "2207", balance: 890.1 },
      { accountName: "Online Savings", accountType: "savings", mask: "7742", balance: 12400.0 },
    ],
  },
];
