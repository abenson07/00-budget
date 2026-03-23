"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { addDaysToIsoLocal } from "@/lib/dates";
import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import type { Bucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";

function labelClass() {
  return "block text-xs font-medium uppercase tracking-wide text-[#1e0403]/55";
}

function inputClass() {
  return "mt-1 w-full rounded-md border border-[#bbb] bg-white px-3 py-2 text-sm text-[#222] shadow-sm focus:border-[#1e0403]/40 focus:outline-none focus:ring-1 focus:ring-[#1e0403]/25";
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
  goal_target_date: string;
  locked: boolean;
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
    goal_target_date:
      b.type === "discretionary" ? (b.goal_target_date ?? "") : "",
    locked: b.type === "discretionary" && b.locked === true,
  };
}

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

type BucketMetadataFormProps = { bucketId: string; bucket: Bucket };

export function BucketMetadataForm({ bucketId, bucket }: BucketMetadataFormProps) {
  const updateMetadata = useBudgetStore((s) => s.updateBucketMetadata);

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
  const [editGoalTarget, setEditGoalTarget] = useState("");
  const [editLocked, setEditLocked] = useState(false);
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
    setEditGoalTarget(f.goal_target_date);
    setEditLocked(f.locked);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- reset form fields when bucket changes */
  useEffect(() => {
    syncFormFromBucket(bucket);
    setEditError(null);
    setEditOk(false);
  }, [bucketId, bucket, syncFormFromBucket]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      goal_target_date: editGoalTarget,
      locked: editType === "discretionary" ? editLocked : undefined,
    };

    try {
      updateMetadata(bucketId, input);
      setEditOk(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="rounded-lg border border-[#bbb] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1e1e1e]">Edit bucket</h2>
      <p className="mt-1 text-xs text-[#1e0403]/65">
        Name, type, sort order, rules, and bill dates. Balance is changed only
        via transfers or transactions.
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
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#222]">
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
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#222]">
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
            <p className="text-xs text-[#1e0403]/50">
              Changing the due date sets the alert to five days before. You can
              adjust the alert separately; it must stay before the due date.
            </p>
          </div>
        ) : null}
        {editType === "discretionary" ? (
          <>
            <div>
              <label htmlFor="edit-goal-target" className={labelClass()}>
                Goal target date (optional)
              </label>
              <input
                id="edit-goal-target"
                type="date"
                className={inputClass()}
                value={editGoalTarget}
                onChange={(e) => setEditGoalTarget(e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#222]">
              <input
                type="checkbox"
                checked={editLocked}
                onChange={(e) => setEditLocked(e.target.checked)}
              />
              Locked spending money (hidden from safe to spend)
            </label>
          </>
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
          className="rounded-lg border border-[#bbb] bg-white px-4 py-2 text-sm font-medium text-[#222] transition-colors hover:bg-[#faf9f6]"
        >
          Save changes
        </button>
      </form>
    </section>
  );
}
