"use client";

import Link from "next/link";
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/lib/routes";

function TabIcon({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  return (
    <span
      className="material-symbols-outlined text-[24px] leading-none transition-[color,opacity] duration-200 ease-out"
      style={{
        fontVariationSettings:
          "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        color: active ? "var(--budget-forest)" : "rgba(255,255,255,0.55)",
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}

type TabProps = {
  href: string;
  label: string;
  icon: string;
  active: boolean;
};

const Tab = forwardRef<HTMLAnchorElement, TabProps>(function Tab(
  { href, label, icon, active },
  ref,
) {
  return (
    <div className="flex min-w-0 flex-1 justify-center">
      <Link
        ref={ref}
        href={href}
        aria-current={active ? "page" : undefined}
        className={[
          "relative z-10 flex max-w-full items-center justify-center rounded-full",
          active ? "gap-2 px-4 py-2.5" : "px-3 py-2.5 active:bg-white/[0.06]",
        ].join(" ")}
      >
        <TabIcon name={icon} active={active} />
        {active ? (
          <span className="whitespace-nowrap text-[11px] font-semibold tracking-tight text-[#141414] sm:text-xs">
            {label}
          </span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </Link>
    </div>
  );
});

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const barRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const bucketsRef = useRef<HTMLAnchorElement>(null);
  const txRef = useRef<HTMLAnchorElement>(null);

  const [pill, setPill] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const [transitionOn, setTransitionOn] = useState(false);

  const onHome = pathname === "/";
  const onBuckets = pathname.startsWith("/buckets");
  const onTransactions =
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/transaction/");

  useLayoutEffect(() => {
    const measure = () => {
      const bar = barRef.current;
      const link = (
        onHome
          ? homeRef.current
          : onBuckets
            ? bucketsRef.current
            : onTransactions
              ? txRef.current
              : homeRef.current
      ) as HTMLAnchorElement | null;
      if (!bar || !link) return;
      const br = bar.getBoundingClientRect();
      const lr = link.getBoundingClientRect();
      setPill({
        left: lr.left - br.left,
        top: lr.top - br.top,
        width: lr.width,
        height: lr.height,
      });
    };

    measure();

    const bar = barRef.current;
    const ro = bar ? new ResizeObserver(measure) : null;
    if (bar) ro?.observe(bar);

    window.addEventListener("resize", measure);

    const raf = requestAnimationFrame(() => {
      setTransitionOn(true);
    });

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [onHome, onBuckets, onTransactions, pathname]);

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center max-md:pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <div className="pointer-events-auto w-full max-w-md px-5 pb-1.5">
        <div
          ref={barRef}
          className="relative flex items-center rounded-full border border-white/[0.12] bg-[var(--budget-forest)]/92 px-1.5 py-1.5 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.35),0_4px_20px_-6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150"
        >
          <div
            className={[
              "pointer-events-none absolute z-0 rounded-full bg-[var(--budget-mint-bright)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] motion-reduce:transition-none",
              transitionOn
                ? "transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                : "transition-none",
            ].join(" ")}
            style={{
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
              opacity: pill.width > 0 ? 1 : 0,
            }}
            aria-hidden
          />
          <Tab
            ref={homeRef}
            href={appRoutes.home}
            label="Home"
            icon="home"
            active={onHome}
          />
          <Tab
            ref={bucketsRef}
            href={appRoutes.buckets}
            label="Buckets"
            icon="savings"
            active={onBuckets}
          />
          <Tab
            ref={txRef}
            href={appRoutes.transactions}
            label="Transactions"
            icon="receipt_long"
            active={onTransactions}
          />
        </div>
      </div>
    </nav>
  );
}
