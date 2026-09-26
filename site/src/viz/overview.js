// "All 350 questions at a glance" on the homepage (issue #2): labels in six languages.
// Counts come from curriculum.json; "questions" takes the plural form the language needs (Intl.PluralRules).
export const OVERVIEW = {
  de: { title: "Alle 350 Fragen auf einen Blick", lesson: "Lektion", q: { one: "Frage", other: "Fragen" },
    hint: "Ein Punkt pro Frage, geordnet nach Lektionen. Wähl eine Lektion, um ihre Fragen zu sehen." },
  en: { title: "All 350 questions at a glance", lesson: "Lesson", q: { one: "question", other: "questions" },
    hint: "One dot per question, grouped by lesson. Choose a lesson to see its questions." },
  fr: { title: "Les 350 questions en un coup d'œil", lesson: "Leçon", q: { one: "question", other: "questions" },
    hint: "Un point par question, groupé par leçon. Choisis une leçon pour voir ses questions." },
  it: { title: "Tutte le 350 domande a colpo d'occhio", lesson: "Lezione", q: { one: "domanda", other: "domande" },
    hint: "Un punto per domanda, raggruppato per lezione. Scegli una lezione per vederne le domande." },
  ru: { title: "Все 350 вопросов одним взглядом", lesson: "Урок", q: { one: "вопрос", few: "вопроса", many: "вопросов", other: "вопроса" },
    hint: "Одна точка на вопрос, по урокам. Выбери урок, чтобы увидеть его вопросы." },
  uk: { title: "Усі 350 запитань одним поглядом", lesson: "Урок", q: { one: "запитання", few: "запитання", many: "запитань", other: "запитання" },
    hint: "Одна точка на запитання, за уроками. Обери урок, щоб побачити його запитання." },
};

/** "10 Fragen", "4 вопроса", "13 вопросов". */
export function countLabel(lang, n) {
  const forms = OVERVIEW[lang].q;
  return `${n} ${forms[new Intl.PluralRules(lang).select(n)] ?? forms.other}`;
}
