import type { NumAnswer } from "@/lib/math/check";

export type ToolId =
  | "grapher"
  | "limit"
  | "tangent"
  | "derivative"
  | "transform"
  | "exponential"
  | "rational"
  | "piecewise"
  | "riemann"
  | "box"
  | "signchart"
  | "unitcircle";

/**
 * Optional self-check data. The test suite uses it to confirm every answer key numerically,
 * so a typo in the content can't teach you something wrong.
 */
export type Verify =
  | { kind: "derivative"; f: string; at?: number; domain?: [number, number] } // answer = f' (or f'(at))
  | { kind: "antiderivative"; f: string; domain?: [number, number] } // d/dx(answer) = f
  | { kind: "limit"; f: string; a: number | "inf" | "-inf"; side?: "left" | "right" }
  | { kind: "value"; expr: string } // answer = value of expr
  | { kind: "integral"; f: string; a: number; b: number }
  | { kind: "same"; expr: string; domain?: [number, number] }; // expr answer equals this expression

interface QBase {
  id: string;
  /** Rich text: **bold**, $inline math$, $$display math$$ */
  prompt: string;
  /** Progressive hints, gentlest first */
  hints?: string[];
  /** Full worked solution, one step per item (revealed one at a time) */
  solution: string[];
  /** 1 = wood (warm-up), 2 = iron (exam-level), 3 = diamond (challenge) */
  level: 1 | 2 | 3;
  /** Exam-style question modeled on past Vanderbilt Math 1200 tests */
  exam?: boolean;
  verify?: Verify;
}

export type Question = QBase &
  (
    | { type: "mc"; choices: string[]; answer: number }
    | { type: "num"; answer: NumAnswer; tol?: number; unit?: string }
    | { type: "expr"; answer: string; variable?: string; domain?: [number, number]; upToConstant?: boolean }
    | { type: "interval"; answer: string; strict?: boolean }
    | { type: "list"; answer: number[]; ordered?: boolean }
  );

export type Block =
  | { k: "eli5"; title?: string; body: string }
  | { k: "idea"; title: string; body: string }
  | { k: "formula"; title: string; tex: string; note?: string }
  | { k: "steps"; title: string; steps: string[] }
  | { k: "example"; title: string; problem: string; steps: string[]; answer: string }
  | { k: "trap"; title?: string; body: string }
  | { k: "tip"; title?: string; body: string }
  | { k: "tool"; tool: ToolId; props?: Record<string, unknown>; caption?: string }
  | { k: "check"; q: Question }
  | { k: "table"; title: string; head: string[]; rows: string[][] };

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  /** One sentence. If you read nothing else, read this. */
  tldr: string;
  blocks: Block[];
  questions: Question[];
  /** Practice generators that drill this lesson's skill forever */
  gens?: string[];
}

export interface Unit {
  id: string;
  n: number;
  title: string;
  emoji: string;
  /** which block texture to show on the map */
  biome: "plains" | "desert" | "forest" | "swamp" | "taiga" | "mountain" | "river" | "cave" | "ocean" | "nether" | "mesa" | "jungle" | "mushroom" | "snow" | "end" | "deepdark" | "sky";
  /** Where it sits in the course (lecture week from the syllabus slides, or "after Exam 2") */
  when: string;
  /** Which midterm it's tested on */
  exam: 1 | 2 | 3;
  summary: string;
  lessons: Lesson[];
}
