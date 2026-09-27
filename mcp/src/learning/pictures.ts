// The pictures of a question, for the REST API (paths) and the MCP tools (the images themselves).
import { engine } from "./catalog.js";

/** One picture: "question", or the letter of the option it shows, and its file (e.g. "images/karte_zh_a.png"). */
export interface Picture {
  key: string;
  file: string;
}

/** The question's pictures: the question's own first, then those of its options. None for an unknown id. */
export function questionPictures(questionId: string | undefined): Picture[] {
  const q = questionId ? engine.question(questionId) : undefined;
  if (!q) return [];
  return [
    ...(q.image ? [{ key: "question", file: q.image }] : []),
    ...q.options.flatMap((o) => (o.image ? [{ key: o.id, file: o.image }] : [])),
  ];
}
