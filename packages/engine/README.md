# @aleksejdix/learning-engine

A learning engine for multiple-choice courses: lessons with prerequisites, spaced repetition per topic and mock exams. It holds no content and has no dependencies: you pass in a catalog, and it hands out one question at a time.

It runs [Swiss Passport](https://swiss-passport.com), a course for the Zurich naturalisation test, and works for any multiple-choice course: true or false, three or more options, one right answer or several (security awareness, driving theory, compliance training).

## Install

The package is published on GitHub Packages. Add to the `.npmrc` of your project:

```
@aleksejdix:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub token with `read:packages` (GitHub Packages asks for one even for public packages). Then:

```sh
npm install @aleksejdix/learning-engine
```

## Use

```js
import { createEngine, emptyProgress } from "@aleksejdix/learning-engine";

const engine = createEngine(catalog);
const progress = emptyProgress(); // plain JSON: store it wherever you like
engine.fitToCatalog(progress); // after loading stored progress: drops questions the catalog no longer has

engine.progress(progress, "en").lesson_choices; // lessons to offer, the recommended one first
engine.startLesson(progress, "l1", false);
engine.currentStep(progress.session, "en"); // one question (and the topic's explanation the first time)
engine.answer(progress, "a", "en"); // feedback and the next step, or the summary at the end
engine.answer(progress, ["a", "c"], "en"); // a question whose answer is a list: every option the learner picked
```

| Function | What it does |
|---|---|
| `createEngine(catalog)` | The engine for one catalog. |
| `fitToCatalog(p)` | Makes stored progress fit a changed catalog: the unfinished session drops removed questions, or ends. Call it after loading. |
| `progress(p, lang)` | Lessons done, `lesson_choices`, reviews due, readiness per category, recent mock exams. |
| `startLesson(p, lessonId, voice)` | Starts a lesson. `voice: true` leaves out questions with pictures. |
| `startReviews(p, voice)` | Starts a review round of the topics that are due. Returns `false` if none are. |
| `startExam(p, voice)` | Starts a mock exam of `catalog.exam.size` random questions, without feedback until the end. |
| `currentStep(session, lang)` | The question to answer now. |
| `answer(p, given, lang, now?)` | Records the answer (an option id, or a list of them); returns `feedback` and `next`, or `finished`. |
| `lessonStages(curriculum)` | The stage of each lesson: 0 when it requires nothing, else one more than its latest prerequisite. |
| `validateCatalog(catalog)` | Every problem in a catalog, one sentence each; empty when it is fine. Run it in your course's tests. |

## How it teaches

- **Lessons.** A lesson is open once the lessons in its `requires` are done. `lesson_choices` offers one open lesson per unit, the unit studied longest ago (or never) first, so the units take turns.
- **Wrong answers** come back at the end of the same round until they are right. Only the first try counts.
- **Spaced repetition per topic:** a topic comes back after 1, 3, 7, 14 and 30 days; a mistake moves it back one step.
- **Readiness:** the share of questions whose topic has reached level 3.

## Catalog

```ts
{
  exam: { name, size, pass_mark },       // shown to the learner; size = questions per mock exam
  languages: ["de", "en"],               // the first is the exam language and the fallback for missing texts
  questions: [{ id, category, level, options: [{ id: "a" }, …], answer: "c", image? }],
                                         // two or more options; answer: ["a", "c"] asks for every right option
  curriculum: {
    units: [{ id, lessons: [lessonId, …] }],
    lessons: [{ id, unit, requires?: [lessonId, …], concepts: [conceptId, …] }],
    concepts: [{ id, lesson, questions: [questionId, …], sources: [url, …] }],
  },
  texts: { [lang]: { title, categories, levels, units, lessons, concepts, questions } },
}
```

A question whose `answer` is a list (even of one option) is shown with `multiple: true`: the learner picks every right option, and only exactly those count as right. Its `correct_answer` and `correct_answer_text` in the feedback are lists too.

In any language but the first, a step carries `original` (the question and options in the exam language) and the feedback `correct_answer_original`.

The types (`Catalog`, `Curriculum`, `Texts`, `Progress`, `Answer`, …) are exported. See `test/engine.test.js` for a complete small catalog, and `test/question-types.test.js` for true or false and several right answers.

## License

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/). Copyright Aleksej Dix.
