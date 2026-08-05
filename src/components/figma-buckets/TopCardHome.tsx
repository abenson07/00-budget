"use client";

import gsap from "gsap";
import {
  type KeyboardEvent,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FigmaPercentageTag } from "./FigmaPercentageTag";
import type { TopCardHomeEssentialLine, TopCardHomeState, TopCardVariant } from "./top-card-types";

const HEIGHT_DURATION = 0.35;
const FADE_DURATION = 0.15;
const STAGGER_TOTAL = 0.25;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function prefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotionSnapshot,
    () => false,
  );
}

function EssentialRow({ line }: { line: TopCardHomeEssentialLine }) {
  const sub =
    line.subtitleTone === "forest"
      ? "text-budget-forest opacity-50"
      : "text-budget-ink opacity-50";
  return (
    <div
      className="flex w-full items-center justify-between py-4"
      data-topcard-home-animate
    >
      <div className="relative flex shrink-0 flex-col items-start">
        <div className="flex shrink-0 flex-col items-start gap-1 whitespace-nowrap not-italic">
          <p className="font-sans-condensed relative shrink-0 text-amount-lg text-budget-ink">
            {line.title}
          </p>
          <p className={`relative shrink-0 text-label font-bold ${sub}`}>
            {line.subtitle}
          </p>
        </div>
      </div>
      <div className="relative flex shrink-0 items-center justify-center gap-1.5">
        <p className="font-sans-condensed relative shrink-0 whitespace-nowrap text-amount-lg tabular-nums text-budget-ink not-italic">
          {line.amount}
        </p>
        <FigmaPercentageTag
          inverse={line.percentageTagInverse ?? true}
          variant={line.percentageTagVariant}
        >
          {line.percentLabel}
        </FigmaPercentageTag>
      </div>
    </div>
  );
}

export type TopCardHomeProps = {
  /** Always `"home"` for this component; included for consistency with other TopCards. */
  variant?: Extract<TopCardVariant, "home">;
  headline: string;
  amount: string;
  paycheckLine: string;
  essentialsLabel: string;
  dueThisWeekShort: string;
  monthlyStatusLine: string;
  essentials: TopCardHomeEssentialLine[];
  expandedFooterLine: string;
  /**
   * Maps to visual state `expanded` | `default`.
   * Omit for uncontrolled mode (e.g. gallery + `showToggleButton`).
   */
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  showToggleButton?: boolean;
  toggleOnBannerClick?: boolean;
  /** Static expanded layout without GSAP (e.g. gallery snapshot). */
  disableAnimation?: boolean;
  className?: string;
};

/**
 * **Variant:** `home` · **States:** `default` (collapsed sage) · `expanded` (list + footer).
 * Figma: 28:5061 / 28:5165. GSAP animates the expandable region when `disableAnimation` is false.
 */
