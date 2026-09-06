import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import styles from "./ui.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  trailing?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  trailing,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`} {...props}>
      <span>{children}</span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </button>
  );
}

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className={styles.iconButton} aria-label={label} {...props}>{children}</button>;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info"; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[`badge-${tone}`]}`}>{children}</span>;
}

export function Card({ children, className = "", tone = "default" }: { children: ReactNode; className?: string; tone?: "default" | "raised" | "brand" | "accent" }) {
  return <article className={`${styles.card} ${styles[`card-${tone}`]} ${className}`}>{children}</article>;
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ label, hint, error, id, className = "", ...props }: FieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <label className={`${styles.field} ${className}`} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {error ? <small className={styles.fieldError} id={`${inputId}-error`}>{error}</small> : hint ? <small id={`${inputId}-hint`}>{hint}</small> : null}
    </label>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className={styles.progress}>
      <div><span>{label}</span><strong>{safeValue}%</strong></div>
      <div className={styles.progressTrack} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
        <i style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function Alert({ tone = "info", title, children }: { tone?: "info" | "success" | "warning" | "danger"; title: string; children: ReactNode }) {
  return (
    <div className={`${styles.alert} ${styles[`alert-${tone}`]}`} role={tone === "danger" ? "alert" : "status"}>
      <span aria-hidden="true">{tone === "success" ? "✓" : tone === "warning" ? "!" : tone === "danger" ? "×" : "i"}</span>
      <div><strong>{title}</strong><p>{children}</p></div>
    </div>
  );
}
