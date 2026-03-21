/** Pre–mobile-redesign app preserved under `/test`. */
export const legacyRoutes = {
  home: "/test/home",
  transactions: "/test/transactions",
  transaction: (id: string) =>
    `/test/transactions/${encodeURIComponent(id)}`,
  bucket: (id: string) => `/test/buckets/${encodeURIComponent(id)}`,
} as const;
