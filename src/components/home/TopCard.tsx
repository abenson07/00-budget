import type { ReactNode } from "react";

type TopCardProps = {
  /** Pre-formatted safe-to-spend string (e.g. from `formatUsd`). */
  formattedSafe: string;
  balanceAlert: ReactNode;
  essentials: ReactNode;
};

/** Hero card on mobile home (Figma: TopCard / Home). */
export function TopCard({
  formattedSafe,
  balanceAlert,
  essentials,
}: TopCardProps) {
  return (
    <section
      className="flex w-full flex-col gap-6 rounded-xl px-6 py-8 text-[#f9f8f4]"
      style={{
        backgroundImage:
          "linear-gradient(50.25deg, rgb(0,0,0) 12.7%, rgb(70,69,66) 65%, rgb(148,147,144) 84.3%, rgb(183,182,179) 98.9%)",
      }}
    >
      <p className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight">
        Safe to spend
      </p>
      <div>
        <p className="text-[2.75rem] font-bold leading-none tracking-tight sm:text-[4.5rem]">
          {formattedSafe}
        </p>
        {balanceAlert}
      </div>
      <div className="flex flex-col gap-4 pt-2">{essentials}</div>
    </section>
  );
}
