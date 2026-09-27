// Types of index.js. The German file sets the shape of the interface texts (site, learn, card); the quiz content is
// keyed by id (q001, l01, u1, topic ids), so it is typed as records. tests/content.test.js checks that every
// language has exactly the keys of de.json.
import type German from "./de.json";

/** The options of every question of the Zurich test. */
export type Letter = "a" | "b" | "c" | "d";

export interface QuestionText {
  question: string;
  options: Record<Letter, string>;
  why: string;
  /** Why a tempting wrong option is wrong, for some of the wrong options. */
  distractors: Partial<Record<Letter, string>>;
  /** Where the official answer is outdated or simplified: what applies today. */
  note?: string;
}

export interface ConceptText {
  title: string;
  intro: string[];
  key_terms: { term: string; definition: string }[];
  mnemonic?: string;
}

/** A section of a page: its heading and paragraphs. */
export type Section = [heading: string, paragraphs: string[]];

type Site = (typeof German)["site"];
type SiteTexts = Omit<Site, "about" | "method"> & {
  about: Omit<Site["about"], "sections"> & { sections: Section[] };
  method: Omit<Site["method"], "sections"> & { sections: Section[] };
};

/** All texts of one language: i18n/<code>.json. */
export type Text = Omit<
  typeof German,
  "questions" | "concepts" | "lessons" | "units" | "categories" | "levels" | "site"
> & {
  site: SiteTexts;
  questions: Record<string, QuestionText>;
  concepts: Record<string, ConceptText>;
  lessons: Record<string, { title: string }>;
  units: Record<string, { title: string }>;
  categories: Record<string, string>;
  levels: Record<string, string>;
};

export declare const TEXTS: Record<string, Text>;
export declare const LANGUAGES: readonly [string, ...string[]];
export declare function byLang<T>(pick: (text: Text) => T): Record<string, T>;
export declare const LANGUAGE_NAMES: Record<string, string>;
