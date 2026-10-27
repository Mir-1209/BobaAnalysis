import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function Auth() {
  const { signin, signup, user, state } = useStore();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="wrap page">
        <Panel title="You're signed in" icon="emerald">
          <p>Signed in as <strong>{user.email}</strong>. Your progress syncs automatically.</p>
          <Btn kind="primary" onClick={() => navigate("/home")}>Go to Base Camp ▶</Btn>
        </Panel>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await signup(name, email, password);
      else await signin(email, password);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap page" style={{ maxWidth: 560 }}>
      <Panel title={mode === "signup" ? "Create your save file" : "Load your save file"} icon="chest">
        <div className="tabs" style={{ marginBottom: 14 }}>
          <button className={mode === "signup" ? "on" : ""} onClick={() => setMode("signup")}>New account</button>
          <button className={mode === "signin" ? "on" : ""} onClick={() => setMode("signin")}>Sign in</button>
        </div>
        {state.xp > 0 && <div className="feedback hint small">💎 Your guest progress ({state.xp} XP) will move into the account automatically.</div>}
        <form onSubmit={submit} className="stack" style={{ marginTop: 10 }}>
          {mode === "signup" && (
            <label className="field"><span>What should we call you?</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="name" /></label>
          )}
          <label className="field"><span>Email</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
          <label className="field"><span>Password {mode === "signup" && <span className="muted">(8+ characters)</span>}</span><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
          {error && <div className="feedback no">{error}</div>}
          <Btn type="submit" kind="primary" size="lg" disabled={busy}>{busy ? "⏳ One sec…" : mode === "signup" ? "Create account ▶" : "Sign in ▶"}</Btn>
        </form>
      </Panel>
    </div>
  );
}
