import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { Meter, BtnLink } from "@/components/ui";
import { UNITS, COURSE } from "@/content/calc1";
import { lessonMastery, unitMastery, nextUp } from "@/content/calc1/extras";
import { biomeTexture } from "@/lib/biomes";

const EXAMS: Array<{ n: 1 | 2 | 3; title: string; boss: string }> = [
  { n: 1, title: "Exam 1 · Foundations", boss: "exam1" },
  { n: 2, title: "Exam 2 · Limits & Derivatives", boss: "exam2" },
  { n: 3, title: "Final stretch · Applications & Integrals", boss: "final" },
];

export default function CourseMap() {
  const { state } = useStore();
  const next = nextUp(state);
  return (
    <div className="wrap page stack-lg">
      <div className="row-between on-sky">
        <div>
          <div className="chunky">{COURSE.code} · {COURSE.school}</div>
          <h1 className="shadow-text" style={{ margin: "6px 0" }}>🗺️ Calculus 1 world map</h1>
          <p style={{ margin: 0, fontWeight: 500 }}>Every biome is a unit. Every row is a 8–15 minute lesson. Do them in order, or jump to what's on your next exam.</p>
        </div>
        <div className="row">
          <BtnLink href={`/calc/l/${next.lesson.id}`} kind="primary">▶ Continue: {next.lesson.title}</BtnLink>
          <BtnLink href="/calc/cheatsheet">📜 Cheat sheet</BtnLink>
        </div>
      </div>

      {EXAMS.map((ex) => (
        <section key={ex.n} className="stack">
          <div className="row-between on-sky">
            <h2 className="shadow-text" style={{ margin: 0 }}>{ex.title}</h2>
            <BtnLink href={`/calc/boss/${ex.boss}`} size="sm" kind="gold">🐉 Boss fight</BtnLink>
          </div>
          <div className="grid-3">
            {UNITS.filter((u) => u.exam === ex.n).map((u) => {
              const m = unitMastery(state, u.id);
              return (
                <div key={u.id} className="card unit-card">
                  <div className="tex" style={{ backgroundImage: biomeTexture(u.biome, u.n) }}>
                    <span className="num">UNIT {u.n} · {u.when}</span>
                    <span className="emo">{u.emoji}</span>
                  </div>
                  <h3 style={{ marginBottom: 2 }}>{u.title}</h3>
                  <p className="small muted" style={{ margin: "0 0 8px" }}>{u.summary}</p>
                  <Meter value={m} kind={m >= 0.999 ? "xp" : ""} />
                  <div style={{ margin: "8px -12px -8px" }}>
                    {u.lessons.map((l) => {
                      const lm = lessonMastery(state, l.id);
                      const done = Boolean(state.lessons[l.id]);
                      return (
                        <Link key={l.id} href={`/calc/l/${l.id}`} className="lesson-row">
                          <span className={`check-box ${done ? "on" : ""}`}>{done ? "✓" : ""}</span>
                          <span className="grow">
                            <span style={{ fontWeight: 600 }}>{l.emoji} {l.title}</span>
                            <span className="muted tiny" style={{ display: "block" }}>{l.minutes} min · {l.questions.length} questions{lm > 0 ? ` · ${Math.round(lm * 100)}% mastered` : ""}</span>
                          </span>
                          <span aria-hidden>▶</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
