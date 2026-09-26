// The learning engine. It knows the method (lessons, spaced reviews, mock exam) but no content:
// a catalog is passed in with createEngine(). Nothing in this folder imports from outside it.
export { createEngine, REVIEW_SIZE, type Engine } from "./engine.js";
export type { Catalog, Letter, Question } from "./catalog.js";
export { emptyProgress, type Progress, type Session } from "./progress.js";
