import { Link } from "wouter";
import { BtnLink, Icon } from "@/components/ui";
import { UNITS, ALL_QUESTIONS } from "@/content/calc1";
import { GEN_LIST } from "@/content/calc1/generators";
import { TOOLS_META } from "@/tools/meta";

const SPLASHES = ["Now with 100% more derivatives!", "ADHD-approved!", "Also try: sleeping!", "Limits exist!", "Creeper-free math!", "Mine your A+!"];

export default function Landing() {
  const splash = SPLASHES[new Date().getDate() % SPLASHES.length];
  const features = [
    { emo: "🗺️", t: "The whole Calc 1 course", d: `${UNITS.length} biomes, from functions to integrals, each lesson in bite-size blocks with an "explain like I'm 5" first.` },
    { emo: "⚔️", t: `${ALL_QUESTIONS.length}+ practice questions`, d: `Hints that nudge, solutions that reveal one step at a time, plus ${GEN_LIST.length} infinite generators that never run out.` },
    { emo: "🧪", t: `${Object.keys(TOOLS_META).length} interactive math tools`, d: "Shrink h and watch a secant become a tangent. Tune sliders until a piecewise function goes smooth." },
    { emo: "🐉", t: "Boss-fight mock exams", d: "Timed, with hearts and a boss health bar, modeled on real Math 1200 Test 2 papers." },
    { emo: "🔥", t: "Built for ADHD brains", d: "One block at a time, focus timer, daily quests, streaks, XP for effort, low-stim mode." },
    { emo: "🌌", t: "End City study sessions", d: "Walk the End ship, open the bookshelf, set your timer, and watch the countdown in the violet sky." },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="wrap hero">
        <div className="row" style={{ justifyContent: "center", gap: 14 }}>
          <Icon name="pickaxe" size="xl" />
          <h1 style={{ margin: 0 }}>StudyCraft</h1>
        </div>
        <div style={{ height: 0, position: "relative" }}>
          <span className="splash" style={{ position: "absolute", right: "18%", top: -14 }}>{splash}</span>
        </div>
        <p className="sub on-sky">Your study world for <strong>MATH 1200: Single-Variable Calculus I</strong>. Lessons, tools, hundreds of questions and mock exams, designed so an ADHD brain actually wants to come back tomorrow.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <BtnLink href="/home" kind="primary" size="lg">▶ Play (no account needed)</BtnLink>
          <BtnLink href="/auth" size="lg">💾 Create a save file</BtnLink>
        </div>
        <p className="small on-sky" style={{ marginTop: 10 }}>Progress saves on this device right away. Make an account to keep it everywhere.</p>
      </div>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <div className="grid-3">
          {features.map((f) => (
            <div key={f.t} className="panel">
              <div className="feature-emo">{f.emo}</div>
              <h3>{f.t}</h3>
              <p className="muted" style={{ margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
        <div className="panel center" style={{ marginTop: 24 }}>
          <h3>How a session works</h3>
          <div className="grid-4" style={{ marginTop: 12 }}>
            {[["1", "🔥", "Light the Focus Furnace (10–25 min)"], ["2", "📖", "Do one lesson, one block at a time"], ["3", "⚔️", "Answer questions, earn XP"], ["4", "📅", "Check in: your streak grows"]].map(([n, e, t]) => (
              <div key={n} className="slot"><div style={{ fontSize: 30 }}>{e}</div><strong>Step {n}</strong><div className="small">{t}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="grow" />
      <div className="ground" />
      <footer className="center small" style={{ padding: 12, background: "#000", color: "#aaa" }}>
        StudyCraft is a fan-made study tool, not affiliated with Mojang or Microsoft. <Link href="/home" style={{ color: "#ddd" }}>Enter</Link>
      </footer>
    </div>
  );
}