export function TopCardHome({
  variant = "home",
  headline,
  amount,
  paycheckLine,
  essentialsLabel,
  dueThisWeekShort,
  monthlyStatusLine,
  essentials,
  expandedFooterLine,
  expanded: expandedControlled,
  onExpandedChange,
  showToggleButton,
  toggleOnBannerClick = true,
  disableAnimation = false,
  className,
}: TopCardHomeProps) {
  const expandRegionId = useId().replace(/:/g, "");
  const prefersReducedMotion = usePrefersReducedMotion();
  const instantExpanded = prefersReducedMotion || disableAnimation;
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded =
    expandedControlled !== undefined ? expandedControlled : expandedInternal;
  const visualState: TopCardHomeState = expanded ? "expanded" : "default";

  const setExpanded = useCallback(
    (next: boolean) => {
      onExpandedChange?.(next);
      if (expandedControlled === undefined) setExpandedInternal(next);
    },
    [expandedControlled, onExpandedChange],
  );

  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  const killTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  useLayoutEffect(() => () => killTimeline(), [killTimeline]);

  const runCollapse = useCallback(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner) {
      setExpanded(false);
      return;
    }
    const staggerEls = gsap.utils.toArray<HTMLElement>(
      inner.querySelectorAll("[data-topcard-home-animate]"),
    );
    if (staggerEls.length === 0) {
      setExpanded(false);
      return;
    }
    killTimeline();
    isAnimatingRef.current = true;
    const startH = shell.scrollHeight;
    gsap.set(shell, { height: startH, overflow: "hidden" });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        setExpanded(false);
      },
    });
    tl.to(staggerEls, {
      opacity: 0,
      duration: FADE_DURATION,
      stagger: { amount: STAGGER_TOTAL, from: "end" },
      ease: "power1.out",
    }).to(shell, {
      height: 0,
      duration: HEIGHT_DURATION,
      ease: "power2.inOut",
    });
    timelineRef.current = tl;
  }, [killTimeline, setExpanded]);

  const runExpand = useCallback(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner) return;
    const staggerEls = gsap.utils.toArray<HTMLElement>(
      inner.querySelectorAll("[data-topcard-home-animate]"),
    );
    killTimeline();
    isAnimatingRef.current = true;
    gsap.set(staggerEls, { opacity: 0 });
    const targetH = inner.scrollHeight;
    gsap.set(shell, { height: 0, overflow: "hidden" });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        gsap.set(shell, { height: "auto" });
      },
    });
    tl.to(shell, {
      height: targetH,
      duration: HEIGHT_DURATION,
      ease: "power2.inOut",
    }).to(
      staggerEls,
      {
        opacity: 1,
        duration: FADE_DURATION,
        stagger: { amount: STAGGER_TOTAL, from: "start" },
        ease: "power1.out",
      },
      "-=0.12",
    );
    timelineRef.current = tl;
  }, [killTimeline]);

  useLayoutEffect(() => {
    if (!expanded || instantExpanded) return;
    runExpand();
    return () => killTimeline();
  }, [expanded, instantExpanded, runExpand, killTimeline]);

  const handleToggle = () => {
    if (isAnimatingRef.current) return;
    if (instantExpanded) {
      setExpanded(!expanded);
      return;
    }
    if (expanded) {
      runCollapse();
    } else {
      setExpanded(true);
    }
  };

  const bannerButtonProps = toggleOnBannerClick
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: handleToggle,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggle();
          }
        },
      }
    : {};

  const greenCard = (
    <div
      className="relative z-[2] mb-[-13px] flex w-full shrink-0 flex-col items-start justify-between gap-4 rounded-card bg-budget-forest px-5 py-6 shadow-hero"
      data-name="Top Card"
      data-figma-node="28:5062"
    >
      <p className="font-display relative max-w-[18rem] shrink-0 text-section text-budget-lime">
        {headline}
      </p>
      <div
        className="relative flex w-full shrink-0 flex-col items-start gap-1 text-budget-on-dark"
        data-name="Balance"
      >
        <p className="font-sans-condensed relative w-full shrink-0 text-display tabular-nums">
          {amount}
        </p>
        <p className="relative w-full shrink-0 text-label opacity-80">
          {paycheckLine}
        </p>
      </div>
    </div>
  );

  const defaultSage = (
    <div
      className={[
        "relative z-[1] mb-[-13px] flex w-full min-w-0 shrink-0 items-center justify-between gap-3 rounded-card bg-budget-sage px-5 pb-4 pt-[26px]",
        toggleOnBannerClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-figma-node="28:5067"
      aria-expanded={expanded}
      aria-controls={`figma-top-card-essentials-${expandRegionId}`}
      {...bannerButtonProps}
    >
      <div className="min-w-0 flex-1">
        <p className="font-sans-condensed truncate text-section font-bold text-budget-ink">
          {essentialsLabel}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center">
        <div className="flex items-center justify-end gap-2 rounded-pill bg-budget-forest/10 px-2 py-0.5 text-left text-label font-bold text-budget-forest">
          <p className="font-sans-condensed shrink-0 whitespace-nowrap">{dueThisWeekShort}</p>
          <p className="font-sans-condensed shrink-0 whitespace-nowrap">{monthlyStatusLine}</p>
        </div>
      </div>
    </div>
  );

  const expandedHeader = (
    <div
      className={[
        "flex min-h-[19px] w-full min-w-0 shrink-0 items-center justify-between gap-3",
        toggleOnBannerClick ? "cursor-pointer" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-expanded={expanded}
      aria-controls={`figma-top-card-essentials-${expandRegionId}`}
      {...bannerButtonProps}
    >
      <div className="min-w-0 flex-1">
        <p className="font-sans-condensed truncate text-section font-bold text-budget-ink">
          {essentialsLabel}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center">
        <div className="flex items-center justify-end gap-2 rounded-pill bg-budget-forest/10 px-2 py-0.5 text-label font-bold text-budget-forest">
          <p className="font-sans-condensed pointer-events-none shrink-0 select-none whitespace-nowrap opacity-0" aria-hidden>
            {dueThisWeekShort}
          </p>
          <p className="font-sans-condensed shrink-0 whitespace-nowrap">{monthlyStatusLine}</p>
        </div>
      </div>
    </div>
  );

  const listAndFooter = (
    <>
      <div className="relative flex w-full shrink-0 flex-col items-start">
        <div className="relative flex w-full shrink-0 flex-col items-start">
          {essentials.map((line, i) => (
            <EssentialRow key={`${line.title}-${i}`} line={line} />
          ))}
        </div>
      </div>
      <div
        className="relative flex w-full shrink-0 items-center justify-center rounded-tile bg-budget-forest py-3"
        data-topcard-home-animate
      >
        <p className="font-sans-condensed relative shrink-0 whitespace-nowrap text-meta font-bold text-budget-sage not-italic">
          {expandedFooterLine}
        </p>
      </div>
    </>
  );

  const expandedSage = instantExpanded ? (
    <div
      className="relative z-[1] mb-[-13px] flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-card bg-budget-sage px-5 pb-4 pt-[26px]"
      data-figma-node="28:5171"
      id={`figma-top-card-essentials-${expandRegionId}`}
      role="region"
      aria-label="Essentials detail"
    >
      {expandedHeader}
      <div className="flex w-full flex-col">{listAndFooter}</div>
    </div>
  ) : (
    <div
      className="relative z-[1] mb-[-13px] flex w-full min-w-0 shrink-0 flex-col items-start gap-4 rounded-card bg-budget-sage px-5 pb-4 pt-[26px]"
      data-figma-node="28:5171"
    >
      {expandedHeader}
      <div
        ref={shellRef}
        className="h-0 w-full min-w-0 overflow-hidden"
        id={`figma-top-card-essentials-${expandRegionId}`}
        role="region"
        aria-label="Essentials detail"
      >
        <div ref={innerRef} className="flex w-full flex-col">
          {listAndFooter}
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <div
        className="relative flex w-full min-w-0 flex-col items-start isolate overflow-clip rounded-card pb-[13px] shadow-card"
        data-figma-node={expanded ? "28:5165" : "28:5061"}
        data-top-card-variant={variant}
        data-top-card-state={visualState}
      >
        {greenCard}
        {expanded ? expandedSage : defaultSage}
      </div>
      {showToggleButton ? (
        <button
          type="button"
          className="mt-4 rounded-pill border border-budget-forest/25 bg-white/80 px-4 py-2 text-sm font-semibold text-budget-forest shadow-sm"
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-controls={
            expanded ? `figma-top-card-essentials-${expandRegionId}` : undefined
          }
        >
          {expanded ? "Collapse essentials" : "Expand essentials"}
        </button>
      ) : null}
    </div>
  );
}
