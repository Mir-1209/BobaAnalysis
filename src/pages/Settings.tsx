import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Api } from "@/lib/api";
import { THEMES } from "@/lib/themes";
import { texture } from "@/lib/pixel";
import { Btn, BtnLink, Panel } from "@/components/ui";
import { ADVANCEMENTS, unlockedAdvancements } from "@/content/calc1/extras";
import { Icon } from "@/components/ui";

export default function Settings() {
  const { state, updateSettings, user, signout } = useStore();
  const [, navigate] = useLocation();
  const s = state.settings;
  const [pw, setPw] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");
  const [del, setDel] = useState("");
  const unlocked = new Set(unlockedAdvancements(state));

  return (
    <div className="wrap page stack-lg">
      <h1 className="on-sky shadow-text">⚙️ Settings</h1>

      <Panel title="Theme (biome)" icon="map">
        <div className="grid-4">
          {THEMES.map((t) => (
            <button key={t.id} className={`theme-swatch ${s.theme === t.id ? "on" : ""}`} onClick={() => updateSettings({ theme: t.id })} aria-pressed={s.theme === t.id}>
              <div className="sw" style={{ backgroundImage: texture(t.strip.palette, t.strip.seed, 16, t.strip.top ? { topRows: { colors: t.strip.top, rows: 4 } } : {}), backgroundColor: t.vars["--bg"] }} />
              <div style={{ padding: "6px 2px" }}><strong>{t.emoji} {t.name}</strong><div className="tiny muted">{t.blurb}</div></div>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid-2">
        <Panel title="Comfort & focus" icon="potion">
          <div className="stack">
            <div>
              <div className="small" style={{ fontWeight: 700 }}>Heading font</div>
              <div className="tabs">
                <button className={s.font === "pixel" ? "on" : ""} onClick={() => updateSettings({ font: "pixel" })}>Pixel</button>
                <button className={s.font === "readable" ? "on" : ""} onClick={() => updateSettings({ font: "readable" })}>Readable</button>
                <button className={s.font === "dyslexic" ? "on" : ""} onClick={() => updateSettings({ font: "dyslexic" })}>Hyperlegible</button>
              </div>
            </div>
            <label className="row"><input type="checkbox" checked={s.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} /> Sound effects (XP pings, level-ups)</label>
            <label className="row"><input type="checkbox" checked={s.motion} onChange={(e) => updateSettings({ motion: e.target.checked })} /> Animations</label>
            <p className="tiny muted" style={{ margin: 0 }}>Overloaded? Pick the Low-Stim theme, Readable font, and turn off animations.</p>
          </div>
        </Panel>
        <Panel title="Daily goals" icon="flame">
          <div className="stack">
            <label className="field"><span>Your name</span><input className="input" value={s.displayName} onChange={(e) => updateSettings({ displayName: e.target.value.slice(0, 60) })} /></label>
            <label className="field"><span>Focus minutes per day: {s.dailyGoalMinutes}</span><input type="range" min={5} max={180} step={5} value={s.dailyGoalMinutes} onChange={(e) => updateSettings({ dailyGoalMinutes: Number(e.target.value) })} /></label>
            <label className="field"><span>Questions per day: {s.dailyGoalQuestions}</span><input type="range" min={3} max={100} step={1} value={s.dailyGoalQuestions} onChange={(e) => updateSettings({ dailyGoalQuestions: Number(e.target.value) })} /></label>
            <p className="tiny muted" style={{ margin: 0 }}>Start small. A goal you hit every day beats a big goal you dread.</p>
          </div>
        </Panel>
      </div>

      <Panel title={`Advancements (${unlocked.size}/${ADVANCEMENTS.length})`} icon="star">
        <div className="grid-3">
          {ADVANCEMENTS.map((a) => (
            <div key={a.id} className="slot row" style={{ gap: 10, opacity: unlocked.has(a.id) ? 1 : 0.5 }}>
              <Icon name={a.icon} size="lg" className={unlocked.has(a.id) ? "" : "dead"} />
              <div><strong>{a.title}</strong><div className="tiny">{a.desc}</div></div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Account" icon="chest">
        {user ? (
          <div className="stack">
            <p style={{ margin: 0 }}>Signed in as <strong>{user.email}</strong>. Progress syncs to your account.</p>
            <div className="row">
              <a className="btn sm" href="/api/export">⬇️ Export my data</a>
              <Btn size="sm" onClick={async () => { await signout(); navigate("/"); }}>Sign out</Btn>
            </div>
            <form className="row" style={{ alignItems: "end" }} onSubmit={async (e) => { e.preventDefault(); setMsg(""); try { await Api.changePassword(pw); setMsg("Password changed ✓"); setPw({ current: "", next: "" }); } catch (err) { setMsg(err instanceof Error ? err.message : "Couldn't change it"); } }}>
              <label className="field grow"><span>Current password</span><input className="input" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
              <label className="field grow"><span>New password</span><input className="input" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" minLength={8} /></label>
              <Btn type="submit" size="sm">Change password</Btn>
            </form>
            {msg && <div className="feedback hint small">{msg}</div>}
            <details className="fold">
              <summary className="bad">Delete account</summary>
              <p className="small">This permanently deletes your account and all progress. Type your password to confirm.</p>
              <div className="row">
                <input className="input" type="password" value={del} onChange={(e) => setDel(e.target.value)} style={{ maxWidth: 260 }} />
                <Btn size="sm" kind="danger" onClick={async () => { try { await Api.deleteAccount(del); await signout(); navigate("/"); } catch (err) { setMsg(err instanceof Error ? err.message : "Couldn't delete"); } }}>Delete forever</Btn>
              </div>
            </details>
          </div>
        ) : (
          <div className="row-between">
            <p style={{ margin: 0 }}>You're playing as a guest: progress is saved in this browser only.</p>
            <BtnLink href="/auth" kind="primary">💾 Create account</BtnLink>
          </div>
        )}
      </Panel>
      <p className="tiny on-sky center">End City 3D model: "END CITY MINECRAFT" by DURVESH123 on Sketchfab, CC BY 4.0. StudyCraft is fan-made and not affiliated with Mojang or Microsoft.</p>
    </div>
  );
}
