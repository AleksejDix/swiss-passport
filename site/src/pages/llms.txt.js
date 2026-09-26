// llms.txt: a plain-text map of the site for AI assistants (https://llmstxt.org).
import { SITE } from "../site.js";
import { TEXT, LANG_IDS, questions, topics, questionPath, questionsPath, topicPath, guidePath, methodPath } from "../data.js";
import { GUIDE } from "../guide.js";
import { METHOD } from "../method.js";

export function GET() {
  const en = TEXT.en;
  const url = (path) => new URL(path, SITE).href;
  const lines = [
    "# Swiss Passport",
    "",
    "> Free study material for the Zurich naturalisation knowledge test (Grundkenntnistest Kanton Zürich): all 350 official questions with the correct answer, an explanation of why it is right and why tempting wrong answers are wrong, in German, English, French, Italian, Russian and Ukrainian.",
    "",
    "The questions are published by the Canton of Zurich (Gemeindeamt, Abteilung Einbürgerungen, May 2025). The test itself is in German. Explanations were checked against official sources (zh.ch, stadt-zuerich.ch, admin.ch, ch.ch). Not an official service of the canton.",
    "",
    "## About the test",
    "",
    ...LANG_IDS.map((lang) => `- [${GUIDE[lang].title}](${url(guidePath(lang))})`),
    "",
    "## Learning method",
    "",
    ...LANG_IDS.map((lang) => `- [${METHOD[lang].title}](${url(methodPath(lang))})`),
    "",
    "## Question lists",
    "",
    ...LANG_IDS.map((lang) => `- [${TEXT[lang].title}](${url(questionsPath(lang))})`),
    "",
    "## Learn",
    "",
    `- [Learn online](${url("/learn/")}): lessons, spaced repetition and 50-question mock exams in the browser`,
    `- MCP connector for Claude and ChatGPT: ${url("/mcp")}`,
    `- WebMCP: in browsers that support it, ${url("/learn/")} offers page tools for agents: get_progress, start_lesson, start_reviews, start_mock_exam, answer_question, next_question, set_language`,
    "",
    "## Topics (English)",
    "",
    ...topics.map((c) => `- [${en.concepts[c.id].title}](${url(topicPath("en", c))})`),
    "",
    "## Questions (English)",
    "",
    ...questions.map((q) => `- [${en.questions[q.id].question}](${url(questionPath("en", q))})`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
