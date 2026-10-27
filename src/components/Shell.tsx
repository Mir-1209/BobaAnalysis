import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Icon } from "./ui";

export const HOTBAR = [
  { href: "/home", emo: "🏠", lbl: "Base" },
  { href: "/calc", emo: "🗺️", lbl: "Calc 1" },
  { href: "/calc/practice", emo: "⚔️", lbl: "Practice" },
  { href: "/calc/boss", emo: "🐉", lbl: "Bosses" },
  { href: "/study", emo: "🌌", lbl: "End City" },
  { href: "/tools", emo: "🧪", lbl: "Tools" },
  { href: "/calc/cheatsheet", emo: "📜", lbl: "Cheat" },
  { href: "/tracker", emo: "📅", lbl: "Tracker" },
  { href: "/settings", emo: "⚙️", lbl: "Settings" },
] as const;

function activeIndex(path: string): number {
  // most specific match wins
  let best = -1;
  let len = 0;
  HOTBAR.forEach((h, i) => {
    if ((path === h.href || path.startsWith(h.href + "/")) && h.href.length > len) {
      best = i;
      len = h.href.length;
    }
  });
  return best;
}

export function Shell({ children }: { children: ReactNode }) {
  const [path, navigate] = useLocation();
  const { level, streak, state, user, sync, toasts } = useStore();
  const active = activeIndex(path);

  // Minecraft muscle memory: number keys 1–9 switch hotbar slots.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable))) return;
      const n = Number(e.key);
      if (n >= 1 && n <= HOTBAR.length) navigate(HOTBAR[n - 1]!.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/home" className="brand" aria-label="StudyCraft home">
            <Icon name="pickaxe" size="lg" />
            <span className="hide-sm">StudyCraft</span>
          </Link>
          <div className="grow" />
          <div className="row" style={{ gap: 10 }}>
            <span className="stat-pill" title={`${streak}-day streak`}>
              <Icon name="flame" /> {streak}
            </span>
            <span className="stat-pill hide-sm" title="Total XP">
              <Icon name="diamond" /> {state.xp.toLocaleString()}
            </span>
            <div style={{ display: "grid", gap: 2, minWidth: 130 }} title={`Level ${level.level}: ${level.into}/${level.need} XP`}>
              <div className="center xp-level">{level.level}</div>
              <div className="xpbar">
                <i style={{ width: `calc(${level.progress * 100}% - 4px)` }} />
              </div>
            </div>
            <Link href={user ? "/settings" : "/auth"} className="stat-pill" style={{ textDecoration: "none" }} title={user ? `Signed in as ${user.email}` : "Save your progress to an account"}>
              {user ? (sync === "offline" ? "⚠️" : sync === "saving" ? "💾" : "✅") : "👤"}
              <span className="hide-sm">{user ? user.name.split(" ")[0] : "Save"}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="hotbar" aria-label="Main">
        {HOTBAR.map((h, i) => (
          <Link key={h.href} href={h.href} className={i === active ? "active" : ""} aria-current={i === active ? "page" : undefined} title={`${h.lbl} (${i + 1})`}>
            <span className="key">{i + 1}</span>
            <span className="emo" aria-hidden>{h.emo}</span>
            <span className="lbl">{h.lbl}</span>
          </Link>
        ))}
      </nav>

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icon name={(t.icon as "star") ?? "star"} size="lg" />
            <div>
              <div className="t1">{t.title}</div>
              <div className="t2">{t.body}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
