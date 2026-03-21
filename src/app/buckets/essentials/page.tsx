import Link from "next/link";

/** Placeholder until the bucket / essentials detail screen is implemented. */
export default function BucketsEssentialsPlaceholderPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#faf9f6] px-4 pb-10 pt-[4.5rem] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <Link
        href="/buckets"
        className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2"
      >
        ← All buckets
      </Link>
      <h1 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-2xl">
        Essentials
      </h1>
      <p className="mt-3 text-sm text-[#1e0403]/70">
        This screen will mirror your Figma essentials view. For now, use the
        legacy bucket pages from the list, or return to the home overview.
      </p>
    </main>
  );
}
