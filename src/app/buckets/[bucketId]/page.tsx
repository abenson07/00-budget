"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { bucketKindTag } from "@/components/BucketCard";
import { formatUsd } from "@/lib/format";
import { useBudgetStore } from "@/state/budget-store";

export default function BucketDetailPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const bucket = useBudgetStore((s) => s.getBucketById(bucketId));

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4 pb-10 font-sans sm:p-6">
      <nav className="text-sm">
        <Link
          href="/"
          className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          ← Dashboard
        </Link>
      </nav>

      {!bucket ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
          <h1 className="text-lg font-semibold">Bucket not found</h1>
          <p className="mt-1 text-sm text-amber-900/90">
            No bucket matches this link. Return to the dashboard and choose a
            bucket from the list.
          </p>
        </div>
      ) : (
        <>
          <header className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {bucket.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">
                {bucketKindTag(bucket)}
              </span>
              {" · "}
              <span className="tabular-nums">{formatUsd(bucket.amount)}</span>{" "}
              available
            </p>
          </header>

          <section className="mt-8 rounded-lg border border-zinc-200 border-dashed bg-zinc-50/50 p-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-800">Bucket detail</p>
            <p className="mt-1">
              Transaction history and edits for this bucket will land here in a
              later task.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
