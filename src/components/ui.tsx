import type { ReactNode, CSSProperties } from "react";
import { Link } from "wouter";
import { iconUri, type IconName } from "@/lib/pixel";

export function Icon({ name, size = "", className = "", title }: { name: IconName; size?: "" | "lg" | "xl"; className?: string; title?: string }) {
  return <i className={`icon ${size} ${className}`} style={{ backgroundImage: iconUri(name) }} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} />;
}

export function Panel({ title, icon, emoji, children, className = "", tight, right, style }: {
  title?: ReactNode; icon?: IconName; emoji?: string; children: ReactNode; className?: string; tight?: boolean; right?: ReactNode; style?: CSSProperties;
}) {
  return (
    <section className={`panel ${tight ? "tight" : ""} ${className}`} style={style}>
      {title && (
        <div className="title-bar">
          {icon && <Icon name={icon} />}
          {emoji && <span aria-hidden>{emoji}</span>}
          <span className="grow">{title}</span>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Btn({ children, onClick, kind = "", size = "", type = "button", disabled, className = "", title }: {
  children: ReactNode; onClick?: () => void; kind?: "" | "primary" | "gold" | "danger" | "ghost"; size?: "" | "sm" | "lg"; type?: "button" | "submit"; disabled?: boolean; className?: string; title?: string;
}) {
  return (
    <button type={type} className={`btn ${kind} ${size} ${className}`} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function BtnLink({ href, children, kind = "", size = "", className = "" }: { href: string; children: ReactNode; kind?: "" | "primary" | "gold" | "danger" | "ghost"; size?: "" | "sm" | "lg"; className?: string }) {
  return (
    <Link href={href} className={`btn ${kind} ${size} ${className}`}>
      {children}
    </Link>
  );
}

export function Meter({ value, kind = "", label }: { value: number; kind?: "" | "gold" | "xp" | "bad"; label?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`meter ${kind}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function LevelChip({ level }: { level: 1 | 2 | 3 }) {
  const label = level === 1 ? "🪵 Wood" : level === 2 ? "⛓️ Iron" : "💎 Diamond";
  return <span className={`chip lvl${level}`}>{label}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
