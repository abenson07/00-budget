import { legacyRoutes } from "./legacy-routes";

/** Primary app URLs (outside `/test`). */
export const appRoutes = {
  home: "/",
  buckets: "/buckets",
  bucketNew: "/buckets/new",
  bucket: (id: string) => `/buckets/${encodeURIComponent(id)}`,
  bucketSettings: (id: string) =>
    `/buckets/${encodeURIComponent(id)}/settings`,
  bucketTransfer: (id: string) =>
    `/buckets/${encodeURIComponent(id)}/transfer`,
  transactions: "/transactions",
  transaction: (id: string) =>
    `/transaction/${encodeURIComponent(id)}`,
  transactionSplit: (id: string) =>
    `/transaction/${encodeURIComponent(id)}/split`,
} as const;

/** Links used by transaction detail + split editor (mirrors app vs `/test` tree). */
export type TransactionViewRoutes = {
  transactionsList: string;
  transaction: (id: string) => string;
  transactionSplit: (id: string) => string;
};

export const transactionRoutesApp: TransactionViewRoutes = {
  transactionsList: appRoutes.transactions,
  transaction: appRoutes.transaction,
  transactionSplit: appRoutes.transactionSplit,
};

export const transactionRoutesLegacy: TransactionViewRoutes = {
  transactionsList: legacyRoutes.transactions,
  transaction: legacyRoutes.transaction,
  transactionSplit: legacyRoutes.transactionSplit,
};

/** Bucket links from transaction detail (app vs `/test`). */
export type BucketViewRoutes = {
  bucket: (id: string) => string;
};

export const bucketRoutesApp: BucketViewRoutes = {
  bucket: appRoutes.bucket,
};

export const bucketRoutesLegacy: BucketViewRoutes = {
  bucket: legacyRoutes.bucket,
};
