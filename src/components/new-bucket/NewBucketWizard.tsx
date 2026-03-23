"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { validateBucketMetadata } from "@/lib/bucket-metadata";
import { biweeklyPerPaycheckAmount } from "@/lib/biweekly-savings-breakdown";
import { buildBucketFromWizard, centsToDollars } from "@/lib/build-bucket-from-wizard";
import { addDaysToIsoLocal } from "@/lib/dates";
import { formatLongCalendarDay, formatUsd } from "@/lib/format";
import type { NewBucketCategoryId } from "@/lib/new-bucket-from-category";
import { nextBucketSortOrder } from "@/lib/new-bucket-from-category";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";
import {
  maxStepForCategory,
  useNewBucketWizardStore,
} from "@/state/new-bucket-wizard-store";
import type { Transaction } from "@/lib/types";
import { AmountKeypad } from "./AmountKeypad";
import { bucketToMetadataInput } from "./bucket-to-metadata-input";
import { WizardChrome } from "./WizardChrome";

const STEP1_CATEGORIES: {
  id: NewBucketCategoryId;
  title: string;
  description: string;
}[] = [
  {
    id: "upcoming_bills",
    title: "Upcoming bills",
    description:
      "Money set aside for fixed, scheduled expenses with a due date.",
  },
  {
    id: "essential_spending",
    title: "Essential spending",
    description:
      "Your pool for everyday needs like groceries, gas, and regular expenses without a fixed date.",
  },
  {
    id: "future_planning",
    title: "Future planning",
    description:
      "Money you're building toward a goal — savings, an emergency fund, or something you're working up to.",
  },
  {
    id: "spending_money",
    title: "Spending money",
    description: "Whatever's left for you to spend freely, no strings attached.",
  },
];

const BILL_PRESETS = [
  "Phone",
  "Internet",
  "Car insurance",
  "Utilities",
] as const;

const ESSENTIAL_PRESETS = ["Groceries", "Gas", "Date night"] as const;

const SPENDING_PRESETS = [
  "Out with friends",
  "Ordering in",
  "Eating out",
  "Clothing money",
  "Amazon fund",
] as const;

type ModalKind = "bill" | "essential_name" | "spending_name" | null;

function WizardModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-t-2xl bg-[var(--budget-page-bg)] p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="wizard-modal-title"
            className="font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-[#1e0403]/70"
          >
            Cancel
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NewBucketWizard() {
  const router = useRouter();
  const groupId = useId();
  const transactions = useBudgetStore((s) => s.transactions);
  const buckets = useBudgetStore((s) => s.buckets);
  const appendBucket = useBudgetStore((s) => s.appendBucket);

  const wizard = useNewBucketWizardStore((s) => s.wizard);
  const startWizard = useNewBucketWizardStore((s) => s.startWizard);
  const patchWizard = useNewBucketWizardStore((s) => s.patchWizard);
  const setStep = useNewBucketWizardStore((s) => s.setStep);
  const resetWizard = useNewBucketWizardStore((s) => s.resetWizard);

  const [step1Category, setStep1Category] =
    useState<NewBucketCategoryId>("upcoming_bills");
  const [modal, setModal] = useState<ModalKind>(null);
  const [customNameDraft, setCustomNameDraft] = useState("");
  const [finishError, setFinishError] = useState<string | null>(null);

  const sortedTx = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  const totalSteps = maxStepForCategory(
    wizard?.category ?? step1Category,
  );
  const dotStep = wizard?.step ?? 1;

  const onChromeBack = useCallback(() => {
    if (!wizard) {
      router.back();
      return;
    }
    if (wizard.step <= 2) {
      resetWizard();
      return;
    }
    setStep(wizard.step - 1);
  }, [wizard, router, resetWizard, setStep]);

  const closeAndReset = useCallback(() => {
    resetWizard();
  }, [resetWizard]);

  const onSelectTransaction = useCallback(
    (tx: Transaction) => {
      const due = tx.date.slice(0, 10);
      const alert = addDaysToIsoLocal(due, -3) ?? due;
      patchWizard({
        billTransactionId: tx.id,
        billPresetLabel: null,
        dueDate: due,
        alertDate: alert,
      });
      setStep(3);
    },
    [patchWizard, setStep],
  );

  const onBillPreset = useCallback(
    (label: string) => {
      patchWizard({
        billPresetLabel: label,
        billTransactionId: null,
        billManualAmountCents: 0,
      });
      setStep(3);
      setModal(null);
    },
    [patchWizard, setStep],
  );

  const onFinishBill = useCallback(() => {
    if (!wizard || wizard.category !== "upcoming_bills") return;
    setFinishError(null);
    const tx = wizard.billTransactionId
      ? transactions.find((t) => t.id === wizard.billTransactionId)
      : undefined;
    const hasAmount = tx
      ? tx.amount > 0
      : wizard.billManualAmountCents > 0;
    if (!hasAmount) {
      setFinishError("Enter a bill amount.");
      return;
    }
    if (!tx && !wizard.billPresetLabel?.trim()) {
      setFinishError("Choose a bill type.");
      return;
    }
    const order = nextBucketSortOrder(buckets);
    const bucket = buildBucketFromWizard(wizard, order, transactions);
    const errs = validateBucketMetadata(bucketToMetadataInput(bucket));
    if (errs.length > 0) {
      setFinishError(errs[0] ?? "Check dates.");
      return;
    }
    appendBucket(bucket);
    resetWizard();
    router.push(appRoutes.bucket(bucket.id));
  }, [wizard, transactions, buckets, appendBucket, resetWizard, router]);

  const onFinishEssentialOrSpending = useCallback(() => {
    if (
      !wizard ||
      (wizard.category !== "essential_spending" &&
        wizard.category !== "spending_money")
    ) {
      return;
    }
    setFinishError(null);
    if (!wizard.subcategoryLabel?.trim()) {
      setFinishError("Choose or name this bucket.");
      return;
    }
    if (wizard.keypadCents <= 0) {
      setFinishError("Enter an amount greater than zero.");
      return;
    }
    const order = nextBucketSortOrder(buckets);
    const bucket = buildBucketFromWizard(wizard, order, transactions);
    const errs = validateBucketMetadata(bucketToMetadataInput(bucket));
    if (errs.length > 0) {
      setFinishError(errs[0] ?? "Invalid bucket.");
      return;
    }
    appendBucket(bucket);
    resetWizard();
    router.push(appRoutes.bucket(bucket.id));
  }, [wizard, transactions, buckets, appendBucket, resetWizard, router]);

  const onFinishFuture = useCallback(() => {
    if (!wizard || wizard.category !== "future_planning") return;
    setFinishError(null);
    if (!wizard.goalName.trim()) {
      setFinishError("Name your goal.");
      return;
    }
    if (wizard.keypadCents <= 0) {
      setFinishError("Enter an amount greater than zero.");
      return;
    }
    if (!wizard.targetPurchaseDate.trim()) {
      setFinishError("Pick a target date.");
      return;
    }
    const order = nextBucketSortOrder(buckets);
    const bucket = buildBucketFromWizard(wizard, order, transactions);
    const errs = validateBucketMetadata(bucketToMetadataInput(bucket));
    if (errs.length > 0) {
      setFinishError(errs[0] ?? "Invalid bucket.");
      return;
    }
    appendBucket(bucket);
    resetWizard();
    router.push(appRoutes.bucket(bucket.id));
  }, [wizard, transactions, buckets, appendBucket, resetWizard, router]);

  const futureBreakdown = useMemo(() => {
    if (!wizard || wizard.category !== "future_planning") return null;
    const goal = centsToDollars(wizard.keypadCents);
    if (goal <= 0 || !wizard.targetPurchaseDate.trim()) return null;
    return biweeklyPerPaycheckAmount(goal, wizard.targetPurchaseDate.trim());
  }, [wizard]);

  if (!wizard) {
    return (
      <WizardChrome
        currentStep={1}
        totalSteps={totalSteps}
        onBack={() => router.back()}
        onCloseClick={closeAndReset}
        monoLabel="New bucket"
      >
        <h1
          id={`${groupId}-heading`}
          className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]"
        >
          Create a new bucket
        </h1>
        <fieldset className="mt-8 min-h-0 flex-1 border-0 p-0">
          <legend className="sr-only">Bucket category</legend>
          <div
            role="radiogroup"
            aria-labelledby={`${groupId}-heading`}
            className="flex flex-col gap-3"
          >
            {STEP1_CATEGORIES.map((c) => {
              const isOn = step1Category === c.id;
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition-colors ${
                    isOn
                      ? "border-[#1e0403] bg-[#efeeea]"
                      : "border-transparent bg-white shadow-[0_1px_0_rgba(30,4,3,0.06)]"
                  }`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#1e0403]">
                    {isOn ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1e0403]" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-[var(--budget-ink)]">
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-[#1e0403]/60">
                      {c.description}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="bucket-category"
                    value={c.id}
                    checked={isOn}
                    onChange={() => setStep1Category(c.id)}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-10 shrink-0 pt-2">
          <button
            type="button"
            onClick={() => startWizard(step1Category)}
            className="w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90"
          >
            Proceed
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link
            href={appRoutes.buckets}
            onClick={closeAndReset}
            className="font-mono text-xs text-[#1e0403]/60 underline underline-offset-2"
          >
            Cancel
          </Link>
        </div>
      </WizardChrome>
    );
  }

  const w = wizard;
  const mono =
    w.category === "upcoming_bills"
      ? "Upcoming bill"
      : w.category === "essential_spending"
        ? "Essential spending"
        : w.category === "spending_money"
          ? "Spending money"
          : "Future planning";

  return (
    <>
      <WizardChrome
        currentStep={dotStep}
        totalSteps={totalSteps}
        onBack={onChromeBack}
        onCloseClick={closeAndReset}
        monoLabel={mono}
      >
        {w.category === "upcoming_bills" && w.step === 2 ? (
          <>
            <h1 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]">
              Link a past bill or start fresh
            </h1>
            <p className="mt-2 text-sm text-[#1e0403]/60">
              Pick a transaction to copy amount and due date, or create a new
              bill.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setModal("bill")}
                className="w-full rounded-xl border border-[#1e0403]/30 bg-white py-3.5 text-center text-sm font-semibold text-[#1e0403]"
              >
                Make new bill
              </button>
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#1e0403]/50">
                Past transactions
              </p>
              <ul className="max-h-[45vh] overflow-auto rounded-xl border border-[#bbb] bg-white">
                {sortedTx.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-[#1e0403]/60">
                    No transactions yet. Use &quot;Make new bill&quot; instead.
                  </li>
                ) : (
                  sortedTx.map((tx) => (
                    <li key={tx.id} className="border-b border-[#eee] last:border-0">
                      <button
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--budget-page-bg)]"
                      >
                        <span className="min-w-0 font-medium text-[var(--budget-ink)]">
                          {tx.merchant || "Transaction"}
                        </span>
                        <span className="shrink-0 tabular-nums text-[#1e0403]">
                          {formatUsd(tx.amount)}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        ) : null}

        {w.category === "upcoming_bills" && w.step === 3 ? (
          <>
            <h1 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]">
              Due date & paychecks
            </h1>
            <p className="mt-2 text-sm text-[#1e0403]/60">
              Confirm dates and how this bill is funded from your paychecks.
            </p>
            <div className="mt-6 space-y-4">
              {w.billTransactionId ? (
                <div className="rounded-xl border border-[#bbb] bg-[#efeeea] px-4 py-3 text-sm">
                  <p className="text-[#1e0403]/65">Amount (from transaction)</p>
                  <p className="mt-1 font-semibold tabular-nums text-[var(--budget-ink)]">
                    {formatUsd(
                      transactions.find((t) => t.id === w.billTransactionId)
                        ?.amount ?? 0,
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--budget-ink)]">
                    Bill amount
                  </p>
                  <AmountKeypad
                    cents={w.billManualAmountCents}
                    onChangeCents={(c) =>
                      patchWizard({ billManualAmountCents: c })
                    }
                  />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
                  Due date
                  <input
                    type="date"
                    value={w.dueDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      patchWizard({ dueDate: v });
                      if (v) {
                        const next = addDaysToIsoLocal(v, -3);
                        if (next) patchWizard({ alertDate: next });
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
                  Alert date
                  <input
                    type="date"
                    value={w.alertDate}
                    max={
                      w.dueDate
                        ? (addDaysToIsoLocal(w.dueDate, -1) ?? undefined)
                        : undefined
                    }
                    onChange={(e) =>
                      patchWizard({ alertDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
                Paycheck funding
                <select
                  value={w.paycheckMode}
                  onChange={(e) =>
                    patchWizard({
                      paycheckMode: e.target.value as typeof w.paycheckMode,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
                >
                  <option value="paycheck_1">Paycheck 1</option>
                  <option value="paycheck_2">Paycheck 2</option>
                  <option value="both">Both paychecks</option>
                </select>
              </label>
              {w.paycheckMode === "both" ? (
                <div>
                  <div className="flex justify-between text-sm text-[var(--budget-ink)]">
                    <span>Paycheck 1</span>
                    <span>Paycheck 2</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(w.paycheckSplit * 100)}
                    onChange={(e) =>
                      patchWizard({
                        paycheckSplit: Number(e.target.value) / 100,
                      })
                    }
                    className="mt-2 w-full accent-[#1e0403]"
                  />
                  <p className="mt-1 text-center text-xs text-[#1e0403]/65">
                    {Math.round(w.paycheckSplit * 100)}% /{" "}
                    {100 - Math.round(w.paycheckSplit * 100)}%
                  </p>
                </div>
              ) : null}
            </div>
            {finishError ? (
              <p className="mt-4 text-sm text-red-700">{finishError}</p>
            ) : null}
            <button
              type="button"
              onClick={onFinishBill}
              className="mt-8 w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90"
            >
              Create bucket
            </button>
          </>
        ) : null}

        {(w.category === "essential_spending" || w.category === "spending_money") &&
        w.step === 2 ? (
          <>
            <h1 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]">
              What is this for?
            </h1>
            <div className="mt-6 flex flex-col gap-2">
              {(w.category === "essential_spending"
                ? ESSENTIAL_PRESETS
                : SPENDING_PRESETS
              ).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    patchWizard({ subcategoryLabel: label });
                    setStep(3);
                  }}
                  className="rounded-xl border border-[#bbb] bg-white px-4 py-3.5 text-left text-sm font-semibold text-[var(--budget-ink)] transition-colors hover:bg-[var(--budget-page-bg)]"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomNameDraft("");
                  setModal(
                    w.category === "essential_spending"
                      ? "essential_name"
                      : "spending_name",
                  );
                }}
                className="rounded-xl border border-dashed border-[#1e0403]/35 bg-[#efeeea]/50 px-4 py-3.5 text-left text-sm font-semibold text-[#1e0403]"
              >
                Add new…
              </button>
            </div>
          </>
        ) : null}

        {(w.category === "essential_spending" || w.category === "spending_money") &&
        w.step === 3 ? (
          <>
            <p className="mt-2 text-center font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
              {w.subcategoryLabel ?? "Amount"}
            </p>
            <p className="mt-1 text-center text-sm text-[#1e0403]/60">
              How much do you want to allocate?
            </p>
            <div className="mt-8">
              <AmountKeypad
                cents={w.keypadCents}
                onChangeCents={(c) => patchWizard({ keypadCents: c })}
              />
            </div>
            {finishError ? (
              <p className="mt-4 text-sm text-red-700">{finishError}</p>
            ) : null}
            <button
              type="button"
              onClick={onFinishEssentialOrSpending}
              className="mt-8 w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90"
            >
              Create bucket
            </button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 2 ? (
          <>
            <h1 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]">
              Name your savings goal
            </h1>
            <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
              Goal name
              <input
                type="text"
                value={w.goalName}
                onChange={(e) => patchWizard({ goalName: e.target.value })}
                placeholder="e.g. New laptop fund"
                className="mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2.5 text-base text-[#222]"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (!w.goalName.trim()) return;
                setStep(3);
              }}
              disabled={!w.goalName.trim()}
              className="mt-10 w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90 disabled:opacity-40"
            >
              Continue
            </button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 3 ? (
          <>
            <p className="mt-2 text-center font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
              {w.goalName.trim() || "Target amount"}
            </p>
            <p className="mt-1 text-center text-sm text-[#1e0403]/60">
              How much do you want to save?
            </p>
            <div className="mt-8">
              <AmountKeypad
                cents={w.keypadCents}
                onChangeCents={(c) => patchWizard({ keypadCents: c })}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (w.keypadCents <= 0) return;
                setStep(4);
              }}
              disabled={w.keypadCents <= 0}
              className="mt-8 w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90 disabled:opacity-40"
            >
              Continue
            </button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 4 ? (
          <>
            <h1 className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[1.65rem] leading-tight text-[#1e1e1e]">
              When do you want to buy?
            </h1>
            <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55">
              Target date
              <input
                type="date"
                value={w.targetPurchaseDate}
                onChange={(e) =>
                  patchWizard({ targetPurchaseDate: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm"
              />
            </label>
            {futureBreakdown ? (
              <div className="mt-6 rounded-xl border border-[#bbb] bg-[#efeeea] p-4 text-sm text-[var(--budget-ink)]">
                <p className="font-medium text-[#1e0403]">
                  Bi-weekly paycheck plan
                </p>
                <p className="mt-2">
                  Target:{" "}
                  <span className="font-semibold">
                    {formatLongCalendarDay(w.targetPurchaseDate)}
                  </span>{" "}
                  · Goal {formatUsd(centsToDollars(w.keypadCents))}
                </p>
                <p className="mt-2 text-[#1e0403]/80">
                  About{" "}
                  <span className="font-semibold tabular-nums">
                    {formatUsd(futureBreakdown.perPaycheck)}
                  </span>{" "}
                  per paycheck ({futureBreakdown.paychecksUntil} paycheck
                  {futureBreakdown.paychecksUntil === 1 ? "" : "s"} in ~{" "}
                  {futureBreakdown.daysUntil} days).
                </p>
                <p className="mt-3 text-xs text-[#1e0403]/65">
                  Paycheck 1 &amp; Paycheck 2 (alternating): roughly{" "}
                  {formatUsd(futureBreakdown.perPaycheck)} each per deposit,
                  assuming equal set-aside each time.
                </p>
              </div>
            ) : null}
            {finishError ? (
              <p className="mt-4 text-sm text-red-700">{finishError}</p>
            ) : null}
            <button
              type="button"
              onClick={onFinishFuture}
              className="mt-8 w-full rounded-2xl bg-[#1e1e1e] py-3.5 text-center text-base font-medium text-white transition-opacity active:opacity-90"
            >
              Create bucket
            </button>
          </>
        ) : null}
      </WizardChrome>

      {modal === "bill" ? (
        <WizardModal title="Bill category" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-2">
            {BILL_PRESETS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onBillPreset(label)}
                className="rounded-xl border border-[#bbb] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--budget-ink)] hover:bg-[var(--budget-page-bg)]"
              >
                {label}
              </button>
            ))}
          </div>
        </WizardModal>
      ) : null}

      {modal === "essential_name" ? (
        <WizardModal
          title="Name this bucket"
          onClose={() => setModal(null)}
        >
          <input
            type="text"
            value={customNameDraft}
            onChange={(e) => setCustomNameDraft(e.target.value)}
            placeholder="e.g. Pharmacy"
            className="w-full rounded-md border border-[#bbb] bg-white px-3 py-2.5 text-base"
          />
          <button
            type="button"
            disabled={!customNameDraft.trim()}
            onClick={() => {
              patchWizard({ subcategoryLabel: customNameDraft.trim() });
              setStep(3);
              setModal(null);
            }}
            className="mt-4 w-full rounded-xl bg-[#1e1e1e] py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            Continue
          </button>
        </WizardModal>
      ) : null}

      {modal === "spending_name" ? (
        <WizardModal
          title="Name this bucket"
          onClose={() => setModal(null)}
        >
          <input
            type="text"
            value={customNameDraft}
            onChange={(e) => setCustomNameDraft(e.target.value)}
            placeholder="e.g. Concerts"
            className="w-full rounded-md border border-[#bbb] bg-white px-3 py-2.5 text-base"
          />
          <button
            type="button"
            disabled={!customNameDraft.trim()}
            onClick={() => {
              patchWizard({ subcategoryLabel: customNameDraft.trim() });
              setStep(3);
              setModal(null);
            }}
            className="mt-4 w-full rounded-xl bg-[#1e1e1e] py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            Continue
          </button>
        </WizardModal>
      ) : null}
    </>
  );
}
