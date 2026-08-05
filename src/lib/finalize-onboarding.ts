import type {
  Bucket,
  ConnectedAccountSummary,
  DiscretionaryBucket,
  EssentialBillBucket,
  Transaction,
} from "./types";

export function buildFinalizedBudgetDataset(input: {
  checkingAccount: ConnectedAccountSummary;
  importedTransactions: Transaction[];
  detectedEssentials: EssentialBillBucket[];
  includedEssentialIds: string[];
  detectedDiscretionary: DiscretionaryBucket;
}): { account: { id: string; name: string }; buckets: Bucket[]; transactions: Transaction[] } {
  const includedEssentials = input.detectedEssentials
    .filter((e) => input.includedEssentialIds.includes(e.id))
    .map((e, i) => ({ ...e, order: (i + 1) * 10 }));

  const discretionary: DiscretionaryBucket = { ...input.detectedDiscretionary, order: 0 };

  const account = { id: input.checkingAccount.id, name: input.checkingAccount.accountName };

  const transactions = input.importedTransactions.map((tx) => ({
    ...tx,
    account_id: account.id,
  }));

  return { account, buckets: [discretionary, ...includedEssentials], transactions };
}
