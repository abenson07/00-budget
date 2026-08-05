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
import { Button, Card, Field, Input, Label, ListRow, Sheet } from "@/components/ui";
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
    <Sheet open onClose={onClose} title={title}>
      {children}
    </Sheet>
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
          className="mt-2 text-title text-budget-ink"
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
                  className={`flex cursor-pointer items-start gap-3 rounded-card border px-4 py-4 transition-colors ${
                    isOn
                      ? "border-budget-ink bg-budget-card"
                      : "border-transparent bg-white shadow-card"
                  }`}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-budget-ink">
                    {isOn ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-budget-ink" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-budget-ink">
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-budget-ink-soft">
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
          <Button
            variant="primary"
            size="cta"
            fullWidth
            onClick={() => startWizard(step1Category)}
          >
            Proceed
          </Button>
        </div>
        <div className="mt-4 text-center">
          <Link
            href={appRoutes.buckets}
            onClick={closeAndReset}
            className="text-xs text-budget-ink-soft underline underline-offset-2"
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
            <h1 className="mt-2 text-title text-budget-ink">
              Link a past bill or start fresh
            </h1>
            <p className="mt-2 text-sm text-budget-ink-soft">
              Pick a transaction to copy amount and due date, or create a new
              bill.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="ghost" size="cta" fullWidth onClick={() => setModal("bill")}>
                Make new bill
              </Button>
              <p className="text-label uppercase tracking-wide text-budget-ink-soft">
                Past transactions
              </p>
              <div className="max-h-[45vh] overflow-auto rounded-card border border-budget-card-border bg-white">
                {sortedTx.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-budget-ink-soft">
                    No transactions yet. Use &quot;Make new bill&quot; instead.
                  </p>
                ) : (
                  sortedTx.map((tx, index) => (
                    <ListRow
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      title={tx.merchant || "Transaction"}
                      amount={formatUsd(tx.amount)}
                      divider={index < sortedTx.length - 1}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}

        {w.category === "upcoming_bills" && w.step === 3 ? (
          <>
            <h1 className="mt-2 text-title text-budget-ink">
              Due date & paychecks
            </h1>
            <p className="mt-2 text-sm text-budget-ink-soft">
              Confirm dates and how this bill is funded from your paychecks.
            </p>
            <div className="mt-6 space-y-4">
              {w.billTransactionId ? (
                <Card tone="panel" padded={false} className="px-4 py-3 text-sm">
                  <p className="text-budget-ink-soft">Amount (from transaction)</p>
                  <p className="mt-1 font-semibold tabular-nums text-budget-ink">
                    {formatUsd(
                      transactions.find((t) => t.id === w.billTransactionId)
                        ?.amount ?? 0,
                    )}
                  </p>
                </Card>
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium text-budget-ink">
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
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <Label htmlFor="wizard-due-date">Due date</Label>
                  <Input
                    id="wizard-due-date"
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
                  />
                </Field>
                <Field>
                  <Label htmlFor="wizard-alert-date">Alert date</Label>
                  <Input
                    id="wizard-alert-date"
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
                  />
                </Field>
              </div>
              <Field>
                <Label htmlFor="wizard-paycheck-funding">Paycheck funding</Label>
                <select
                  id="wizard-paycheck-funding"
                  value={w.paycheckMode}
                  onChange={(e) =>
                    patchWizard({
                      paycheckMode: e.target.value as typeof w.paycheckMode,
                    })
                  }
                  className="mt-1 h-12 w-full rounded-control border border-budget-card-border bg-white px-4 text-body text-budget-ink focus:border-budget-forest/40 focus:outline-none focus:ring-2 focus:ring-budget-forest/15"
                >
                  <option value="paycheck_1">Paycheck 1</option>
                  <option value="paycheck_2">Paycheck 2</option>
                  <option value="both">Both paychecks</option>
                </select>
              </Field>
              {w.paycheckMode === "both" ? (
                <div>
                  <div className="flex justify-between text-sm text-budget-ink">
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
                    className="mt-2 h-2 w-full accent-[var(--budget-forest)]"
                  />
                  <p className="mt-1 text-center text-xs text-budget-ink-soft">
                    {Math.round(w.paycheckSplit * 100)}% /{" "}
                    {100 - Math.round(w.paycheckSplit * 100)}%
                  </p>
                </div>
              ) : null}
            </div>
            {finishError ? (
              <p className="mt-4 text-sm text-red-700">{finishError}</p>
            ) : null}
            <Button variant="primary" size="cta" fullWidth className="mt-8" onClick={onFinishBill}>
              Create bucket
            </Button>
          </>
        ) : null}

        {(w.category === "essential_spending" || w.category === "spending_money") &&
        w.step === 2 ? (
          <>
            <h1 className="mt-2 text-title text-budget-ink">
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
                  className="min-h-[48px] rounded-card border border-budget-card-border bg-white px-4 py-3.5 text-left text-sm font-semibold text-budget-ink transition-colors hover:bg-budget-page"
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
                className="min-h-[48px] rounded-card border border-dashed border-budget-ink-soft bg-budget-card/50 px-4 py-3.5 text-left text-sm font-semibold text-budget-ink-muted"
              >
                Add new…
              </button>
            </div>
          </>
        ) : null}

        {(w.category === "essential_spending" || w.category === "spending_money") &&
        w.step === 3 ? (
          <>
            <p className="mt-2 text-center text-section text-budget-ink">
              {w.subcategoryLabel ?? "Amount"}
            </p>
            <p className="mt-1 text-center text-sm text-budget-ink-soft">
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
            <Button
              variant="primary"
              size="cta"
              fullWidth
              className="mt-8"
              onClick={onFinishEssentialOrSpending}
            >
              Create bucket
            </Button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 2 ? (
          <>
            <h1 className="mt-2 text-title text-budget-ink">
              Name your savings goal
            </h1>
            <Field className="mt-6">
              <Label htmlFor="wizard-goal-name">Goal name</Label>
              <Input
                id="wizard-goal-name"
                type="text"
                value={w.goalName}
                onChange={(e) => patchWizard({ goalName: e.target.value })}
                placeholder="e.g. New laptop fund"
              />
            </Field>
            <Button
              variant="primary"
              size="cta"
              fullWidth
              className="mt-10"
              onClick={() => {
                if (!w.goalName.trim()) return;
                setStep(3);
              }}
              disabled={!w.goalName.trim()}
            >
              Continue
            </Button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 3 ? (
          <>
            <p className="mt-2 text-center text-section text-budget-ink">
              {w.goalName.trim() || "Target amount"}
            </p>
            <p className="mt-1 text-center text-sm text-budget-ink-soft">
              How much do you want to save?
            </p>
            <div className="mt-8">
              <AmountKeypad
                cents={w.keypadCents}
                onChangeCents={(c) => patchWizard({ keypadCents: c })}
              />
            </div>
            <Button
              variant="primary"
              size="cta"
              fullWidth
              className="mt-8"
              onClick={() => {
                if (w.keypadCents <= 0) return;
                setStep(4);
              }}
              disabled={w.keypadCents <= 0}
            >
              Continue
            </Button>
          </>
        ) : null}

        {w.category === "future_planning" && w.step === 4 ? (
          <>
            <h1 className="mt-2 text-title text-budget-ink">
              When do you want to buy?
            </h1>
            <Field className="mt-6">
              <Label htmlFor="wizard-target-date">Target date</Label>
              <Input
                id="wizard-target-date"
                type="date"
                value={w.targetPurchaseDate}
                onChange={(e) =>
                  patchWizard({ targetPurchaseDate: e.target.value })
                }
              />
            </Field>
            {futureBreakdown ? (
              <Card tone="panel" className="mt-6 text-sm text-budget-ink">
                <p className="font-medium text-budget-ink-muted">
                  Bi-weekly paycheck plan
                </p>
                <p className="mt-2">
                  Target:{" "}
                  <span className="font-semibold">
                    {formatLongCalendarDay(w.targetPurchaseDate)}
                  </span>{" "}
                  · Goal {formatUsd(centsToDollars(w.keypadCents))}
                </p>
                <p className="mt-2 opacity-80">
                  About{" "}
                  <span className="font-semibold tabular-nums">
                    {formatUsd(futureBreakdown.perPaycheck)}
                  </span>{" "}
                  per paycheck ({futureBreakdown.paychecksUntil} paycheck
                  {futureBreakdown.paychecksUntil === 1 ? "" : "s"} in ~{" "}
                  {futureBreakdown.daysUntil} days).
                </p>
                <p className="mt-3 text-xs text-budget-ink-soft">
                  Paycheck 1 &amp; Paycheck 2 (alternating): roughly{" "}
                  {formatUsd(futureBreakdown.perPaycheck)} each per deposit,
                  assuming equal set-aside each time.
                </p>
              </Card>
            ) : null}
            {finishError ? (
              <p className="mt-4 text-sm text-red-700">{finishError}</p>
            ) : null}
            <Button variant="primary" size="cta" fullWidth className="mt-8" onClick={onFinishFuture}>
              Create bucket
            </Button>
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
                className="min-h-[48px] rounded-card border border-budget-card-border bg-white px-4 py-3 text-left text-sm font-medium text-budget-ink hover:bg-budget-page"
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
          <Input
            type="text"
            value={customNameDraft}
            onChange={(e) => setCustomNameDraft(e.target.value)}
            placeholder="e.g. Pharmacy"
            className="mt-0"
          />
          <Button
            variant="primary"
            size="cta"
            fullWidth
            className="mt-4"
            disabled={!customNameDraft.trim()}
            onClick={() => {
              patchWizard({ subcategoryLabel: customNameDraft.trim() });
              setStep(3);
              setModal(null);
            }}
          >
            Continue
          </Button>
        </WizardModal>
      ) : null}

      {modal === "spending_name" ? (
        <WizardModal
          title="Name this bucket"
          onClose={() => setModal(null)}
        >
          <Input
            type="text"
            value={customNameDraft}
            onChange={(e) => setCustomNameDraft(e.target.value)}
            placeholder="e.g. Concerts"
            className="mt-0"
          />
          <Button
            variant="primary"
            size="cta"
            fullWidth
            className="mt-4"
            disabled={!customNameDraft.trim()}
            onClick={() => {
              patchWizard({ subcategoryLabel: customNameDraft.trim() });
              setStep(3);
              setModal(null);
            }}
          >
            Continue
          </Button>
        </WizardModal>
      ) : null}
    </>
  );
}
