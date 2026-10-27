import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  applyEvent, bestStreak, dayKey, emptyDay, emptyState, levelFromXp, streak, DEFAULT_SETTINGS,
  type Assignment, type DayLog, type GameEvent, type GameState, type Settings,
} from "../../shared/rules";
import { Api, ApiError, type User } from "./api";
import { applyTheme } from "./themes";
import { setSound, sfx } from "./sound";

const GUEST_KEY = "sc:guest:v1";
const queueKey = (uid: string) => `sc:queue:${uid}`;

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private mode or full storage: progress still lives in memory for this visit */
  }
}
function drop(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function loadGuest(): GameState {
  const s = load<GameState>(GUEST_KEY);
  if (!s) return emptyState();
  return { ...emptyState(), ...s, settings: { ...DEFAULT_SETTINGS, ...s.settings } };
}

export interface Toast {
  id: number;
  title: string;
  body: string;
  icon?: string;
}

/** A game event before the store stamps today's date on it. */
export type NewEvent = GameEvent extends infer E ? (E extends GameEvent ? Omit<E, "day"> : never) : never;

type SyncStatus = "guest" | "synced" | "saving" | "offline";

interface StoreCtx {
  ready: boolean;
  user: User | null;
  state: GameState;
  sync: SyncStatus;
  today: string;
  todayLog: DayLog;
  level: ReturnType<typeof levelFromXp>;
  streak: number;
  bestStreak: number;
  /** Record progress. Returns the XP earned so the UI can pop "+15 XP". */
  record: (e: NewEvent) => number;
  updateSettings: (p: Partial<Settings>) => void;
  patchDay: (day: string, p: Partial<Pick<DayLog, "mood" | "energy" | "note" | "done">>) => void;
  saveAssignment: (a: Assignment) => void;
  deleteAssignment: (id: string) => void;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}

let toastId = 1;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<GameState>(() => loadGuest());
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>("guest");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [today, setToday] = useState(dayKey());
  const userRef = useRef<User | null>(null);
  // A synchronous mirror of `state`, so record() can return the XP it earned right away.
  const stateRef = useRef(state);
  const commit = useCallback((fn: (s: GameState) => GameState) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    return next;
  }, []);
  const queue = useRef<GameEvent[]>([]);
  const timer = useRef<number | null>(null);
  userRef.current = user;

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = toastId++;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4500);
  }, []);

  // Day rollover while the tab stays open (midnight studying is real).
  useEffect(() => {
    const iv = window.setInterval(() => setToday(dayKey()), 30_000);
    return () => window.clearInterval(iv);
  }, []);

  const flush = useCallback(async () => {
    const u = userRef.current;
    if (!u || queue.current.length === 0) return;
    const batch = queue.current.splice(0, 200);
    save(queueKey(u.id), queue.current);
    setSync("saving");
    try {
      await Api.events(batch);
      setSync(queue.current.length ? "saving" : "synced");
      if (queue.current.length) void flush();
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 429) {
        // The server rejected these for good (e.g. a day too far back). Don't retry forever.
        setSync("synced");
      } else {
        queue.current.unshift(...batch);
        save(queueKey(u.id), queue.current);
        setSync("offline");
      }
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), 1200);
  }, [flush]);

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && void flush();
    const onOnline = () => void flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
    };
  }, [flush]);

  /** After sign-in: send anything queued, move guest progress in, then load the account. */
  const adoptAccount = useCallback(async (u: User, isNew: boolean) => {
    userRef.current = u;
    setUser(u);
    queue.current = load<GameEvent[]>(queueKey(u.id)) ?? [];
    await flush();
    const guest = loadGuest();
    const hasGuestProgress = guest.xp > 0 || guest.assignments.length > 0 || Object.keys(guest.days).length > 0;
    let next: GameState;
    if (hasGuestProgress) {
      const { settings: _s, ...rest } = guest;
      next = (await Api.import(rest)).state;
      drop(GUEST_KEY);
    } else {
      next = (await Api.state()).state;
    }
    if (isNew) {
      // A brand-new account keeps the look the guest already picked.
      const s = { ...guest.settings, displayName: next.settings.displayName || u.name };
      next = { ...next, settings: (await Api.settings(s)).settings };
    }
    commit(() => next);
    setSync("synced");
  }, [flush, commit]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { user: u } = await Api.me();
        if (alive && u) await adoptAccount(u, false);
      } catch {
        // API down or offline: stay in guest mode, everything still works on this device.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [adoptAccount]);

  // Guest progress lives in this browser.
  useEffect(() => {
    if (ready && !user) save(GUEST_KEY, state);
  }, [state, user, ready]);

  // Theme, font, motion and sound follow settings everywhere.
  useEffect(() => {
    applyTheme(state.settings.theme, state.settings.font, state.settings.motion);
    setSound(state.settings.sound);
  }, [state.settings.theme, state.settings.font, state.settings.motion, state.settings.sound]);

  const record = useCallback<StoreCtx["record"]>((partial) => {
    const e = { ...partial, day: dayKey() } as GameEvent;
    const prev = stateRef.current;
    const next = commit((s) => applyEvent(s, e));
    const before = levelFromXp(prev.xp).level;
    const after = levelFromXp(next.xp).level;
    if (after > before) {
      window.setTimeout(() => {
        sfx.levelUp();
        toast({ title: "Level up!", body: `You reached level ${after}. Your brain just leveled up too.`, icon: "orb" });
      }, 250);
    }
    if (userRef.current) {
      queue.current.push(e);
      save(queueKey(userRef.current.id), queue.current);
      scheduleFlush();
    }
    return next.xp - prev.xp;
  }, [scheduleFlush, toast, commit]);

  const updateSettings = useCallback((p: Partial<Settings>) => {
    commit((s) => ({ ...s, settings: { ...s.settings, ...p } }));
    if (userRef.current) Api.settings(p).catch(() => setSync("offline"));
  }, [commit]);

  const patchDay = useCallback((day: string, p: Partial<Pick<DayLog, "mood" | "energy" | "note" | "done">>) => {
    commit((s) => ({ ...s, days: { ...s.days, [day]: { ...(s.days[day] ?? emptyDay()), ...p } } }));
    if (userRef.current) Api.day(day, p).catch(() => setSync("offline"));
  }, [commit]);

  const saveAssignment = useCallback((a: Assignment) => {
    commit((s) => {
      const exists = s.assignments.some((x) => x.id === a.id);
      return { ...s, assignments: exists ? s.assignments.map((x) => (x.id === a.id ? a : x)) : [...s.assignments, a] };
    });
    if (userRef.current) Api.putAssignment(a).catch(() => setSync("offline"));
  }, [commit]);

  const deleteAssignment = useCallback((id: string) => {
    commit((s) => ({ ...s, assignments: s.assignments.filter((x) => x.id !== id) }));
    if (userRef.current) Api.deleteAssignment(id).catch(() => setSync("offline"));
  }, [commit]);

  const signin = useCallback(async (email: string, password: string) => {
    const { user: u } = await Api.signin({ email, password });
    await adoptAccount(u, false);
  }, [adoptAccount]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { user: u } = await Api.signup({ name, email, password });
    await adoptAccount(u, true);
  }, [adoptAccount]);

  const signout = useCallback(async () => {
    await flush();
    await Api.signout().catch(() => undefined);
    if (userRef.current) drop(queueKey(userRef.current.id));
    userRef.current = null;
    setUser(null);
    // Signed-out devices start fresh but keep the look.
    commit((s) => ({ ...emptyState(), settings: s.settings }));
    setSync("guest");
  }, [flush, commit]);

  const value = useMemo<StoreCtx>(() => {
    const todayLog = state.days[today] ?? emptyDay();
    return {
      ready, user, state, sync: user ? sync : "guest", today, todayLog,
      level: levelFromXp(state.xp),
      streak: streak(state.days, today),
      bestStreak: bestStreak(state.days),
      record, updateSettings, patchDay, saveAssignment, deleteAssignment, signin, signup, signout,
      toasts, toast,
    };
  }, [ready, user, state, sync, today, record, updateSettings, patchDay, saveAssignment, deleteAssignment, signin, signup, signout, toasts, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

