import type { GameState, GameEvent, Settings, Assignment, DayLog } from "../../shared/rules";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal; keepalive?: boolean } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      credentials: "same-origin",
      headers: {
        ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
        // Custom header = CSRF protection: cross-site pages can't send it without a preflight we reject.
        "x-studycraft": "1",
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
      keepalive: init.keepalive,
    });
  } catch {
    throw new ApiError(0, "You're offline. Progress is saved on this device and will sync later.", "offline");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? "Something went wrong", (data as { code?: string }).code);
  return data as T;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const Api = {
  me: () => api<{ user: User | null }>("/auth/me"),
  signup: (b: { name: string; email: string; password: string }) => api<{ user: User }>("/auth/signup", { body: b }),
  signin: (b: { email: string; password: string }) => api<{ user: User }>("/auth/signin", { body: b }),
  signout: () => api<void>("/auth/signout", { method: "POST", body: {} }),
  changePassword: (b: { current: string; next: string }) => api<void>("/auth/password", { body: b }),
  deleteAccount: (password: string) => api<void>("/auth/account", { method: "DELETE", body: { password } }),
  state: () => api<{ state: GameState }>("/state"),
  events: (events: GameEvent[]) => api<{ xp: number; gained: number }>("/events", { body: { events }, keepalive: true }),
  import: (s: Omit<GameState, "settings">) => api<{ state: GameState }>("/import", { body: s }),
  settings: (s: Partial<Settings>) => api<{ settings: Settings }>("/settings", { method: "PUT", body: s }),
  day: (day: string, patch: Partial<Pick<DayLog, "mood" | "energy" | "note" | "done">>) => api<void>(`/days/${day}`, { method: "PUT", body: patch }),
  putAssignment: (a: Assignment) => api<void>(`/assignments/${encodeURIComponent(a.id)}`, { method: "PUT", body: a }),
  deleteAssignment: (id: string) => api<void>(`/assignments/${encodeURIComponent(id)}`, { method: "DELETE", body: {} }),
  calendarLink: () => api<{ url: string }>("/calendar-link"),
  rotateCalendar: () => api<{ url: string }>("/calendar-link/rotate", { body: {} }),
};
