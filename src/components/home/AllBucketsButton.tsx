import Link from "next/link";

/** Centered CTA under bucket previews (Figma: Button / Default). */
export function AllBucketsButton() {
  return (
    <Link
      href="/buckets"
      className="mx-auto rounded-full bg-[var(--budget-forest)] px-8 py-2.5 text-sm font-semibold text-white transition-opacity active:opacity-90"
    >
      All Buckets →
    </Link>
  );
}
