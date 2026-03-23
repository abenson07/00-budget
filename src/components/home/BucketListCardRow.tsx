import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Figma bucket list rows: sage panel fill; gradient blends the cover into the tile. */
const CARD_PANEL = "var(--budget-sage-panel)";
const CARD_PANEL_RGB = "220,232,216";

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5 3.5 9 7l-4 3.5"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#1e0403]/45"
      />
    </svg>
  );
}

export type BucketListCardRowProps = {
  href: string;
  imageSrc: string;
  title: string;
  primaryRight: ReactNode;
  /** Second line under amount (e.g. Goal: $402). */
  secondaryRight?: ReactNode;
  /** Subtitle under title (left column). */
  subtitleLeft?: string;
  /** Lock icon / badge inline with title. */
  titleAddon?: ReactNode;
  /** Pill tag next to amount (e.g. PercentageTag). */
  trailingTag?: ReactNode;
  showChevron?: boolean;
  /** Extra classes on the cover image (e.g. essentials crop). */
  imageClassName?: string;
  /** Primary right text size: discretionary uses 24px, essentials “Hold to reveal” uses 19px in Figma. */
  primaryRightSize?: "lg" | "md";
};

/**
 * Figma BucketCard list variant: full-width `#efeeea` tile, fixed 88px height, ~98px-wide image
 * + gradient into card fill, `pl-[110px]` body row (name | amount+meta | chevron).
 */
export function BucketListCardRow({
  href,
  imageSrc,
  title,
  primaryRight,
  secondaryRight,
  subtitleLeft,
  titleAddon,
  trailingTag,
  showChevron = true,
  imageClassName,
  primaryRightSize = "lg",
}: BucketListCardRowProps) {
  const primaryCls =
    primaryRightSize === "lg"
      ? "text-2xl font-bold leading-tight text-[#222]"
      : "text-[19px] font-bold leading-tight text-[#222]";

  return (
    <Link
      href={href}
      className="relative flex h-[88px] w-full items-center gap-2 overflow-hidden rounded-[var(--radius-card)] border border-solid border-[var(--budget-card-border)] pl-[110px] pr-4 outline-offset-2 transition-opacity active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--budget-forest)]/40"
      style={{ backgroundColor: CARD_PANEL }}
    >
      <div className="absolute bottom-0 left-0 top-0 w-[98px] overflow-hidden rounded-l-md">
        <div className="relative h-full w-full">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="98px"
            className={imageClassName ? `object-cover ${imageClassName}` : "object-cover"}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `linear-gradient(90deg, rgba(${CARD_PANEL_RGB},0.2) 30.29%, rgb(${CARD_PANEL_RGB}) 100%)`,
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
        <p className="flex min-w-0 items-center gap-1 truncate text-lg font-semibold leading-tight text-[var(--budget-ink)]">
          <span className="truncate">{title}</span>
          {titleAddon}
        </p>
        {subtitleLeft != null ? (
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--budget-ink-soft)]">
            {subtitleLeft}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-end justify-center text-right leading-tight">
        <div className="flex items-center justify-end gap-1.5">
          <div className={primaryCls}>{primaryRight}</div>
          {trailingTag}
        </div>
        {secondaryRight != null ? (
          <div className="truncate text-sm font-medium text-[var(--budget-ink-soft)]">
            {secondaryRight}
          </div>
        ) : null}
      </div>

      {showChevron ? (
        <span className="relative shrink-0">
          <ChevronRightIcon />
        </span>
      ) : null}
    </Link>
  );
}
