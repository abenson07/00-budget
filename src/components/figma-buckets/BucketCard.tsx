import {
  FIGMA_BUCKET_IMG_GROCERIES,
  FIGMA_BUCKET_IMG_RENT,
  FIGMA_BUCKET_IMG_SPENDING,
  FIGMA_BUCKET_LOCK_ICON,
} from "./assets";
import { FigmaPercentageTag } from "./FigmaPercentageTag";

export type BucketCardVariant =
  | "home"
  | "spendingMoney"
  | "monthlySpending"
  | "bill"
  | "transaction";

export type BucketCardRisk = "safe" | "atRisk";

export type BucketCardCadence =
  | {
      mode: "perPaycheck";
      label: string;
    }
  | {
      mode: "topOff";
      label: string;
    };

type CommonClass = {
  className?: string;
};

type HomeCardProps = CommonClass & {
  variant: "home";
  state?: "default";
  title: string;
  amountLabel: string;
  percentLabel: string;
  risk?: BucketCardRisk;
};

type SpendingMoneyCardProps = CommonClass & {
  variant: "spendingMoney";
  state: "default" | "locked";
  title: string;
  cadence: Extract<BucketCardCadence, { mode: "perPaycheck" }>;
  balanceLabel: string;
  percentLabel: string;
  risk?: BucketCardRisk;
  imageSrc?: string;
  lockIconSrc?: string;
};

type MonthlySpendingCardProps = CommonClass & {
  variant: "monthlySpending";
  state?: "default";
  title: string;
  cadence: Extract<BucketCardCadence, { mode: "topOff" }>;
  balanceLabel: string;
  percentLabel: string;
  risk?: BucketCardRisk;
  imageSrc?: string;
};

type BillCardProps = CommonClass & {
  variant: "bill";
  state?: "default";
  title: string;
  cadence: Extract<BucketCardCadence, { mode: "perPaycheck" }>;
  due?: { label: string };
  balanceLabel: string;
  percentLabel: string;
  risk?: BucketCardRisk;
  imageSrc?: string;
};

type TransactionDefaultCardProps = CommonClass & {
  variant: "transaction";
  state?: "default";
  title: string;
  amountLabel: string;
  imageSrc?: string;
};

type TransactionSplitCardProps = CommonClass & {
  variant: "transaction";
  state: "split";
  title: string;
  amountLabel: string;
  splitLabel: string;
  imageSrc?: string;
};

export type BucketCardProps =
  | HomeCardProps
  | SpendingMoneyCardProps
  | MonthlySpendingCardProps
  | BillCardProps
  | TransactionDefaultCardProps
  | TransactionSplitCardProps;

function RiskPercentTag({
  risk,
  percentLabel,
}: {
  risk: BucketCardRisk;
  percentLabel: string;
}) {
  return (
    <FigmaPercentageTag inverse={false} variant={risk === "atRisk" ? "atRisk" : "safe"}>
      {percentLabel}
    </FigmaPercentageTag>
  );
}

/**
 * Unified bucket card.
 *
 * This intentionally maps each variant/state to the same structure as the
 * original Figma node-specific components so we can delete those components
 * without changing markup/layout.
 */
