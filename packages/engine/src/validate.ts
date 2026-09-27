// Checks that a catalog fits together, so that a mistake in the content fails a course's tests
// instead of a learner's session.
import { answerList, type Catalog } from "./catalog.js";

/** Everything wrong with a catalog, one sentence per problem; empty when it is fine. Run it in the course's tests. */
export function validateCatalog(catalog: Catalog): string[] {
  const problems: string[] = [];
  const { questions, languages, texts } = catalog;
  const { units, lessons, concepts } = catalog.curriculum;
  const unitById = new Map(units.map((u) => [u.id, u]));
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  const twice = (ids: string[]) => new Set(ids.filter((id, i) => ids.indexOf(id) !== i));

  for (const [kind, ids] of [
    ["question", questions.map((q) => q.id)],
    ["unit", units.map((u) => u.id)],
    ["lesson", lessons.map((l) => l.id)],
    ["topic", concepts.map((c) => c.id)],
  ] as const)
    for (const id of twice(ids)) problems.push(`${kind} ${id} is there more than once`);

  for (const q of questions) {
    const options = q.options.map((o) => o.id);
    const answers = answerList(q.answer);
    if (options.length < 2) problems.push(`question ${q.id} has fewer than two options`);
    for (const o of twice(options)) problems.push(`question ${q.id} has option ${o} more than once`);
    if (!answers.length) problems.push(`question ${q.id} has no answer`);
    for (const a of twice(answers)) problems.push(`question ${q.id} has the answer ${a} more than once`);
    for (const a of answers) if (!options.includes(a)) problems.push(`question ${q.id}: its answer ${a} is no option`);
    if (q.points !== undefined && !(q.points > 0)) problems.push(`question ${q.id}: points must be more than 0`);
  }

  // Every question is in exactly one topic; units, lessons and topics point at each other.
  const topics = new Map(questions.map((q) => [q.id, 0]));
  for (const c of concepts)
    for (const id of c.questions) {
      if (topics.has(id)) topics.set(id, topics.get(id)! + 1);
      else problems.push(`topic ${c.id} has question ${id}, which does not exist`);
    }
  for (const [id, n] of topics) if (n !== 1) problems.push(`question ${id} is in ${n} topics instead of one`);
  for (const u of units)
    for (const id of u.lessons)
      if (lessonById.get(id)?.unit !== u.id) problems.push(`unit ${u.id} lists lesson ${id}, which is not in it`);
  for (const l of lessons) {
    if (!unitById.get(l.unit)?.lessons.includes(l.id)) problems.push(`lesson ${l.id} is not listed in unit ${l.unit}`);
    for (const id of l.concepts)
      if (conceptById.get(id)?.lesson !== l.id) problems.push(`lesson ${l.id} lists topic ${id}, which is not in it`);
    for (const id of l.requires ?? [])
      if (!lessonById.has(id)) problems.push(`lesson ${l.id} requires lesson ${id}, which does not exist`);
  }
  for (const c of concepts)
    if (!lessonById.get(c.lesson)?.concepts.includes(c.id))
      problems.push(`topic ${c.id} is not listed in lesson ${c.lesson}`);

  // No cycles in the prerequisites: lessons in a cycle could never open.
  const checked = new Set<string>();
  const visit = (id: string, path: string[]) => {
    if (checked.has(id)) return;
    if (path.includes(id)) {
      problems.push(`lessons require each other in a circle: ${[...path.slice(path.indexOf(id)), id].join(" -> ")}`);
      return;
    }
    for (const r of lessonById.get(id)?.requires ?? []) visit(r, [...path, id]);
    checked.add(id);
  };
  for (const l of lessons) visit(l.id, []);

  if (!(catalog.exam.size >= 1)) problems.push("exam.size must be at least 1");
  if (catalog.review && !(catalog.review.days.length && catalog.review.days.every((d) => d > 0)))
    problems.push("review.days must list at least one delay, each more than 0 days");
  if (!languages.length) problems.push("the catalog has no languages");

  // The first language fills in every text another language leaves out, so it needs all of them.
  // A question another language does translate needs all its options, since they are shown together.
  for (const [i, lang] of languages.entries()) {
    const t = texts[lang];
    if (!t) {
      problems.push(`there are no texts in ${lang}`);
      continue;
    }
    const first = i === 0;
    for (const q of questions) {
      const tq = t.questions[q.id];
      if (!tq) {
        if (first) problems.push(`${lang}: question ${q.id} has no text`);
        continue;
      }
      if (!tq.question) problems.push(`${lang}: question ${q.id} has no question text`);
      for (const o of q.options)
        if (!tq.options?.[o.id]) problems.push(`${lang}: question ${q.id} has no text for option ${o.id}`);
      for (const a of answerList(q.answer))
        if (tq.distractors?.[a]) problems.push(`${lang}: question ${q.id} says why ${a} is wrong, but it is right`);
    }
    if (!first) continue;
    for (const c of new Set(questions.map((q) => q.category)))
      if (!t.categories?.[c]) problems.push(`${lang}: category ${c} has no title`);
    for (const l of new Set(questions.map((q) => q.level)))
      if (!t.levels?.[l]) problems.push(`${lang}: level ${l} has no title`);
    for (const u of units) if (!t.units?.[u.id]?.title) problems.push(`${lang}: unit ${u.id} has no title`);
    for (const l of lessons) if (!t.lessons?.[l.id]?.title) problems.push(`${lang}: lesson ${l.id} has no title`);
    for (const c of concepts) if (!t.concepts?.[c.id]?.title) problems.push(`${lang}: topic ${c.id} has no title`);
  }
  return problems;
}
