// What each learning action asks of the engine: pure functions of one learner's progress, without store or transport.
// Each returns the step the learner sees next (or an error) and may change the progress, which the caller saves.
import type { Letter, Progress } from "@aleksejdix/learning-engine";
import { engine, type Lang } from "./catalog.js";

/** What an action produces: data, the question whose pictures belong to it, and a status for HTTP (default 200). */
export interface Out {
  data: Record<string, unknown>;
  questionId?: string;
  status?: number;
}

/** One action on a learner's progress, in the learner's language. */
export type Step = (p: Progress, lang: Lang) => Out;

export interface StartOptions {
  voice?: boolean;
}
export interface LessonOptions extends StartOptions {
  lesson_id?: string;
}
export interface AnswerOptions {
  answer: Letter;
  question_id?: string;
}

export const errorOut = (error: string, status: number): Out => ({ data: { error }, status });

/** The session's current question. `notes` come first in the data. */
function currentStep(p: Progress, lang: Lang, notes: Record<string, unknown> = {}): Out {
  const step = engine.currentStep(p.session!, lang);
  return { data: { ...notes, ...step }, questionId: step.question.id };
}

/** The lesson of an unfinished lesson session in the same mode (voice or text). */
const openLesson = (p: Progress, voice: boolean) =>
  p.session?.kind === "lesson" && !!p.session.voice === voice ? p.session.lesson : undefined;

export const progress = (): Step => (p, lang) => ({ data: engine.progress(p, lang) });

/** The lesson asked for; without one, the unfinished lesson or else the recommended next one. */
export const lesson =
  ({ lesson_id, voice = false }: LessonOptions): Step =>
  (p, lang) => {
    const open = openLesson(p, voice);
    // "Let's continue" in a new chat: ChatGPT called start_lesson and the learner lost their place in the lesson.
    // Said explicitly: without it ChatGPT started the same lesson a second time, and two cards showed the same step.
    if (open && (lesson_id ?? open) === open) return currentStep(p, lang, { continued_unfinished_lesson: true });
    const id = lesson_id ?? engine.nextLessonId(p);
    if (!id) return { data: { done: true, message: "All lessons done. Continue with reviews and mock exams." } };
    if (!engine.lessons.includes(id))
      return errorOut(`Unknown lesson ${id}. Lessons are ${engine.lessons[0]} to ${engine.lessons.at(-1)}.`, 400);
    engine.startLesson(p, id, voice);
    return currentStep(p, lang);
  };

export const reviews =
  ({ voice = false }: StartOptions): Step =>
  (p, lang) =>
    engine.startReviews(p, voice)
      ? currentStep(p, lang)
      : { data: { nothing_due: true, message: "No reviews due. Continue with a lesson." } };

export const exam =
  ({ voice = false }: StartOptions): Step =>
  (p, lang) => {
    engine.startExam(p, voice);
    return currentStep(p, lang);
  };

export const answer =
  ({ answer, question_id }: AnswerOptions): Step =>
  (p, lang) => {
    if (!p.session) return errorOut("No active session. Call start_lesson, start_reviews or start_mock_exam.", 409);
    // A screen still showing an earlier question: answer nothing and bring it to the current step.
    if (question_id && question_id !== p.session.questions[p.session.pos])
      return currentStep(p, lang, { question_already_answered: true });
    const r = engine.answer(p, answer, lang);
    return { data: r, questionId: "next" in r ? r.next?.question.id : undefined };
  };
