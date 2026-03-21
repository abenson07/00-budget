import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const CARD_BG = "#efeeea";

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
  showChevron?: boolean;
  /** Extra classes on the cover image (e.g. essentials crop). */
  imageClassName?: string;
  /** Primary right text size: discretionary uses 24px, essentials “Hold to reveal” uses 19px in Figma. */
  primaryRightSize?: "lg" | "md";
};

/**
 * Figma BucketCard list variant: full-width `#efeeea` tile, fixed 88px height, 140px-wide image
 * + gradient into card fill, `pl-[152px]` body row (name | amount+meta | chevron).
 */
export function BucketListCardRow({
  href,
  imageSrc,
  title,
  primaryRight,
  secondaryRight,
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
      className="relative flex h-[88px] w-full items-center gap-2 overflow-hidden rounded-lg border border-solid border-[#bbb] bg-[#efeeea] pl-[152px] pr-4 outline-offset-2 transition-opacity active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e0403]/40"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="absolute bottom-0 left-0 top-0 w-[140px] overflow-hidden rounded-l-md">
        <div className="relative h-full w-full">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="140px"
            className={imageClassName ? `object-cover ${imageClassName}` : "object-cover"}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `linear-gradient(90deg, rgba(239,238,234,0.2) 30.29%, ${CARD_BG} 100%)`,
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-lg font-medium leading-tight text-[#1e0403]">
          {title}
        </p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-end justify-center text-right leading-tight">
        <div className={primaryCls}>{primaryRight}</div>
        {secondaryRight != null ? (
          <div className="truncate text-sm font-medium text-[#1e0403]/50">
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
