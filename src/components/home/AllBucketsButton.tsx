import Link from "next/link";

/** Centered CTA under bucket previews (Figma: Button / Default). */
export function AllBucketsButton() {
  return (
    <Link
      href="/buckets"
      className="mx-auto rounded-lg bg-[#dbdad6] px-6 py-2 font-mono text-xs font-medium text-[#010101]"
    >
      All Buckets →
    </Link>
  );
}
