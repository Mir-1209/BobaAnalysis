import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { Meter, Panel, BtnLink } from "@/components/ui";
import { courseMastery } from "@/content/calc1/extras";
import { COURSE, LESSONS, ALL_QUESTIONS } from "@/content/calc1";
import { biomeTexture } from "@/lib/biomes";

export default function Courses() {
  const { state } = useStore();
  const done = LESSONS.filter((l) => state.lessons[l.lesson.id]).length;
  return (
    <div className="wrap page stack-lg">
      <h1 className="on-sky shadow-text">📚 Your courses</h1>
      <div className="grid-2">
        <Link href="/calc" className="unit-card">
          <div className="card" style={{ padding: 16 }}>
            <div className="tex" style={{ backgroundImage: biomeTexture("plains", 3), height: 90 }}>
              <span className="num">{COURSE.code}</span><span className="emo">📐</span>
            </div>
            <h2 style={{ marginBottom: 4 }}>Calculus 1</h2>
            <div className="muted small">{COURSE.title} · {COURSE.school}</div>
            <p className="small">{LESSONS.length} lessons · {ALL_QUESTIONS.length} questions · infinite practice · 4 boss fights</p>
            <Meter value={courseMastery(state)} kind="xp" />
            <div className="row-between small" style={{ marginTop: 6 }}><span>{done}/{LESSONS.length} lessons done</span><span className="chip accent">OPEN ▶</span></div>
          </div>
        </Link>
        <div className="card" style={{ padding: 16, opacity: 0.92 }}>
          <div className="tex" style={{ backgroundImage: biomeTexture("cave", 5), height: 90, margin: "-16px -16px 12px", position: "relative" }}>
            <span className="emo" style={{ position: "absolute", right: 12, bottom: 6, fontSize: 34 }}>🛠️</span>
          </div>
          <h2 style={{ marginBottom: 4 }}>ECS</h2>
          <div className="muted small">Being built next</div>
          <p className="small">This world is still generating. Track its assignments and exams in the Tracker for now; lessons drop here next.</p>
          <BtnLink href="/tracker" size="sm">📅 Track ECS work</BtnLink>
        </div>
        <div className="card" style={{ padding: 16, borderStyle: "dashed" }}>
          <h2 style={{ marginBottom: 4 }}>➕ Another class</h2>
          <p className="small muted">Every class gets the same treatment: a biome map, bite-size lessons, practice, boss fights and the tracker. Assignments for any course can already go in the Tracker.</p>
          <BtnLink href="/tracker" size="sm">Add its deadlines</BtnLink>
        </div>
      </div>
      <Panel title="Coming soon to every course" icon="potion">
        <ul className="small" style={{ margin: 0 }}>
          <li><strong>Google Calendar:</strong> the reminder feed already works (Tracker → Calendar). Two-way sync is next.</li>
          <li><strong>Brightspace:</strong> automatic assignment import from Vanderbilt's Brightspace.</li>
          <li><strong>Soundtrack:</strong> ambient music for the End City.</li>
        </ul>
      </Panel>
    </div>
  );
}
