"use client";

import { useEffect, useState } from "react";
import { merchantLogoUrl } from "@/lib/merchant-logos";

type MerchantLogoProps = {
  merchant: string | null | undefined;
  size?: number;
  /** "circle" for avatar contexts, "square" for card-style rows. */
  shape?: "circle" | "square";
  className?: string;
};

/**
 * Renders a real merchant's brand logo when one is known; unrecognized or
 * fabricated merchants (fees, transfers, made-up payers) get a plain black
 * placeholder instead of guessing.
 */
export function MerchantLogo({ merchant, size = 44, shape = "circle", className }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false);
  // Deferred to after mount: an SSR-rendered <img> starts loading before React
  // hydration attaches onError, so a failed fetch is silently missed and the
  // broken-image icon shows instead of the fallback box.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const url = merchantLogoUrl(merchant);
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-[var(--radius-card)]";

  if (!url || failed || !mounted) {
    return (
      <span
        className={[shapeClass, "block shrink-0 bg-black", className].filter(Boolean).join(" ")}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={[shapeClass, "block shrink-0 overflow-hidden bg-white", className]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