export function BucketCard(props: BucketCardProps) {
  switch (props.variant) {
    case "home": {
      const state = props.state ?? "default";
      const risk = props.risk ?? "atRisk";

      return (
        <div
          className={[
            "flex size-full min-h-[7.5rem] w-full flex-col items-start justify-between rounded-lg bg-[#e6e8dd] p-3",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-figma-node="28:5533"
          data-bucket-variant={props.variant}
          data-bucket-state={state}
        >
          <div className="flex w-full shrink-0 flex-col items-start">
            <p className="w-full text-[12px] font-bold leading-normal text-[#1c3812] opacity-80">
              {props.title}
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col items-center justify-end">
            <div className="flex w-full shrink-0 items-end justify-between">
              <p className="font-sans-condensed min-h-px min-w-px flex-1 text-[32px] font-bold leading-normal text-[#1b1b1b]">
                {props.amountLabel}
              </p>
              <RiskPercentTag risk={risk} percentLabel={props.percentLabel} />
            </div>
          </div>
        </div>
      );
    }

    case "spendingMoney": {
      const state = props.state;
      const risk = props.risk ?? "safe";
      const locked = state === "locked";
      const imageSrc = props.imageSrc ?? (locked ? FIGMA_BUCKET_IMG_GROCERIES : FIGMA_BUCKET_IMG_SPENDING);
      const lockIconSrc = props.lockIconSrc ?? FIGMA_BUCKET_LOCK_ICON;

      return (
        <div
          className={[
            "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-figma-node="28:5541"
          data-bucket-variant={props.variant}
          data-bucket-state={state}
        >
          <div className="flex h-full flex-row items-center self-stretch">
            <div className="flex h-full shrink-0 items-center p-0.5">
              <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
                <img
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
                  src={imageSrc}
                />
              </div>
            </div>
          </div>
          <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
            <div className="flex h-full flex-row items-center self-stretch">
              <div className="flex h-full shrink-0 flex-col items-start gap-1 leading-normal not-italic">
                <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                  <p className="relative shrink-0 text-[24px] font-bold text-[#1b1b1b]">
                    {props.title}
                  </p>
                  {locked ? (
                    <img
                      alt=""
                      className="size-4 shrink-0"
                      src={lockIconSrc}
                    />
                  ) : null}
                </div>
                <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
                  {props.cadence.label}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-start justify-end gap-2">
              <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
                {props.balanceLabel}
              </p>
              <RiskPercentTag risk={risk} percentLabel={props.percentLabel} />
            </div>
          </div>
        </div>
      );
    }

    case "monthlySpending": {
      const state = props.state ?? "default";
      const risk = props.risk ?? "safe";
      const imageSrc = props.imageSrc ?? FIGMA_BUCKET_IMG_GROCERIES;

      return (
        <div
          className={[
            "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-figma-node="28:5582"
          data-bucket-variant={props.variant}
          data-bucket-state={state}
        >
          <div className="flex h-full flex-row items-center self-stretch">
            <div className="flex h-full shrink-0 items-center p-0.5">
              <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
                <img
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
                  src={imageSrc}
                />
              </div>
            </div>
          </div>
          <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
            <div className="flex h-full flex-row items-center self-stretch">
              <div className="flex h-full shrink-0 flex-col items-start gap-1 whitespace-nowrap leading-normal not-italic">
                <p className="relative shrink-0 text-[24px] font-bold text-[#1b1b1b]">
                  {props.title}
                </p>
                <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
                  {props.cadence.label}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-start justify-end gap-2">
              <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
                {props.balanceLabel}
              </p>
              <RiskPercentTag risk={risk} percentLabel={props.percentLabel} />
            </div>
          </div>
        </div>
      );
    }

    case "bill": {
      const state = props.state ?? "default";
      const risk = props.risk ?? "safe";
      const imageSrc = props.imageSrc ?? FIGMA_BUCKET_IMG_RENT;
      const dueLabel = props.due?.label ?? "Due in 3 days";

      return (
        <div
          className={[
            "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-figma-node="28:5552"
          data-bucket-variant={props.variant}
          data-bucket-state={state}
        >
          <div className="flex h-full flex-row items-center self-stretch">
            <div className="flex h-full shrink-0 items-center p-0.5">
              <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
                <img
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
                  src={imageSrc}
                />
              </div>
            </div>
          </div>
          <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
            <div className="flex h-full flex-row items-center self-stretch">
              <div className="flex h-full shrink-0 flex-col items-start gap-1 whitespace-nowrap leading-normal not-italic">
                <p className="relative shrink-0 text-[24px] font-bold text-[#1b1b1b]">
                  {props.title}
                </p>
                <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
                  {props.cadence.label}
                </p>
              </div>
            </div>
            <div className="flex w-20 shrink-0 flex-col items-end justify-center gap-1">
              <div className="flex w-full shrink-0 items-start justify-end gap-2">
                <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
                  {props.balanceLabel}
                </p>
                <RiskPercentTag risk={risk} percentLabel={props.percentLabel} />
              </div>
              <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-normal text-[#1c3812] opacity-50">
                {dueLabel}
              </p>
            </div>
          </div>
        </div>
      );
    }

    case "transaction": {
      const state = props.state ?? "default";
      const imageSrc = props.imageSrc ?? FIGMA_BUCKET_IMG_SPENDING;
      const showSplit = state === "split";

      return (
        <div
          className={[
            "flex min-h-[92px] w-full max-w-full items-center rounded-lg bg-[#e6e8dd] p-px",
            props.className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-figma-node="28:5675"
          data-bucket-variant={props.variant}
          data-bucket-state={state}
        >
          <div className="relative flex h-full shrink-0 items-center p-0.5">
            <div className="relative aspect-[4/3] h-full shrink-0 rounded-[5px]">
              <img
                alt=""
                className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[5px] object-cover"
                src={imageSrc}
              />
            </div>
          </div>
          <div className="relative flex min-h-px min-w-px flex-1 items-center justify-between px-3 py-5">
            <div className="flex h-full flex-row items-center self-stretch">
              <div className="flex h-full shrink-0 flex-col items-start gap-1 whitespace-nowrap leading-normal not-italic">
                <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
                  {props.title}
                </p>
                {showSplit ? (
                  <p className="relative shrink-0 text-[12px] font-bold text-[#1c3812] opacity-50">
                    {"splitLabel" in props ? props.splitLabel : null}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-start justify-end">
              <p className="relative shrink-0 whitespace-nowrap text-[24px] font-bold leading-normal text-[#1b1b1b]">
                {props.amountLabel}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}

