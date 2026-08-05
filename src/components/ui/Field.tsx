import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["flex flex-col", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function Label({
  className,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={[
        "block text-label uppercase tracking-wide text-budget-ink-soft",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "mt-1 h-12 w-full rounded-control border border-budget-card-border bg-white px-4 text-body text-budget-ink placeholder:text-budget-ink-soft focus:border-budget-forest/40 focus:outline-none focus:ring-2 focus:ring-budget-forest/15",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

export function TextArea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[
        "mt-1 w-full rounded-control border border-budget-card-border bg-white px-4 py-3 text-body text-budget-ink placeholder:text-budget-ink-soft focus:border-budget-forest/40 focus:outline-none focus:ring-2 focus:ring-budget-forest/15",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
