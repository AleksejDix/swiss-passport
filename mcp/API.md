# Swiss Passport REST API (v1)

The API behind [swiss-passport.com/learn](https://swiss-passport.com/learn/) and the mobile apps. It runs the same learning actions as the MCP tools used by ChatGPT and Claude (`src/learning.ts`), so a learner's progress is the same everywhere.

- **Base URL:** `https://swiss-passport.com/api/v1`
- **Format:** every request except `GET /api/v1` is a `POST` with a JSON body (`content-type: application/json`, at most 8 KB). Responses are JSON and never cached.
- **Versioning:** breaking changes get a new prefix (`/api/v2`); `/api/v1` keeps working for app versions already in the stores.
- **Learner code:** there is no login. `POST /learners` gives a code such as `BERG-7K2Q`; send it as `learner_code` in the body of every other request. Never put it in the URL or a header: those are logged, bodies are not. It is not a password: it only points to quiz progress, which holds no personal data. Show it to the learner so they can continue on another device, and keep it on the device (Keychain, Keystore). Case and spaces do not matter.
- **Language:** `GET /api/v1` lists the languages (`de`, `en`, `es`, …). Pass `language` in the body; it is remembered for the learner. The exam is in German: in other languages every question also carries `german`.
- **Pictures:** steps with pictures carry `images`, paths from the site root such as `/images/nationalfahne_a.png`. Put the server address in front: `https://swiss-passport.com/images/nationalfahne_a.png`.

## Endpoints

| Method and path | Body | Returns |
|---|---|---|
| `GET /api/v1` | | `version`, `languages`, link to this file |
| `POST /api/v1/learners` | `{ language? }` | **201** a new `learner_code` and its progress |
| `POST /api/v1/progress` | `{ learner_code, language? }` | progress (see below) |
| `POST /api/v1/lessons` | `{ learner_code, lesson_id?, voice?, language? }` | the first step of the lesson |
| `POST /api/v1/reviews` | `{ learner_code, voice?, language? }` | the first review step, or `nothing_due: true` |
| `POST /api/v1/exams` | `{ learner_code, voice?, language? }` | the first of 50 mock exam questions |
| `POST /api/v1/answers` | `{ learner_code, answer: "a"…"d", question_id?, language? }` | `feedback` and `next` step, or `finished` |

Every response for a learner also carries their `learner_code`.

### Progress

```json
{
  "learner_code": "BERG-7K2Q",
  "lessons_done": 1,
  "lessons_total": 37,
  "next_lesson": { "id": "l05", "title": "Democracy and the rule of law" },
  "lesson_choices": [
    { "id": "l05", "title": "Democracy and the rule of law", "unit": "How the state works" },
    { "id": "l16", "title": "Pensions", "unit": "Living in Switzerland" }
  ],
  "reviews_due": 3,
  "unfinished_session": { "kind": "lesson", "step": "4/9" },
  "readiness_percent": 12,
  "readiness_by_category": [{ "category": "Democracy and federalism", "percent": 20 }],
  "last_exams": [{ "at": "2026-09-27T08:00:00.000Z", "score": 41, "total": 50 }],
  "units": [{ "title": "Switzerland at a glance", "lessons_done": 1, "lessons_total": 4 }]
}
```

Offer the learner `lesson_choices` (one open lesson per unit; the first one is recommended) and start the chosen one with `POST /lessons { "learner_code": "BERG-7K2Q", "lesson_id": "l05" }`. Without `lesson_id`, an unfinished lesson continues (`continued_unfinished_lesson: true`), otherwise the recommended lesson starts.

### A step

```json
{
  "lesson": { "title": "Democracy and the rule of law", "unit": "How the state works", "position": "5/37" },
  "explain_first": { "title": "Democracy", "intro": ["…"], "key_terms": [{ "term": "…", "definition": "…" }] },
  "step": "1/9",
  "concept": "Democracy",
  "question": {
    "id": "q001",
    "question": "…",
    "options": { "a": "…", "b": "…", "c": "…", "d": "…" },
    "german": { "question": "…", "options": { "a": "…", "b": "…", "c": "…", "d": "…" } }
  },
  "images": { "a": "/images/nationalfahne_a.png" }
}
```

`explain_first` comes when a lesson reaches a new topic: show it before the question. `retry: true` marks a question answered wrongly earlier in the round. The correct answer is never part of a step.

### Answering

`POST /answers { "learner_code": "BERG-7K2Q", "answer": "b" }` answers the current question of the running lesson, review or exam. Send `question_id` of the question on the screen: if the learner already answered it (two taps, two devices), nothing is recorded and the current step comes back with `question_already_answered: true`.

In lessons and reviews:

```json
{
  "feedback": {
    "correct": false,
    "your_answer": "b",
    "correct_answer": "c",
    "correct_answer_text": "…",
    "correct_answer_german": "…",
    "why": "…",
    "about_your_answer": "…",
    "note": "…",
    "comes_again_later_in_this_round": true,
    "concept": "Democracy",
    "review": { "level": 0, "max_level": 5, "next_review": "2026-09-28T08:00:00.000Z" },
    "sources": ["https://www.admin.ch/…"]
  },
  "next": { "step": "2/9", "question": { "…": "…" } }
}
```

`note` (if present) says what applies today where the official answer is outdated; the test still expects the official answer. A wrong answer comes back later in the same round. After the last question, `finished` replaces `next`: `{ "lesson": "done", "correct_first_try": 7, "total": 9, "reviews_due": 2, "next_lesson": "…" }`.

In a mock exam, `feedback` is only `{ "recorded": true }`; the last answer returns `finished` with `score`, `total`, `percent`, `pass_mark` and the `mistakes`.

`images`, when the next question has pictures, belongs to the step in `next`.

## Errors

Errors come as `{ "error": "…" }` (bad input also with `issues`).

| Status | When |
|---|---|
| 400 | Invalid JSON, a value out of range (`answer: "e"`, unknown `language`), an unknown `lesson_id` |
| 401 | `learner_code` missing |
| 404 | Unknown learner code, or unknown path |
| 405 | Wrong method for the path (the `Allow` header names the right one) |
| 409 | `POST /answers` without a running lesson, review or exam |
| 413 | Body larger than 8 KB |
| 415 | Body not sent as `application/json` |
| 429 | Too many requests from this IP address: more than 30 new learners a minute, more than 20 wrong learner codes a minute (then requests with a code wait 10 minutes), or more than 100 requests in 10 seconds. `Retry-After` says how long to wait. |
| 500 | Something went wrong on the server; try again |

The API sends no CORS headers: browsers only call it from swiss-passport.com itself. Native apps are not affected.

## Voice

`voice: true` on the start endpoints leaves out questions that need a picture, for learning by listening and speaking. Lessons still count as done without them.
