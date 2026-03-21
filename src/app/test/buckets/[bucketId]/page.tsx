"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { bucketKindTag } from "@/components/BucketCard";
import { getBucketById, selectAllocationsForBucket } from "@/lib/allocation";
import { addDaysToIsoLocal } from "@/lib/dates";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import type { Bucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";

function labelClass() {
  return "block text-xs font-medium uppercase tracking-wide text-zinc-500";
}

function inputClass() {
  return "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";
}

function sectionCard(children: ReactNode) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      {children}
    </section>
  );
}

function bucketToFormState(b: Bucket): {
  name: string;
  order: string;
  type: "discretionary" | "essential";
  essential_subtype: "bill" | "essential_spending";
  due_date: string;
  alert_date: string;
  top_off: string;
  percentagePct: string;
} {
  return {
    name: b.name,
    order: String(b.order),
    type: b.type,
    essential_subtype:
      b.type === "essential" ? b.essential_subtype : "essential_spending",
    due_date: b.type === "essential" && b.essential_subtype === "bill" ? b.due_date : "",
    alert_date:
      b.type === "essential" && b.essential_subtype === "bill" ? b.alert_date : "",
    top_off: b.top_off != null ? String(b.top_off) : "",
    percentagePct:
      b.percentage != null ? String(Math.round(b.percentage * 100000) / 1000) : "",
  };
}

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export default function BucketDetailPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const buckets = useBudgetStore((s) => s.buckets);
  const transactions = useBudgetStore((s) => s.transactions);
  const bucket = getBucketById(buckets, bucketId);
  const allocations = useMemo(
    () => selectAllocationsForBucket(transactions, bucketId),
    [transactions, bucketId],
  );
  const transferAction = useBudgetStore((s) => s.transferBetweenBuckets);
  const updateMetadata = useBudgetStore((s) => s.updateBucketMetadata);
  const otherBuckets = useMemo(
    () =>
      buckets
        .filter((b) => b.id !== bucketId)
        .sort((a, b) => a.order - b.order),
    [buckets, bucketId],
  );

  const [toBucketId, setToBucketId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("");
  const [editType, setEditType] = useState<"discretionary" | "essential">(
    "discretionary",
  );
  const [editSubtype, setEditSubtype] = useState<"bill" | "essential_spending">(
    "essential_spending",
  );
  const [editDue, setEditDue] = useState("");
  const [editAlert, setEditAlert] = useState("");
  const [editTopOff, setEditTopOff] = useState("");
  const [editPct, setEditPct] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editOk, setEditOk] = useState(false);

  const syncFormFromBucket = useCallback((b: Bucket) => {
    const f = bucketToFormState(b);
    setEditName(f.name);
    setEditOrder(f.order);
    setEditType(f.type);
    setEditSubtype(f.essential_subtype);
    setEditDue(f.due_date);
    setEditAlert(f.alert_date);
    setEditTopOff(f.top_off);
    setEditPct(f.percentagePct);
  }, []);

  useEffect(() => {
    if (!bucket) return;
    syncFormFromBucket(bucket);
    setEditError(null);
    setEditOk(false);
    setTransferError(null);
  }, [bucketId, bucket, syncFormFromBucket]);

  useEffect(() => {
    if (!otherBuckets.length) {
      setToBucketId("");
      return;
    }
    setToBucketId((prev) =>
      prev && otherBuckets.some((b) => b.id === prev)
        ? prev
        : otherBuckets[0]!.id,
    );
  }, [bucketId, otherBuckets]);

  const sortedAllocations = useMemo(
    () =>
      [...allocations].sort(
        (a, b) =>
          new Date(b.transaction.date).getTime() -
          new Date(a.transaction.date).getTime(),
      ),
    [allocations],
  );

  const onTransfer = (e: FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    const amt = Number(transferAmount);
    try {
      transferAction(bucketId, toBucketId, amt);
      setTransferAmount("");
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : String(err));
    }
  };

  const onSaveMetadata = (e: FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditOk(false);

    const orderNum = Number(editOrder);
    const topOff = parseOptionalNumber(editTopOff);
    const pctRaw = parseOptionalNumber(editPct);

    if (topOff != null && Number.isNaN(topOff)) {
      setEditError("Top off must be a number or empty");
      return;
    }
    if (pctRaw != null && Number.isNaN(pctRaw)) {
      setEditError("Percentage must be a number or empty");
      return;
    }

    const input: BucketMetadataInput = {
      name: editName,
      order: orderNum,
      type: editType,
      essential_subtype: editSubtype,
      due_date: editDue,
      alert_date: editAlert,
      top_off: topOff == null || Number.isNaN(topOff) ? null : topOff,
      percentage:
        pctRaw == null || Number.isNaN(pctRaw) ? null : pctRaw / 100,
    };

    try {
      updateMetadata(bucketId, input);
      setEditOk(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4 pb-10 font-sans sm:p-6">
      <nav className="text-sm">
        <Link
          href={legacyRoutes.home}
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
              {bucket.type === "essential" ? (
                <>
                  {" · "}
                  <span className="text-zinc-700">
                    {bucket.essential_subtype === "bill"
                      ? "Bill"
                      : "Essential spending"}
                  </span>
                </>
              ) : null}
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-950">
              {formatUsd(bucket.amount)}{" "}
              <span className="text-sm font-normal text-zinc-600">balance</span>
            </p>
          </header>

          <div className="mt-6 space-y-6">
            {sectionCard(
              <>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Rules &amp; dates
                </h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-500">Top off</dt>
                    <dd className="font-medium tabular-nums text-zinc-900">
                      {bucket.top_off != null ? formatUsd(bucket.top_off) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Percentage</dt>
                    <dd className="font-medium tabular-nums text-zinc-900">
                      {bucket.percentage != null
                        ? `${(bucket.percentage * 100).toFixed(2)}%`
                        : "—"}
                    </dd>
                  </div>
                  {bucket.type === "essential" &&
                  bucket.essential_subtype === "bill" ? (
                    <>
                      <div>
                        <dt className="text-zinc-500">Due date</dt>
                        <dd className="font-medium text-zinc-900">
                          {bucket.due_date}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Alert date</dt>
                        <dd className="font-medium text-zinc-900">
                          {bucket.alert_date}
                        </dd>
                      </div>
                    </>
                  ) : null}
                </dl>
              </>,
            )}

            {sectionCard(
              <>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Assigned transactions
                </h2>
                {sortedAllocations.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">
                    No transactions allocate to this bucket yet.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
                    <table className="w-full min-w-[320px] text-left text-sm">
                      <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Merchant</th>
                          <th className="px-3 py-2 font-medium text-right">
                            From this bucket
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAllocations.map(
                          ({ transaction: tx, amount: splitAmt }) => (
                            <tr
                              key={tx.id}
                              className="border-b border-zinc-100 last:border-0"
                            >
                              <td className="px-3 py-2 tabular-nums text-zinc-700">
                                {tx.date}
                              </td>
                              <td className="px-3 py-2">
                                <Link
                                  href={legacyRoutes.transaction(tx.id)}
                                  className="font-medium text-sky-800 underline decoration-sky-200 underline-offset-2 hover:text-sky-950"
                                >
                                  {tx.merchant || "—"}
                                </Link>
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums font-medium text-zinc-900">
                                {formatUsd(splitAmt)}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>,
            )}

            {otherBuckets.length > 0
              ? sectionCard(
                  <>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Transfer to another bucket
                    </h2>
                    <p className="mt-1 text-xs text-zinc-600">
                      Moves balance between buckets only; total account balance
                      stays the same. Source cannot go negative.
                    </p>
                    <form className="mt-4 space-y-3" onSubmit={onTransfer}>
                      <div>
                        <label htmlFor="to-bucket" className={labelClass()}>
                          Destination
                        </label>
                        <select
                          id="to-bucket"
                          className={inputClass()}
                          value={toBucketId}
                          onChange={(e) => setToBucketId(e.target.value)}
                        >
                          {otherBuckets.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({formatUsd(b.amount)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="xfer-amt" className={labelClass()}>
                          Amount (USD)
                        </label>
                        <input
                          id="xfer-amt"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          className={inputClass()}
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      {transferError ? (
                        <p className="text-sm text-red-700">{transferError}</p>
                      ) : null}
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                      >
                        Transfer
                      </button>
                    </form>
                  </>,
                )
              : null}

            {sectionCard(
              <>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Edit bucket
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Name, type, sort order, rules, and bill dates. Balance is
                  changed only via transfers or transactions.
                </p>
                <form className="mt-4 space-y-3" onSubmit={onSaveMetadata}>
                  <div>
                    <label htmlFor="edit-name" className={labelClass()}>
                      Name
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      className={inputClass()}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-order" className={labelClass()}>
                      Order
                    </label>
                    <input
                      id="edit-order"
                      type="number"
                      className={inputClass()}
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className={labelClass()}>Type</span>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-800">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="edit-type"
                          checked={editType === "discretionary"}
                          onChange={() => setEditType("discretionary")}
                        />
                        Discretionary
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="edit-type"
                          checked={editType === "essential"}
                          onChange={() => setEditType("essential")}
                        />
                        Essential
                      </label>
                    </div>
                  </div>
                  {editType === "essential" ? (
                    <div>
                      <span className={labelClass()}>Essential subtype</span>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-800">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="edit-subtype"
                            checked={editSubtype === "essential_spending"}
                            onChange={() => setEditSubtype("essential_spending")}
                          />
                          Essential spending
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="edit-subtype"
                            checked={editSubtype === "bill"}
                            onChange={() => setEditSubtype("bill")}
                          />
                          Bill
                        </label>
                      </div>
                    </div>
                  ) : null}
                  {editType === "essential" && editSubtype === "bill" ? (
                    <div className="space-y-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-due" className={labelClass()}>
                            Due date
                          </label>
                          <input
                            id="edit-due"
                            type="date"
                            className={inputClass()}
                            value={editDue}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEditDue(v);
                              if (v) {
                                const nextAlert = addDaysToIsoLocal(v, -5);
                                if (nextAlert) setEditAlert(nextAlert);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-alert" className={labelClass()}>
                            Alert date
                          </label>
                          <input
                            id="edit-alert"
                            type="date"
                            className={inputClass()}
                            value={editAlert}
                            max={
                              editDue
                                ? (addDaysToIsoLocal(editDue, -1) ?? undefined)
                                : undefined
                            }
                            onChange={(e) => setEditAlert(e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Changing the due date sets the alert to five days before. You can
                        adjust the alert separately; it must stay before the due date.
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <label htmlFor="edit-topoff" className={labelClass()}>
                      Top off (empty = none)
                    </label>
                    <input
                      id="edit-topoff"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      className={inputClass()}
                      value={editTopOff}
                      onChange={(e) => setEditTopOff(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-pct" className={labelClass()}>
                      Percentage of income (0–100, empty = none)
                    </label>
                    <input
                      id="edit-pct"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step="0.1"
                      className={inputClass()}
                      value={editPct}
                      onChange={(e) => setEditPct(e.target.value)}
                      placeholder="e.g. 12 for 12%"
                    />
                  </div>
                  {editError ? (
                    <p className="text-sm text-red-700">{editError}</p>
                  ) : null}
                  {editOk ? (
                    <p className="text-sm text-emerald-800">Saved.</p>
                  ) : null}
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    Save changes
                  </button>
                </form>
              </>,
            )}
          </div>
        </>
      )}
    </main>
  );
}
