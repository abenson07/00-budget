import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "cta" | "md" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-budget-forest text-budget-on-dark",
  secondary: "bg-budget-sage-panel text-budget-forest",
  ghost: "border border-budget-card-border bg-white text-budget-ink",
  danger: "bg-budget-risk-ink text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  cta: "h-14 px-6 text-body",
  md: "h-11 px-5 text-meta",
  sm: "h-9 px-4 text-label",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-opacity active:opacity-90 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-budget-forest";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

export type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & { href: string };

function classes({
  variant = "primary",
  size = "cta",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "className">) {
  return [
    base,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps | ButtonLinkProps) {
  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonLinkProps;
    return (
      <Link href={href} className={classes({ variant, size, fullWidth, className })} {...anchorRest}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={classes({ variant, size, fullWidth, className })}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
