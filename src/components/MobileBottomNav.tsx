"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/lib/routes";

function TabIcon({
  name,
  filled,
}: {
  name: string;
  filled: boolean;
}) {
  return (
    <span
      className="material-symbols-outlined text-[26px] leading-none transition-[font-variation-settings,color] duration-200"
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  const onHome = pathname === "/";
  const onBuckets = pathname.startsWith("/buckets");
  const onTransactions =
    pathname.startsWith("/transactions") || pathname.startsWith("/transaction/");

  const tabClass = (active: boolean) =>
    [
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors",
      active
        ? "text-[#1e0403]"
        : "text-[#1e0403]/45 active:bg-black/[0.04]",
    ].join(" ");

  const labelClass = (active: boolean) =>
    [
      "max-w-full truncate font-mono text-[10px] font-medium tracking-wide",
      active ? "text-[#1e0403]" : "text-[#1e0403]/50",
    ].join(" ");

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-4 mb-1 w-full max-w-md">
        <div className="flex items-stretch justify-between gap-1 rounded-[1.35rem] border border-[#1e0403]/[0.08] bg-[#faf9f6]/[0.82] px-1 py-1 shadow-[0_10px_40px_-12px_rgba(30,4,3,0.35),0_4px_14px_-6px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/60">
          <Link
            href={appRoutes.home}
            className={tabClass(onHome)}
            aria-current={onHome ? "page" : undefined}
          >
            <TabIcon name="home" filled={onHome} />
            <span className={labelClass(onHome)}>Home</span>
          </Link>
          <Link
            href={appRoutes.buckets}
            className={tabClass(onBuckets)}
            aria-current={onBuckets ? "page" : undefined}
          >
            <TabIcon name="savings" filled={onBuckets} />
            <span className={labelClass(onBuckets)}>Buckets</span>
          </Link>
          <Link
            href={appRoutes.transactions}
            className={tabClass(onTransactions)}
            aria-current={onTransactions ? "page" : undefined}
          >
            <TabIcon name="receipt_long" filled={onTransactions} />
            <span className={labelClass(onTransactions)}>Transactions</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
