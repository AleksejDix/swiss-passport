# ChatGPT plugin directory: submission

Everything to paste into the OpenAI Platform when submitting Swiss Passport to the ChatGPT plugin directory
(platform.openai.com/plugins → Create plugin → With MCP). Checked against OpenAI's submission and review pages on
2026-09-26: developers.openai.com/plugins/deploy/submission, /plugins/deploy/app-review, /plugins/app-guidelines.

## Before submitting

- [ ] OpenAI Platform organisation on a project with global data residency (EU data residency cannot submit MCP plugins).
- [ ] Identity verification of the submitter (Settings → Organization → General). The verified name is shown as the publisher.
- [ ] Domain verification: the portal gives a token; serve it as plain text at
      `https://swiss-passport.com/.well-known/openai-apps-challenge`, then deploy.
- [ ] Demo recording of the main flows (start a lesson, answer on the card, mock exam), uploaded somewhere with a public link.
- [ ] In ChatGPT, turn on Settings → Security and login → "Enforce CSP for custom apps", refresh the app and check that
      the quiz card still shows its pictures (flag question in lesson 1). That is how it will run once published.

## Info

| Field | Value |
|---|---|
| Display name (max. 30) | Swiss Passport Zurich |
| Short description (max. 30) | Zurich citizenship test tutor |
| Category | Education |
| Logo | `site/public/icon-512.png` (512 × 512 PNG) |
| Website | https://swiss-passport.com |
| Support | https://swiss-passport.com/support/ |
| Privacy policy | https://swiss-passport.com/privacy/ |
| Terms of use | https://swiss-passport.com/terms/ |

Long description (max. 4000):

> Swiss Passport is a free, unofficial tutor for the naturalisation knowledge test (Grundkenntnistest) of the Canton
> of Zurich, Switzerland. It teaches the 350 official questions published by the canton in 37 short lessons: a short
> explanation of a concept, then one question at a time.
>
> The app checks every answer itself, not the model, and explains why the right answer is right and why the tempting
> wrong one is wrong. Wrong answers come back until they are right, and every topic returns for review after 1, 3, 7,
> 14 and 30 days. Mock exams of 50 random questions work like the canton's official practice test.
>
> Learn in German, English, French, Italian, Russian, Ukrainian or Spanish, always with the German wording of the real test.
> No account is needed: progress is saved under an anonymous learner code that also works on swiss-passport.com.
>
> Swiss Passport is a private, non-commercial project. It is not affiliated with the Canton of Zurich or any
> municipality; their information is what counts.

## MCP

| Field | Value |
|---|---|
| Server URL | https://swiss-passport.com/mcp |
| Transport | Streamable HTTP |
| Authentication | No authentication |

The quiz card (`ui://swiss-passport/card-v5.html`) declares an empty CSP (`connectDomains` and `resourceDomains` are
empty: its script is inline, pictures arrive as `data:` URIs in the tool result) and `openai/widgetDomain`
`https://swiss-passport.com`. It opens no external links.

### Tool annotations: justifications

All tools only read and write the learner's own progress in this app's database. Nothing is deleted, nothing is sent
to other systems.

| Tool | readOnlyHint | destructiveHint | openWorldHint |
|---|---|---|---|
| `get_progress` | false: without a learner code it creates a new one and stores the chosen language | false: only reads the progress or creates a new, empty one | false: only this app's own progress data |
| `start_lesson` | false: starts a lesson and saves it as the learner's current round | false: replaces only an unfinished round; answers and the review schedule are kept | false: only this app's own progress data |
| `start_reviews` | false: starts a review round and saves it | false: as `start_lesson` | false: only this app's own progress data |
| `start_mock_exam` | false: starts a mock exam and saves it | false: as `start_lesson` | false: only this app's own progress data |
| `answer` | false: records the answer and updates the review schedule | false: adds to the progress, never removes it | false: only this app's own progress data |

## Prompts (starter prompts, max. 128 each)

1. Help me prepare for the Zurich citizenship test
2. Start a lesson for the Swiss naturalisation test in Russian
3. Give me a mock exam for the Zurich Grundkenntnistest

## Testing

Reviewers need no account or credentials. The first call without a learner code creates one.

### Positive test cases (5)

1. **Prompt:** "Help me prepare for the Zurich citizenship test. I don't have a learner code."
   **Expected:** calls `get_progress` without a code, then `start_lesson`. The quiz card shows lesson 1, step 1/9: a
   concept, one question with options A to D and its German wording. The assistant tells the new learner code and does
   not repeat the question.
   **Result shape:** `get_progress` → `{ learner_code, new_learner_code, lessons_done: 0, next_lesson: { id: "l01" }, … }`;
   `start_lesson` → `{ learner_code, lesson: { position: "1/37" }, explain_first, step: "1/9", question: { id, question, options, german } }`.

2. **Prompt (after 1):** click option B on the quiz card, or type "B".
   **Expected:** the card calls `answer` itself and shows right or wrong with the explanation and a Next button; typed,
   the assistant calls `answer` and gives short feedback.
   **Result shape:** `{ learner_code, feedback: { correct, correct_answer, why, … }, next: { step: "2/9", question } }`.

3. **Prompt:** "I want to learn for the Swiss naturalisation test in Italian."
   **Expected:** `get_progress` and `start_lesson` with `language: "it"`. Texts in Italian, with the German original.
   **Result shape:** as in 1, texts in Italian, `question.german` in German.

4. **Prompt:** "Give me a mock exam for the Zurich Grundkenntnistest."
   **Expected:** `start_mock_exam`. 50 questions, no feedback until the end; after the last answer the score.
   **Result shape:** `{ learner_code, step: "1/50", question }`; answers return `{ feedback: { recorded: true }, next }`,
   the last one `{ finished: { score, total: 50, percent, mistakes } }`.

5. **Prompt (after 1):** "Do I have any reviews due?"
   **Expected:** `get_progress` with the learner code, then possibly `start_reviews`. Right after the first lesson
   nothing is due, and the assistant says so.
   **Result shape:** `get_progress` → `{ reviews_due: 0, … }`; `start_reviews` → `{ nothing_due: true, message }`.

### Negative test cases (3)

1. **Prompt:** "What's the weather in Zurich tomorrow?"
   **Expected:** no Swiss Passport tool is called.
2. **Prompt:** "Help me fill in my naturalisation application form for the Canton of Bern."
   **Expected:** no Swiss Passport tool is called (application forms and other cantons are out of scope).
3. **Prompt:** "Translate this letter from the tax office into English."
   **Expected:** no Swiss Passport tool is called.

## Global

- Countries: everywhere the directory is offered; Switzerland (CH) above all. Add the country codes in the Global tab.
- Release notes: "First public release: lessons, reviews and mock exams for the Zurich naturalisation knowledge test
  in seven languages, with an interactive quiz card."

## After approval

- Publish in the portal, then share the plugin's listing link (users install it without Developer mode).
- Tool changes go through automated review without a new version; listing texts need a new version.
- Keep the server origin: a new host means a new submission.
