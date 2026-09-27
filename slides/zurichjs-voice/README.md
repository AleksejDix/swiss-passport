# ZurichJS talk: ChatGPT Voice Mode Ignored My MCP Server. Here's How I Made It Listen.

Submitted to ZurichJS on 27 September 2026 (meetup talk, 25 minutes, intermediate). ZurichJS answers within two weeks.

Online: https://swiss-passport.com/slides/zurichjs-voice/ (the site build copies this folder, without the Markdown files; see site/slides.mjs).

| File | What it holds |
|---|---|
| `index.html` | The deck: 27 slides in reveal.js, speaker notes with the timing in each slide's `<aside class="notes">` |
| `deck.css` | The Swiss design and every animation |
| `deck.js` | The interactive parts: fragments that switch classes, the MCP flow, counters, typing, the quiz, the quiz card, the text or voice switches, reading aloud |
| `demo.md` | The live demo: setup, script, what to do when it fails |
| `vendor/reveal/` | reveal.js 6.0.2 with the notes and highlight plugins (MIT), copied in so the deck works offline |
| `fonts/` | Inter, latin and cyrillic (OFL) |
| `qr.svg` | QR code to swiss-passport.com, on the last slide |

## Present
Open `index.html` in Chrome: a double-click is enough, no server and no internet needed. The online copy works the same, speaker view included.

| Key | Does |
|---|---|
| → or Space | next step or slide |
| ← | back |
| S | speaker view in a new window: current slide, next step, notes, timer and clock |
| F | fullscreen |
| O or Esc | overview of all slides |
| B | black screen |
| R | reads the question aloud with the browser's voice (slide 18) |
| T | switches between text chat and voice (slides 16 and 19) |

For the talk: speaker view on the laptop screen, the deck in fullscreen on the projector. Allow the popup if Chrome blocks it.

## What moves
- Slide 3: the room answers the exam question; click the option they shout, → shows the answer, → the missing verb.
- Slide 4: the numbers count up, "Learn online" goes through all eight languages.
- Slide 5: seven steps of one voice round trip between learner, ChatGPT, MCP server and D1.
- Slide 9: the quiz card checks clicks like the real one.
- Slides 12 and 20: the voice lesson before and after, message by message, with the server log next to it.
- Slide 15: how the server learns it is a voice conversation; a red line reads each signal, then its verdict shows.
- Slides 16 and 19: the switches can also be clicked, back and forth.
- Slide 17: the voice flag drops into the session and moves along with every answer.
- Slide 18: the button or R reads the question with its options, the part being read is marked.
- Slide 23: the test output types itself.

## PDF for the organisers
Open `index.html?print-pdf` in Chrome, print, save as PDF (margins: none, background graphics on).

## Still to do
- [ ] Record the backup video of the demo (see `demo.md`)
- [ ] Date of the meetup on the title slide, once ZurichJS confirms

Every claim on a slide points to the code, a commit or a document: mcp/src/mcp/texts.ts (INSTRUCTIONS, CARD_NOTE, VOICE_STEP), mcp/src/mcp/result.ts (voice_instructions in every step, the card's data in _meta for ChatGPT), mcp/src/mcp/tools.ts (the voice flag), mcp/src/learning/learning.ts and steps.ts (the session keeps the mode), the _meta fields ChatGPT sends (OpenAI Apps SDK reference, developers.openai.com/apps-sdk/reference), packages/engine/src/engine.ts (picture questions in voice sessions), mcp/scripts/smoke-test.mjs (voice checks), commits 46c079c, 3aff855, 84288e1, b86e422, 1ed417d, 1b07ac9, 05e1a4c. The conversation on slide 12 is reconstructed from commit 46c079c; its words are illustrative.
