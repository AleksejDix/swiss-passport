// "All 350 questions at a glance" (issue #2): labels from the language files in i18n/, the map's units, lessons and
// questions from curriculum.json. Counts take the plural form the language needs (Intl.PluralRules).
import { questions, questionsPath, units } from "../data.ts";
import { texts } from "../i18n.ts";

/** "10 Fragen", "4 вопроса", "13 вопросов". */
export function countLabel(lang: string, n: number) {
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string } = texts(lang).site.viz.overview.q;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
}

/** A lesson on the map: its label ("Lektion 5: … · 9 Fragen"), the link to its questions and their ids in order. */
export interface MapLesson {
  id: string;
  label: string;
  href: string;
  questions: string[];
}
export interface MapUnit {
  id: string;
  title: string;
  lessons: MapLesson[];
}
/** Title and hint of the map, and the legend of a learner's results (right, wrong, not answered yet). */
export interface MapTexts {
  title: string;
  hint: string;
  right: string;
  wrong: string;
  open: string;
}
export interface QuestionMapData {
  units: MapUnit[];
  texts: MapTexts;
}

/** The question map in a language: every unit with its lessons, numbered through the course, and their questions. */
export function questionMap(lang: string): QuestionMapData {
  const t = texts(lang);
  const o = t.site.viz.overview;
  let number = 0;
  return {
    texts: { title: o.title, hint: o.hint, right: o.right, wrong: o.wrong, open: o.open },
    units: units.map((u) => ({
      id: u.id,
      title: t.units[u.id].title,
      lessons: u.lessons.map((id) => {
        number += 1;
        const ids = questions.filter((q) => q.lesson === id).map((q) => q.id);
        return {
          id,
          label: `${o.lesson} ${number}: ${t.lessons[id].title} · ${countLabel(lang, ids.length)}`,
          href: `${questionsPath(lang)}#${id}`,
          questions: ids,
        };
      }),
    })),
  };
}
