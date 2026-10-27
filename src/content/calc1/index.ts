import type { Lesson, Question, Unit } from "../types";
import { u01, u02 } from "./units/u01-u02";
import { u03, u04, u05 } from "./units/u03-u05";
import { u06, u07, u08, u09 } from "./units/u06-u09";
import { u10, u11, u12, u13 } from "./units/u10-u13";
import { u14, u15, u16, u17 } from "./units/u14-u17";

export const UNITS: Unit[] = [u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12, u13, u14, u15, u16, u17];

export const COURSE = {
  id: "calc1",
  code: "MATH 1200",
  title: "Single-Variable Calculus I",
  school: "Vanderbilt University",
};

export interface LessonRef { unit: Unit; lesson: Lesson; index: number }

export const LESSONS: LessonRef[] = UNITS.flatMap((unit) => unit.lessons.map((lesson, index) => ({ unit, lesson, index })));

export function findLesson(id: string): LessonRef | undefined {
  return LESSONS.find((l) => l.lesson.id === id);
}

export function findUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

/** Every authored question, including the quick checks inside lessons. */
export function lessonQuestions(l: Lesson): Question[] {
  const checks = l.blocks.flatMap((b) => (b.k === "check" ? [b.q] : []));
  return [...checks, ...l.questions];
}

export const ALL_QUESTIONS: Array<{ q: Question; unit: Unit; lesson: Lesson }> = UNITS.flatMap((unit) =>
  unit.lessons.flatMap((lesson) => lessonQuestions(lesson).map((q) => ({ q, unit, lesson }))),
);

export function nextLesson(id: string): LessonRef | undefined {
  const i = LESSONS.findIndex((l) => l.lesson.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}
