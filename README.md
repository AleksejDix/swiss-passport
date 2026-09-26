<p align="center">
  <a href="https://swiss-passport.com"><img src="site/public/favicon.svg" width="64" height="64" alt="Swiss Passport"></a>
</p>

<h1 align="center">Swiss Passport</h1>

<p align="center">
  <strong>Learn for the Zurich citizenship test.</strong><br>
  The 350 official questions of the knowledge test (Grundkenntnistest), one at a time, in your language.<br>
  In the browser, in Claude or in ChatGPT. Free, no account.
</p>

<p align="center">
  <a href="https://swiss-passport.com"><img src="https://img.shields.io/badge/website-swiss--passport.com-DA291C?style=flat-square" alt="Website: swiss-passport.com"></a>
  <a href="https://swiss-passport.com/learn/"><img src="https://img.shields.io/badge/learn-in_the_browser-000000?style=flat-square" alt="Learn in the browser"></a>
  <a href="#claude"><img src="https://img.shields.io/badge/MCP-Claude_%26_ChatGPT-000000?style=flat-square" alt="MCP server for Claude and ChatGPT"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-non--commercial-767676?style=flat-square" alt="License: non-commercial"></a>
</p>

<p align="center">
  <a href="https://swiss-passport.com"><img src=".github/screenshot.png" alt="The swiss-passport.com homepage: a map of the cantons next to a real exam question about the majority of the cantons" width="800"></a>
</p>

<p align="center">
  <a href="https://swiss-passport.com/de/">Deutsch</a> &nbsp;
  <a href="https://swiss-passport.com/en/">English</a> &nbsp;
  <a href="https://swiss-passport.com/fr/">Français</a> &nbsp;
  <a href="https://swiss-passport.com/it/">Italiano</a> &nbsp;
  <a href="https://swiss-passport.com/ru/">Русский</a> &nbsp;
  <a href="https://swiss-passport.com/uk/">Українська</a>
</p>

> [!NOTE]
> Not an official product of the Canton of Zurich. The questions come from the canton's official question list; the explanations were written for this project and checked against official sources.

## Start learning

There are three ways in. They share one learner code, so you can start in the browser and continue in Claude or ChatGPT.

| | Where | What you need |
|---|---|---|
| **Browser** | [swiss-passport.com/learn](https://swiss-passport.com/learn/) | Nothing. Open the page and start. |
| **Claude** | Web, desktop and mobile app, also by voice | A custom connector (below) |
| **ChatGPT** | With Developer mode turned on | A custom app (below) |

The connector address for Claude and ChatGPT is:

```
https://swiss-passport.com/mcp
```

### Claude

Settings → Connectors → **Add custom connector**, paste the address. No login needed.

### ChatGPT

Settings → Apps & Connectors → Advanced → turn on **Developer mode**. Then **Create**, paste the address and choose *No authentication*. Enable the app in a chat via **+ → Developer mode**.

### Your progress

On first use you get a learner code like `BERG-7K2Q`. Write it down and give it to the tutor in a new chat to continue where you left off. No account, no personal data.

### Claude Desktop, fully offline

Build the extension (`cd server && npm run pack`) and drag `server/swiss-passport-zh.mcpb` into Claude Desktop. Progress then stays on your computer in `~/.swiss-passport-quiz/`.

## How it teaches

The method follows [Execute Program](https://www.executeprogram.com/why-ep). The website explains it in detail, with the research behind it: [swiss-passport.com/en/method](https://swiss-passport.com/en/method/).

- **Short lessons.** 37 lessons in 7 units, from the basics (Switzerland at a glance, how the state works) to the canton and the municipalities. Each concept is explained briefly and practised right away.
- **One question at a time.** The server hands out exactly one step. The assistant never sees the next question in advance and never judges answers itself.
- **Repeat until correct.** A wrong answer comes back at the end of the same lesson or review until it is answered correctly.
- **Spaced reviews.** Every concept comes back after 1, 3, 7, 14 and 30 days. A mistake moves it back one level.
- **Pitfalls explained.** Every answer explains why it is right and why the tempting wrong options are wrong. Where the exam answer is outdated, a note gives today's facts while teaching the answer the exam expects.
- **Mock exam.** 50 random questions without feedback, like the canton's official practice test.
- **Exam language.** Learners study in their own language, but always see the German wording, because the real test is in German.
- **Voice.** In voice conversations, questions that need pictures are left out and answers can be spoken.

## What's inside

| | |
|---:|---|
| **350** | official questions of the Canton of Zurich |
| **37** | lessons in 7 units, from the basics to your municipality |
| **96** | topics, each explained in simple language |
| **6** | languages, always with the German original |
| **50** | questions per mock exam |

Every question, with its answer and explanation, is also on the website: [all questions](https://swiss-passport.com/en/questions/) and [about the test](https://swiss-passport.com/en/grundkenntnistest/).

Explanations were written in simple German (B1) using only official sources (the canton's and the city's learning brochures, admin.ch, ch.ch, zh.ch, the Historical Dictionary of Switzerland, fedlex) and translated into five languages. The translations are not official and would benefit from a review by native speakers. [Open an issue](https://github.com/AleksejDix/swiss-passport/issues) if you spot a mistake.

<details>
<summary><strong>Content files</strong></summary>

| File | What it holds |
|---|---|
| `quiz.json` | The 350 official questions: category, level, answer key, pictures. Language-neutral. |
| `curriculum.json` | Units → lessons → 96 concepts → questions, with official sources per concept. |
| `i18n/<lang>.json` | All text per language: questions, options, titles, concept explanations, key terms, answer explanations and notes. |
| `images/` | Pictures used by questions (flags, coats of arms, maps, photos), cut from the official PDF. |
| `sources/` | Links to the official documents and a summary of the exam rules. |
| `content/review_flags.md` | Open points for a human reviewer. |

</details>

## Development

<details>
<summary><strong>Build, test and deploy</strong></summary>

The server lives in `server/` (TypeScript, Node 22+).

```sh
cd server
npm install
npm test            # builds and runs the local and HTTP end-to-end tests
npm run pack        # Claude Desktop extension (.mcpb)
npm run deploy      # Cloudflare: website + /mcp Worker (progress in D1)
npm run dev:worker  # the same Worker locally on http://localhost:8787
npm run release     # self-hosting package for a Mac (Node + built-in SQLite, see deploy/install.sh)
```

| Entry point | Transport | Progress stored in |
|---|---|---|
| `src/index.ts` | stdio (Claude Desktop extension) | a local JSON file |
| `src/worker.ts` | Streamable HTTP on Cloudflare Workers (swiss-passport.com) | Cloudflare D1, per learner code |
| `src/http.ts` | Streamable HTTP, self-hosted | SQLite (`node:sqlite`), per learner code |

The website (`site/`, Astro) is built into `server/public` and served by the same Worker as static files.

`src/server.ts` defines the tools and the tutoring instructions, `src/engine.ts` the lessons, reviews and mock exam, and `src/view/` the quiz card shown in the chat ([MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)).

</details>

## License

Free for personal learning and for non-profit use (e.g. charities, integration courses run by non-profits, public schools and authorities). **Commercial use is not allowed** without permission.

- Code: [PolyForm Noncommercial 1.0.0](LICENSE)
- Content written for this project (curriculum, explanations, translations): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md)
- The official questions are published by the Canton of Zurich; see [sources](sources/README.md).

This is a source-available project, not open source in the OSI sense, because commercial use is excluded.
