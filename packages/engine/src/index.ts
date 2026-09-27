// The learning engine. It knows the method (lessons with prerequisites, spaced reviews, mock exam) but no content:
// a catalog is passed in with createEngine(). It has no dependencies and reads no files.
export { createEngine, DEFAULT_REVIEW, REVIEW_SIZE, type Engine } from "./engine.js";
export {
  isRight,
  lessonStages,
  type Answer,
  type Catalog,
  type Curriculum,
  type OptionId,
  type Question,
  type ReviewSchedule,
  type Texts,
} from "./catalog.js";
export { emptyProgress, type ConceptState, type Progress, type Session } from "./progress.js";
export { validateCatalog } from "./validate.js";
