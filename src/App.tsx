import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, Redirect } from "wouter";
import { Shell } from "./components/Shell";
import { useStore } from "./lib/store";
import { ADVANCEMENTS, unlockedAdvancements } from "./content/calc1/extras";
import { sfx } from "./lib/sound";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseMap from "./pages/CourseMap";
import LessonPage from "./pages/Lesson";
import Practice from "./pages/Practice";
import Boss from "./pages/Boss";
import CheatSheet from "./pages/CheatSheet";
import Tracker from "./pages/Tracker";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Heavy pages load on demand: the 3D End City (three.js + a 19 MB world) and the tool lab.
const Tools = lazy(() => import("./pages/Tools"));
const Study = lazy(() => import("./pages/Study"));

const SEEN = "sc:adv-seen";

/** Pops a Minecraft "Advancement Made!" toast the first time each achievement unlocks. */
function AdvancementWatcher() {
  const { state, ready, toast } = useStore();
  useEffect(() => {
    if (!ready) return;
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(SEEN) ?? "null") ?? null;
    } catch {
      seen = [];
    }
    const now = unlockedAdvancements(state);
    if (seen === null) {
      // first visit on this device: don't spam toasts for old progress
      localStorage.setItem(SEEN, JSON.stringify(now));
      return;
    }
    const fresh = now.filter((id) => !seen.includes(id));
    if (!fresh.length) return;
    fresh.forEach((id, i) => {
      const a = ADVANCEMENTS.find((x) => x.id === id)!;
      window.setTimeout(() => {
        sfx.advancement();
        toast({ title: "Advancement Made!", body: `${a.title}: ${a.desc}`, icon: a.icon });
      }, 600 + i * 900);
    });
    try {
      localStorage.setItem(SEEN, JSON.stringify(now));
    } catch {
      /* ignore */
    }
  }, [state, ready, toast]);
  return null;
}

function Loading() {
  return <div className="wrap page"><div className="panel center px" style={{ fontSize: "1.3rem" }}>⛏️ Loading chunks…</div></div>;
}

export default function App() {
  const { user, ready } = useStore();
  return (
    <>
      <AdvancementWatcher />
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/">{ready && user ? <Redirect to="/home" /> : <Landing />}</Route>
          <Route path="/study"><Study /></Route>
          <Route>
            <Shell>
              <Suspense fallback={<Loading />}>
                <Switch>
                  <Route path="/home" component={Home} />
                  <Route path="/courses" component={Courses} />
                  <Route path="/calc" component={CourseMap} />
                  <Route path="/calc/l/:id">{(p) => <LessonPage id={p.id} />}</Route>
                  <Route path="/calc/practice" component={Practice} />
                  <Route path="/calc/boss">{() => <Boss />}</Route>
                  <Route path="/calc/boss/:id">{(p) => <Boss id={p.id} />}</Route>
                  <Route path="/calc/cheatsheet" component={CheatSheet} />
                  <Route path="/tools">{() => <Tools />}</Route>
                  <Route path="/tools/:id">{(p) => <Tools id={p.id} />}</Route>
                  <Route path="/tracker" component={Tracker} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/auth" component={Auth} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </Shell>
          </Route>
        </Switch>
      </Suspense>
    </>
  );
}
