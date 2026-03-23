import {
  BucketBill,
  BucketHome,
  BucketMonthlySpending,
  BucketSpendingMoney,
  BucketSpendingMoneyLocked,
  BucketTransaction,
  BucketTransactionSplit,
  BUCKET_REFERENCE,
  FigmaPercentageTag,
  PERCENTAGE_TAG_REFERENCE,
  TOP_CARD_ESSENTIALS_REFERENCE,
  TOP_CARD_HOME_REFERENCE_CONTENT,
  TOP_CARD_TRANSACTION_REFERENCE,
  TopCardEssentials,
  TopCardHome,
  TopCardTransaction,
  TRANSACTION_HEADER_REFERENCE,
  TransactionHeader,
} from "@/components/figma-buckets";

export default function ComponentsShowcasePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8 pb-16 font-sans text-[#1b1b1b]">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Figma components</h1>
      <p className="mb-10 text-sm text-[#1c3812] opacity-70">
        Static previews with fake data. Bucket thumbnails use the Figma MCP asset host — keep Figma Desktop
        connected so <code className="rounded bg-black/5 px-1">localhost:3845</code> can load images.
      </p>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant home — state default
        </h2>
        <div className="w-44">
          <BucketHome {...BUCKET_REFERENCE.home} />
        </div>
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant spendingMoney — state default
        </h2>
        <BucketSpendingMoney {...BUCKET_REFERENCE.spendingMoney} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant spendingMoney — state locked
        </h2>
        <BucketSpendingMoneyLocked {...BUCKET_REFERENCE.spendingMoneyLocked} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant monthlySpending — state default
        </h2>
        <BucketMonthlySpending {...BUCKET_REFERENCE.monthlySpending} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant bill — state default
        </h2>
        <BucketBill {...BUCKET_REFERENCE.bill} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant transaction — state default
        </h2>
        <BucketTransaction {...BUCKET_REFERENCE.transaction} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Bucket — variant transaction — state split
        </h2>
        <BucketTransactionSplit {...BUCKET_REFERENCE.transactionSplit} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Transaction Header — variant default — state default
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          <code className="rounded bg-black/5 px-1">variant="default"</code> ·{" "}
          <code className="rounded bg-black/5 px-1">pending=false</code>
        </p>
        <TransactionHeader
          {...TRANSACTION_HEADER_REFERENCE.default}
        />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Transaction Header — variant default — state pending
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          <code className="rounded bg-black/5 px-1">variant="default"</code> ·{" "}
          <code className="rounded bg-black/5 px-1">pending=true</code> (shows Pending badge)
        </p>
        <TransactionHeader
          {...TRANSACTION_HEADER_REFERENCE.pending}
        />
      </section>

      <hr className="mb-12 border-[#c8c6c0]" />

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant home — state default
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          Props: <code className="rounded bg-black/5 px-1">variant=&quot;home&quot;</code> (default) ·{" "}
          <code className="rounded bg-black/5 px-1">expanded</code> omitted → <code className="rounded bg-black/5 px-1">data-top-card-state=&quot;default&quot;</code>
        </p>
        <TopCardHome {...TOP_CARD_HOME_REFERENCE_CONTENT} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant home — state expanded
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          <code className="rounded bg-black/5 px-1">expanded</code> + <code className="rounded bg-black/5 px-1">disableAnimation</code> for a static frame. List rows use{" "}
          <code className="rounded bg-black/5 px-1">FigmaPercentageTag</code> (<code className="rounded bg-black/5 px-1">variant="safe" inverse</code> /{" "}
          <code className="rounded bg-black/5 px-1">variant="atRisk" inverse</code>).
        </p>
        <TopCardHome {...TOP_CARD_HOME_REFERENCE_CONTENT} disableAnimation expanded />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant home — GSAP (default ↔ expanded)
        </h2>
        <TopCardHome {...TOP_CARD_HOME_REFERENCE_CONTENT} showToggleButton />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant essentials — state default
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          <code className="rounded bg-black/5 px-1">state=&quot;default&quot;</code> · preset{" "}
          <code className="rounded bg-black/5 px-1">TOP_CARD_ESSENTIALS_REFERENCE.default</code>
        </p>
        <TopCardEssentials {...TOP_CARD_ESSENTIALS_REFERENCE.default} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant essentials — state atRisk
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          <code className="rounded bg-black/5 px-1">state=&quot;atRisk&quot;</code> · preset{" "}
          <code className="rounded bg-black/5 px-1">TOP_CARD_ESSENTIALS_REFERENCE.atRisk</code>
        </p>
        <TopCardEssentials {...TOP_CARD_ESSENTIALS_REFERENCE.atRisk} />
      </section>

      <section className="mb-12 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          TopCard — variant transaction — state default
        </h2>
        <p className="text-sm text-[#1c3812] opacity-70">
          Preset <code className="rounded bg-black/5 px-1">TOP_CARD_TRANSACTION_REFERENCE</code>
        </p>
        <TopCardTransaction {...TOP_CARD_TRANSACTION_REFERENCE} />
      </section>

      <hr className="mb-12 border-[#c8c6c0]" />

      <section className="mb-12 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c3812] opacity-60">
          Percentage tags — variants / states / props
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-[#d8d6d0] bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1c3812] opacity-70">
              variant="safe" · inverse=false
            </p>
            <FigmaPercentageTag {...PERCENTAGE_TAG_REFERENCE.safeDefault} />
          </div>
          <div className="space-y-2 rounded-lg border border-[#d8d6d0] bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1c3812] opacity-70">
              variant="safe" · inverse=true
            </p>
            <FigmaPercentageTag {...PERCENTAGE_TAG_REFERENCE.safeInverse} />
          </div>
          <div className="space-y-2 rounded-lg border border-[#d8d6d0] bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1c3812] opacity-70">
              variant="atRisk" · inverse=false
            </p>
            <FigmaPercentageTag {...PERCENTAGE_TAG_REFERENCE.atRiskDefault} />
          </div>
          <div className="space-y-2 rounded-lg border border-[#d8d6d0] bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1c3812] opacity-70">
              variant="atRisk" · inverse=true
            </p>
            <FigmaPercentageTag {...PERCENTAGE_TAG_REFERENCE.atRiskInverse} />
          </div>
          <div className="space-y-2 rounded-lg border border-[#d8d6d0] bg-white/80 p-3 sm:col-span-2">
            <p className="text-xs font-semibold text-[#1c3812] opacity-70">variant="noValue"</p>
            <FigmaPercentageTag {...PERCENTAGE_TAG_REFERENCE.noValue} />
          </div>
        </div>
        <p className="text-sm text-[#1c3812] opacity-60">
          Supports modern API (<code className="rounded bg-black/5 px-1">variant</code>,{" "}
          <code className="rounded bg-black/5 px-1">inverse</code>,{" "}
          <code className="rounded bg-black/5 px-1">valueLabel</code>) and legacy variant strings.
        </p>
      </section>
    </main>
  );
}
