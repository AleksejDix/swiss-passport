# Swiss Passport: Zurich Knowledge Test

Learn for the naturalisation knowledge test (Grundkenntnistest) of the Canton of Zurich by talking to an AI assistant, in German, English, French, Italian, Russian or Ukrainian.

The project is an [MCP](https://modelcontextprotocol.io) server. You add it to Claude or ChatGPT, and the assistant becomes a patient tutor: it explains one topic at a time, asks the official questions one by one, checks every answer against the answer key and brings topics back for review on the right day.

> Not an official product of the Canton of Zurich. The questions come from the canton's official question list; the explanations were written for this project and checked against official sources.

## How it teaches

The method follows [Execute Program](https://www.executeprogram.com/why-ep):

- **Short lessons.** 37 lessons in 7 units, from the basics (Switzerland at a glance, how the state works) to the canton and the municipalities. Each concept is explained briefly and practised right away.
- **One question at a time.** The server hands out exactly one step. The assistant never sees the next question in advance and never judges answers itself.
- **Repeat until correct.** A wrong answer comes back at the end of the same lesson or review until it is answered correctly.
- **Spaced reviews.** Every concept comes back after 1, 3, 7, 14 and 30 days. A mistake moves it back one level.
- **Pitfalls explained.** Every answer explains why it is right and why the tempting wrong options are wrong. Where the exam answer is outdated, a note gives today's facts while teaching the answer the exam expects.
- **Mock exam.** 50 random questions without feedback, like the canton's official practice test.
- **Exam language.** Learners study in their own language, but always see the German wording, because the real test is in German.
- **Voice.** In voice conversations, questions that need pictures are left out and answers can be spoken.

## Use it

### Claude (web, desktop, mobile)

Settings → Connectors → **Add custom connector**, URL:

```
https://swiss-passport-zh.vercel.app/mcp
```

No login. On first use you get a learner code like `BERG-7K2Q`; give it in later chats to continue where you left off.

### ChatGPT

Settings → Apps & Connectors → Advanced → turn on **Developer mode**, then **Create** with the same URL and *No authentication*. Enable the app in a chat via **+ → Developer mode**.

### Claude Desktop, offline progress

Build the extension (`cd server && npm run pack`) and drag `server/swiss-passport-zh.mcpb` into Claude Desktop. Progress is stored on your computer in `~/.swiss-passport-quiz/`.

## Content

| File | What it holds |
|---|---|
| `quiz.json` | The 350 official questions: category, level, answer key, pictures. Language-neutral. |
| `curriculum.json` | Units → lessons → 96 concepts → questions, with official sources per concept. |
| `i18n/<lang>.json` | All text per language: questions, options, titles, concept explanations, key terms, answer explanations and notes. |
| `images/` | Pictures used by questions (flags, coats of arms, maps, photos), cut from the official PDF. |
| `sources/` | Links to the official documents and a summary of the exam rules. |
| `content/review_flags.md` | Open points for a human reviewer. |

Explanations were written in simple German (B1) using only official sources (the canton's and the city's learning brochures, admin.ch, ch.ch, zh.ch, the Historical Dictionary of Switzerland, fedlex) and translated into five languages. The translations are not official and would benefit from a review by native speakers.

## Development

The server lives in `server/` (TypeScript, Node 22+).

```sh
cd server
npm install
npm test          # builds and runs the local and HTTP end-to-end tests
npm run pack      # Claude Desktop extension (.mcpb)
npm run deploy    # Vercel (progress in Upstash Redis)
npm run release   # self-hosting package for a Mac (Node + built-in SQLite, see deploy/install.sh)
```

| Entry point | Transport | Progress stored in |
|---|---|---|
| `src/index.ts` | stdio (Claude Desktop extension) | a local JSON file |
| `src/vercel.ts` | Streamable HTTP on Vercel | Upstash Redis, per learner code |
| `src/http.ts` | Streamable HTTP, self-hosted | SQLite (`node:sqlite`), per learner code |

`src/server.ts` defines the tools and the tutoring instructions, `src/engine.ts` the lessons, reviews and mock exam, and `src/view/` the quiz card shown in the chat ([MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)).

## License

Free for personal learning and for non-profit use (e.g. charities, integration courses run by non-profits, public schools and authorities). **Commercial use is not allowed** without permission.

- Code: [PolyForm Noncommercial 1.0.0](LICENSE)
- Content written for this project (curriculum, explanations, translations): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md)
- The official questions are published by the Canton of Zurich; see [sources](sources/README.md).

This is a source-available project, not open source in the OSI sense, because commercial use is excluded.
