"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";

function shouldShowMobileNav(pathname: string) {
  if (pathname.startsWith("/test")) return false;
  if (pathname.startsWith("/components")) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/buckets")) return true;
  if (
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/transaction/")
  ) {
    return true;
  }
  return false;
}

export function MobileAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const showNav = shouldShowMobileNav(pathname);

  return (
    <>
      <div
        className={
          showNav
            ? "max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom))]"
            : undefined
        }
      >
        {children}
      </div>
      {showNav ? <MobileBottomNav /> : null}
    </>
  );
}
