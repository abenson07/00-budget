"use client";

import { useState } from "react";
import { useBudgetStore } from "@/state/budget-store";

export default function DevSimulatePage() {
  const [paycheckAmount, setPaycheckAmount] = useState("2000");
  const [spendMerchant, setSpendMerchant] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendError, setSpendError] = useState<string | null>(null);

  const onSimulatePaycheck = () => {
    const amount = Number(paycheckAmount);
    if (!Number.isFinite(amount)) return;
    useBudgetStore.getState().simulatePaycheckDeposit(amount);
  };

  const onSimulateSpend = () => {
    setSpendError(null);
    const amount = Number(spendAmount);
    if (!spendMerchant.trim() || !Number.isFinite(amount) || amount <= 0) {
      setSpendError("Enter a merchant and a positive amount.");
      return;
    }
    try {
      useBudgetStore.getState().createTransaction({
        id: crypto.randomUUID(),
        account_id: useBudgetStore.getState().account.id,
        amount,
        merchant: spendMerchant,
        date: new Date().toISOString().slice(0, 10),
        spending_type: "debit",
        status: "cleared",
      });
      setSpendMerchant("");
      setSpendAmount("");
    } catch (e) {
      setSpendError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Simulate</h1>

        <section className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white p-4">
          <h2 className="text-sm font-semibold">Simulate paycheck deposit</h2>
          <input
            type="number"
            value={paycheckAmount}
            onChange={(e) => setPaycheckAmount(e.target.value)}
            className="rounded-md border border-[#bbb] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onSimulatePaycheck}
            className="rounded-lg bg-[#1c3812] px-4 py-2 text-sm font-semibold text-white"
          >
            Simulate paycheck
          </button>
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white p-4">
          <h2 className="text-sm font-semibold">Simulate spend</h2>
          <input
            type="text"
            placeholder="Merchant"
            value={spendMerchant}
            onChange={(e) => setSpendMerchant(e.target.value)}
            className="rounded-md border border-[#bbb] px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Amount"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
            className="rounded-md border border-[#bbb] px-3 py-2 text-sm"
          />
          {spendError ? <p className="text-sm text-red-700">{spendError}</p> : null}
          <button
            type="button"
            onClick={onSimulateSpend}
            className="rounded-lg bg-[#1c3812] px-4 py-2 text-sm font-semibold text-white"
          >
            Simulate spend
          </button>
        </section>
      </div>
    </div>
  );
}
