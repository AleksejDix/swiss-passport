// The learning engine. It knows the method (lessons with prerequisites, spaced reviews, mock exam) but no content:
// a catalog is passed in with createEngine(). It has no dependencies and reads no files.
export { createEngine, REVIEW_SIZE, type Engine } from "./engine.js";
export { lessonStages, type Catalog, type Curriculum, type Letter, type Question, type Texts } from "./catalog.js";
export { emptyProgress, type Progress, type Session } from "./progress.js";
