// Learning logic: lessons in curriculum order, spaced repetition per concept, mock exam.
// Every activity is a session that hands out exactly one question at a time.
import { indexCatalog, type Catalog, type Letter } from "./catalog.js";
import type { Progress, Session } from "./progress.js";

const DAY = 24 * 60 * 60 * 1000;
// Days until the next review for each level (index = level). Level 0 = due immediately.
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const MAX_LEVEL = INTERVAL_DAYS.length - 1;
// A concept counts as "known" from this level on (used for the readiness score).
const KNOWN_LEVEL = 3;
export const REVIEW_SIZE = 10;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The learning engine for one catalog. */
export function createEngine(catalog: Catalog) {
  const {
    conceptById, conceptOfQuestion, conceptText, curriculum, explanation, lessonById, lessonOrder,
    lessonTitle, questionText, questions, unitTitle, categoryTitle,
  } = indexCatalog(catalog);

  /** Questions that need a picture cannot be asked in voice conversations. */
  const needsPicture = (qid: string) => {
    const q = questions.get(qid)!;
    return Boolean(q.image || q.options.some((o) => o.image));
  };

  const lessonQuestions = (lessonId: string, voice = false) =>
    lessonById
      .get(lessonId)!
      .concepts.flatMap((c) => conceptById.get(c)!.questions)
      .filter((q) => !(voice && needsPicture(q)));

  // Picture questions are optional for completing a lesson, so voice learners can finish every lesson.
  const isLessonDone = (p: Progress, lessonId: string) =>
    lessonQuestions(lessonId, true).every((q) => p.answered[q]);

  function nextLessonId(p: Progress): string | undefined {
    return lessonOrder.find((l) => !isLessonDone(p, l));
  }

  function dueConcepts(p: Progress, now = new Date()): string[] {
    return Object.entries(p.concepts)
      .filter(([, s]) => new Date(s.due) <= now)
      .sort(([, a], [, b]) => a.due.localeCompare(b.due))
      .map(([id]) => id);
  }

  // ---- Starting sessions --------------------------------------------------------------

  function startLesson(p: Progress, lessonId: string, voice: boolean) {
    p.session = { kind: "lesson", lesson: lessonId, questions: lessonQuestions(lessonId, voice), pos: 0, answers: {}, voice };
  }

  function startReviews(p: Progress, voice: boolean): boolean {
    const lastSeen = (q: string) => p.answered[q]?.at ?? "";
    const picked = dueConcepts(p)
      .map((cid) =>
        conceptById
          .get(cid)!
          .questions.filter((q) => !(voice && needsPicture(q)))
          .sort((a, b) => lastSeen(a).localeCompare(lastSeen(b)))[0],
      )
      .filter(Boolean)
      .slice(0, REVIEW_SIZE);
    if (!picked.length) return false;
    p.session = { kind: "review", questions: picked, pos: 0, answers: {}, voice };
    return true;
  }

  function startExam(p: Progress, voice: boolean) {
    const pool = [...questions.keys()].filter((q) => !(voice && needsPicture(q)));
    p.session = { kind: "exam", questions: shuffle(pool).slice(0, catalog.exam.size), pos: 0, answers: {}, voice };
  }

  /** The step the learner has to answer now: one question, plus the concept explanation the first time a lesson reaches a concept. */
  function currentStep(s: Session, lang: string) {
    const qid = s.questions[s.pos];
    const cid = conceptOfQuestion.get(qid)!;
    const earlier = s.questions.slice(0, s.pos);
    const newConcept = s.kind === "lesson" && !earlier.some((q) => conceptOfQuestion.get(q) === cid);
    const retry = earlier.includes(qid);
    const header =
      s.kind === "lesson" && s.pos === 0
        ? { lesson: { title: lessonTitle(s.lesson!, lang), unit: unitTitle(lessonById.get(s.lesson!)!.unit, lang), position: `${lessonOrder.indexOf(s.lesson!) + 1}/${lessonOrder.length}` } }
        : {};
    const t = conceptText(cid, lang);
    return {
      ...header,
      ...(newConcept && {
        explain_first: { title: t.title, intro: t.intro, key_terms: t.key_terms, ...(t.mnemonic && { mnemonic: t.mnemonic }) },
      }),
      step: `${s.pos + 1}/${s.questions.length}`,
      concept: t.title,
      ...(retry && { retry: true }),
      question: questionText(qid, lang),
    };
  }

  // ---- Answering ----------------------------------------------------------------------

  /** Updates the spaced-repetition state of the question's concept. */
  function schedule(p: Progress, qid: string, correct: boolean, now: Date) {
    const cid = conceptOfQuestion.get(qid)!;
    const s = p.concepts[cid] ?? { level: 0, due: now.toISOString() };
    if (correct) {
      // First success moves a new concept to level 1; later successes only count when the review was due.
      if (s.level === 0 || new Date(s.due) <= now) s.level = Math.min(MAX_LEVEL, s.level + 1);
      s.due = new Date(now.getTime() + INTERVAL_DAYS[s.level] * DAY).toISOString();
    } else {
      // The question is repeated in the same round until correct; the concept comes back tomorrow.
      s.level = Math.max(0, s.level - 1);
      s.due = new Date(now.getTime() + INTERVAL_DAYS[1] * DAY).toISOString();
    }
    p.concepts[cid] = s;
    p.answered[qid] = { correct, at: now.toISOString() };
    return { level: s.level, max_level: MAX_LEVEL, next_review: s.due };
  }

  /**
   * Answers the current question of the session and returns feedback plus the next step (or the session summary).
   * In lessons and reviews a wrong answer puts the question back at the end of the round, so every question
   * has to be answered correctly before the round is finished. Only the first attempt counts for the review schedule.
   */
  function answer(p: Progress, given: Letter, lang: string, now = new Date()) {
    const s = p.session!;
    const qid = s.questions[s.pos];
    const isRetry = s.questions.slice(0, s.pos).includes(qid);
    if (!isRetry) s.answers[qid] = given;
    s.pos++;

    // Mock exam: no feedback until the end, like the real test.
    const feedback =
      s.kind === "exam"
        ? { recorded: true }
        : (() => {
            const e = explanation(qid, given, lang);
            const cid = conceptOfQuestion.get(qid)!;
            const review = isRetry ? undefined : schedule(p, qid, e.correct, now);
            if (!e.correct) s.questions.push(qid);
            return {
              ...e,
              ...(!e.correct && { comes_again_later_in_this_round: true }),
              concept: conceptText(cid, lang).title,
              ...(review && { review }),
              sources: conceptById.get(cid)!.sources,
            };
          })();

    if (s.pos < s.questions.length) return { feedback, next: currentStep(s, lang) };

    p.session = undefined;
    return { feedback, finished: s.kind === "exam" ? gradeExam(p, s.answers, lang, now) : summary(p, s, lang) };
  }

  function summary(p: Progress, s: Session, lang: string) {
    const firstTry = Object.entries(s.answers).filter(([q, a]) => questions.get(q)!.answer === a).length;
    const next = nextLessonId(p);
    return {
      [s.kind]: "done",
      correct_first_try: firstTry,
      total: Object.keys(s.answers).length,
      reviews_due: dueConcepts(p).length,
      next_lesson: next ? lessonTitle(next, lang) : null,
    };
  }

  function gradeExam(p: Progress, answers: Record<string, Letter>, lang: string, now: Date) {
    const graded = Object.entries(answers).map(([qid, given]) => ({ qid, ...explanation(qid, given, lang) }));
    const score = graded.filter((g) => g.correct).length;
    p.exams.push({ at: now.toISOString(), score, total: graded.length });
    return {
      score,
      total: graded.length,
      percent: Math.round((100 * score) / graded.length),
      pass_mark: catalog.exam.pass_mark,
      mistakes: graded
        .filter((g) => !g.correct)
        .map(({ qid, correct: _c, ...rest }) => ({ question: questionText(qid, lang).question, ...rest })),
    };
  }

  // ---- Overview -----------------------------------------------------------------------

  function progress(p: Progress, lang: string) {
    const known = (qid: string) => (p.concepts[conceptOfQuestion.get(qid)!]?.level ?? 0) >= KNOWN_LEVEL;
    const byCategory = new Map<string, { known: number; total: number }>();
    for (const q of questions.values()) {
      const c = byCategory.get(q.category) ?? { known: 0, total: 0 };
      c.total++;
      if (known(q.id)) c.known++;
      byCategory.set(q.category, c);
    }
    const next = nextLessonId(p);
    return {
      lessons_done: lessonOrder.filter((l) => isLessonDone(p, l)).length,
      lessons_total: lessonOrder.length,
      next_lesson: next ? { id: next, title: lessonTitle(next, lang) } : null,
      reviews_due: dueConcepts(p).length,
      unfinished_session: p.session ? { kind: p.session.kind, step: `${p.session.pos + 1}/${p.session.questions.length}` } : null,
      readiness_percent: Math.round((100 * [...questions.keys()].filter(known).length) / questions.size),
      readiness_by_category: [...byCategory].map(([id, c]) => ({
        category: categoryTitle(id, lang),
        percent: Math.round((100 * c.known) / c.total),
      })),
      last_exams: p.exams.slice(-3),
      units: curriculum.units.map((u) => ({
        title: unitTitle(u.id, lang),
        lessons_done: u.lessons.filter((l) => isLessonDone(p, l)).length,
        lessons_total: u.lessons.length,
      })),
    };
  }

  return {
    catalog,
    lessons: lessonOrder,
    question: (id: string) => questions.get(id),
    nextLessonId, startLesson, startReviews, startExam, currentStep, answer, progress,
  };
}

export type Engine = ReturnType<typeof createEngine>;
