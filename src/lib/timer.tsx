import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "./store";
import { sfx } from "./sound";

// One focus timer for the whole app: the Focus Furnace on Base Camp and the sky clock
// in the End City share it, and it survives reloads.
const KEY = "sc:timer:v1";

export interface TimerState {
  task: string;
  minutes: number;
  /** epoch ms when it ends (while running) */
  endsAt: number | null;
  /** ms left when paused */
  pausedLeft: number | null;
  startedAt: number;
}

interface TimerCtx {
  timer: TimerState | null;
  left: number; // ms
  running: boolean;
  start: (minutes: number, task: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addMinutes: (m: number) => void;
}

const Ctx = createContext<TimerCtx | null>(null);

export function useTimer(): TimerCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTimer outside TimerProvider");
  return c;
}

function load(): TimerState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TimerState) : null;
  } catch {
    return null;
  }
}
function save(t: TimerState | null) {
  try {
    if (t) localStorage.setItem(KEY, JSON.stringify(t));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const { record, toast } = useStore();
  const [timer, setTimer] = useState<TimerState | null>(() => load());
  const [now, setNow] = useState(Date.now());
  const done = useRef(false);

  const set = useCallback((t: TimerState | null) => {
    setTimer(t);
    save(t);
  }, []);

  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(iv);
  }, []);

  const left = timer ? (timer.endsAt ? timer.endsAt - now : timer.pausedLeft ?? 0) : 0;
  const running = Boolean(timer?.endsAt);

  // Finished: bank the minutes, celebrate, clear.
  useEffect(() => {
    if (!timer?.endsAt || left > 0 || done.current) return;
    done.current = true;
    const minutes = timer.minutes;
    record({ t: "focus", minutes });
    sfx.done();
    toast({ title: "Smelting complete!", body: `${minutes} focused minutes banked${timer.task ? ` on "${timer.task}"` : ""}. Take a 5-minute break 🧃`, icon: "clock" });
    try {
      if ("Notification" in window && Notification.permission === "granted") new Notification("StudyCraft: focus block done!", { body: `${minutes} minutes banked. Break time.` });
    } catch {
      /* ignore */
    }
    set(null);
  }, [left, timer, record, toast, set]);

  const start = useCallback((minutes: number, task: string) => {
    done.current = false;
    const m = Math.max(1, Math.min(180, Math.round(minutes)));
    set({ task: task.slice(0, 80), minutes: m, endsAt: Date.now() + m * 60_000, pausedLeft: null, startedAt: Date.now() });
    sfx.click();
    try {
      if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    } catch {
      /* ignore */
    }
  }, [set]);

  const pause = useCallback(() => {
    if (!timer?.endsAt) return;
    set({ ...timer, endsAt: null, pausedLeft: Math.max(0, timer.endsAt - Date.now()) });
  }, [timer, set]);

  const resume = useCallback(() => {
    if (!timer || timer.endsAt || timer.pausedLeft == null) return;
    set({ ...timer, endsAt: Date.now() + timer.pausedLeft, pausedLeft: null });
  }, [timer, set]);

  /** Stopping early still banks the whole minutes you actually did. */
  const stop = useCallback(() => {
    if (!timer) return;
    const remaining = timer.endsAt ? timer.endsAt - Date.now() : timer.pausedLeft ?? 0;
    const did = Math.floor((timer.minutes * 60_000 - remaining) / 60_000);
    if (did >= 1) {
      record({ t: "focus", minutes: did });
      toast({ title: "Focus saved", body: `${did} minute${did === 1 ? "" : "s"} banked. Every minute counts.`, icon: "clock" });
    }
    set(null);
  }, [timer, record, toast, set]);

  const addMinutes = useCallback((m: number) => {
    if (!timer) return;
    set({
      ...timer,
      minutes: timer.minutes + m,
      endsAt: timer.endsAt ? timer.endsAt + m * 60_000 : null,
      pausedLeft: timer.pausedLeft != null ? timer.pausedLeft + m * 60_000 : null,
    });
  }, [timer, set]);

  return <Ctx.Provider value={{ timer, left, running, start, pause, resume, stop, addMinutes }}>{children}</Ctx.Provider>;
}
