# ADR 0001: Live quiz for a room

Status: proposed, 2026-09-27

## Context

Everyone in a room answers the same question on their own phone, each in their own language, while one presenter moves through the questions. First use: 3 or 4 questions in the ZurichJS voice talk (`slides/zurichjs-voice/`). Later: families on a TV, integration classes on a projector.

Today everything serves one learner at a time. `/api/v1` and `/mcp` answer single requests and keep progress in D1. Nothing can push a message to many phones at once.

Constraints:

- Workers Free plan.
- `/api/v1` never breaks (the mobile apps depend on it).
- Learner codes never appear in URLs or headers (Workers Logs keep both for 3 days).
- The deck works without a network.
- The WAF rule allows 100 requests per 10 s per IP on `/mcp` and `/api/`. A venue's wifi puts all phones on one IP.

## Decision

1. **One Durable Object per room** (SQLite-backed, available on the free plan), using the WebSocket Hibernation API.
   - The current question lives in the object's own storage.
   - Each phone's language and vote live in its socket attachment, so they survive hibernation.
   - No D1 table.
2. **Anonymous players.** No names, no learner codes. Each connection gets one vote per question; the server ignores further votes.
3. **The server renders the text.** A phone connects with its language. The room sends every phone the question in that language (German original included), and on reveal the explanation for that phone's own answer. Both come from the engine, which already builds them (`questionText`, `explanation`) but does not export them yet.
4. **The deck is the presenter.** The presenter key sits in the deck's URL fragment (never sent over HTTP). The deck sends it as its first WebSocket message and checks it against the Worker secret `LIVE_KEY`. Without a network the deck behaves as today.
5. **Paths:**
   - The phone page is `/live/`: static, Svelte, and reusing the `/learn` components (Question, Choices, Explanation).
   - The socket is `/rooms/<room>?lang=<code>`. It sits outside `/api/`, so the WAF rule does not block a venue on one IP.
   - The room holds at most 300 connections and accepts small messages only.

Messages (JSON):

| From | Message |
|---|---|
| presenter | `hello {key}`, `show {question_id}`, `reveal`, `end` |
| phone | `vote {question_id, answer}` |
| room to phones | `question {step}`, `reveal {explanation}`, `wait` |
| room to presenter | `tally {question_id, counts, players}` |

## What changes

| Where | Change | Size |
|---|---|---|
| `packages/engine` | `createEngine` also returns `questionText` and `explanation` (additive, 0.2.0) | 2 lines |
| `mcp/src/live/room.ts` (new) | The Durable Object: sockets, votes, tally, presenter check | ~150 lines |
| `mcp/src/worker.ts` | `/rooms/*` goes to the room; export the class | ~5 lines |
| `mcp/wrangler.jsonc` | Durable Object binding, migration `new_sqlite_classes`, `/rooms/*` in `run_worker_first`, secret `LIVE_KEY` | ~10 lines |
| `site/src/pages/live/` and `site/src/live/` (new) | Phone page: pick language, wait, answer, see why | ~200 lines |
| `i18n/*.json` | New `live` block, about 8 strings, in all 8 languages | translation |
| `site/security-headers.mjs` | Only if iOS Safari does not match `wss:` with `'self'` in `connect-src` | 0 to 2 lines |
| `slides/zurichjs-voice/` | QR code to `/live/` on slide 2, `data-live` on the question slides, socket and answer bars in `deck.js` | ~60 lines |
| Privacy policy | One sentence: room connections appear in Workers Logs, no personal data | 8 languages + Datenschutz |
| Tests | e2e with one presenter and two phones against `wrangler dev`; visual shots of `/live/` | 2 tests |

Unchanged: `/api/v1`, `/mcp`, the D1 schema, learner codes, the engine's learning logic, `/learn`.

Estimate: 1.5 to 2 days with tests and translations.

## Alternatives

- **Polling `/api` over D1:** 80 phones polling every second for 25 minutes is 120,000 requests, more than the free plan's 100,000 a day, and it hits the WAF rule on a shared IP.
- **Slido or Mentimeter:** no code, but no 8 languages and no verified explanations.
- **PartyKit (partyserver):** a wrapper around the same Durable Object; one more dependency to save about 150 lines.

## Consequences

- This is the project's first Durable Object. Class migrations are permanent: renaming the class later needs another migration.
- `/rooms/` is public and has no learner-code guard. The connection cap, the message size limit and one vote per socket are the protection. A JS audience will test them.
- The same room later serves families and classes. Rooms anyone can create (a random code, a presenter token handed out when the room is created) need their own ADR.
- "Keep learning" (saving the room's answers to a new learner code) is out of scope. It would need a new `/api/v1` endpoint.

## Open questions

1. Presenter key: one Worker secret (proposed) or a token per room?
2. Stay anonymous (proposed), or add nicknames and a leaderboard?
3. Which 3 or 4 questions, on which slides?
