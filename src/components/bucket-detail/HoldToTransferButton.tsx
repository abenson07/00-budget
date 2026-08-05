"use client";

import { useCallback, useRef, useState } from "react";

export function HoldToTransferButton({
  label,
  onConfirm,
  disabled,
  holdMs = 2000,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  holdMs?: number;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    if (startRef.current == null) return;
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(1, elapsed / holdMs);
    setProgress(pct);
    if (pct >= 1) {
      cancel();
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [cancel, onConfirm, holdMs]);

  const start = useCallback(() => {
    if (disabled) return;
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick]);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className="relative w-full overflow-hidden rounded-2xl bg-[#0f0f0f] py-4 text-center text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
    >
      <span
        className="absolute inset-y-0 left-0 bg-white/20"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      <span className="relative">{`Hold to ${label}`}</span>
    </button>
  );
}
