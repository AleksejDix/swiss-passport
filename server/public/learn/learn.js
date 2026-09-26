// Learn online: a browser client for the same MCP tools that Claude and ChatGPT use.
// Progress lives on the server under the learner code, which the browser remembers.
import { LANGS, currentLang, saveLang } from "../i18n.js";

const API = "/mcp";

// Interface text. Quiz content comes translated from the server.
const T = {
  de: {
    whatNext: "Wie geht es weiter", whatNextText: "Die Themen dieser Runde kommen morgen zur Wiederholung. Mach jeden Tag zuerst die fälligen Wiederholungen, dann eine neue Lektion.",
    showExplanation: "Erklärung zeigen", answerFirst: "Beantworte zuerst die Frage. Die Erklärung erscheint danach.",
    title: "Online lernen", lede: "Kurze Lektionen, Wiederholungen zur richtigen Zeit und Probeprüfungen mit den offiziellen Fragen.",
    lesson: "Lektion", continueLesson: "Weiter mit der Lektion", reviews: "Wiederholen", due: (n) => `${n} fällig`, noneDue: "nichts fällig",
    exam: "Probeprüfung", examSub: "50 Fragen, ohne Hilfe", allDone: "Alle Lektionen erledigt",
    lessonsDone: "Lektionen erledigt", ready: "bereit für die Prüfung, nach Thema", examsDone: "Probeprüfungen",
    yourCode: "Dein Lerncode", codeHelp: "Mit diesem Code lernst du auf jedem Gerät weiter, auch in Claude oder ChatGPT.",
    haveCode: "Du hast schon einen Code?", useCode: "Verwenden", unknownCode: "Diesen Code gibt es nicht. Prüfe ihn.",
    next: "Weiter", right: "Richtig.", wrong: "Nicht ganz. Richtig ist", retry: "Diese Frage kam vorhin falsch. Versuch es nochmals.",
    comesAgain: "Diese Frage kommt am Ende der Lektion nochmals.", examNote: "Probeprüfung: keine Rückmeldung bis zum Schluss.",
    overview: "Zur Übersicht", source: "Quelle", keys: "Tasten A bis D wählen, Enter geht weiter.",
    doneLesson: "Lektion erledigt", doneReview: "Wiederholung erledigt", firstTry: "beim ersten Versuch richtig",
    examResult: "Ergebnis der Probeprüfung", passMark: "Die offizielle Bestehensgrenze ist nicht veröffentlicht.", mistakes: "Deine Fehler",
    yours: "Deine Antwort", error: "Keine Verbindung zum Server. Versuch es nochmals.", nextLesson: "Nächste Lektion",
  },
  en: {
    whatNext: "What's next", whatNextText: "The topics of this round come back for review tomorrow. Each day, do the due reviews first, then a new lesson.",
    showExplanation: "Show explanation", answerFirst: "Answer the question first. The explanation appears afterwards.",
    title: "Learn online", lede: "Short lessons, reviews at the right time and mock exams with the official questions.",
    lesson: "Lesson", continueLesson: "Continue lesson", reviews: "Review", due: (n) => `${n} due`, noneDue: "nothing due",
    exam: "Mock exam", examSub: "50 questions, no help", allDone: "All lessons done",
    lessonsDone: "lessons done", ready: "ready for the exam, by topic", examsDone: "Mock exams",
    yourCode: "Your learner code", codeHelp: "Use this code to continue on any device, also in Claude or ChatGPT.",
    haveCode: "Already have a code?", useCode: "Use", unknownCode: "This code does not exist. Check it.",
    next: "Next", right: "Correct.", wrong: "Not quite. The answer is", retry: "You got this one wrong earlier. Try again.",
    comesAgain: "This question comes back at the end of the lesson.", examNote: "Mock exam: no feedback until the end.",
    overview: "Back to overview", source: "Source", keys: "Keys A to D choose, Enter continues.",
    doneLesson: "Lesson done", doneReview: "Review done", firstTry: "correct at the first try",
    examResult: "Mock exam result", passMark: "The official pass mark is not published.", mistakes: "Your mistakes",
    yours: "Your answer", error: "No connection to the server. Try again.", nextLesson: "Next lesson",
  },
  fr: {
    whatNext: "Et ensuite", whatNextText: "Les thèmes de cette série reviendront demain pour une révision. Chaque jour, fais d'abord les révisions prévues, puis une nouvelle leçon.",
    showExplanation: "Afficher l'explication", answerFirst: "Réponds d'abord à la question. L'explication apparaît ensuite.",
    title: "Apprendre en ligne", lede: "Des leçons courtes, des révisions au bon moment et des examens blancs avec les questions officielles.",
    lesson: "Leçon", continueLesson: "Continuer la leçon", reviews: "Réviser", due: (n) => `${n} à réviser`, noneDue: "rien à réviser",
    exam: "Examen blanc", examSub: "50 questions, sans aide", allDone: "Toutes les leçons sont faites",
    lessonsDone: "leçons faites", ready: "prêt pour l'examen, par thème", examsDone: "Examens blancs",
    yourCode: "Ton code d'apprentissage", codeHelp: "Avec ce code, tu continues sur n'importe quel appareil, aussi dans Claude ou ChatGPT.",
    haveCode: "Tu as déjà un code ?", useCode: "Utiliser", unknownCode: "Ce code n'existe pas. Vérifie-le.",
    next: "Suivant", right: "Correct.", wrong: "Pas tout à fait. La bonne réponse est", retry: "Tu t'étais trompé ici. Essaie encore.",
    comesAgain: "Cette question reviendra à la fin de la leçon.", examNote: "Examen blanc : pas de retour avant la fin.",
    overview: "Retour à l'aperçu", source: "Source", keys: "Touches A à D pour choisir, Entrée pour continuer.",
    doneLesson: "Leçon terminée", doneReview: "Révision terminée", firstTry: "justes du premier coup",
    examResult: "Résultat de l'examen blanc", passMark: "Le seuil officiel de réussite n'est pas publié.", mistakes: "Tes erreurs",
    yours: "Ta réponse", error: "Pas de connexion au serveur. Réessaie.", nextLesson: "Leçon suivante",
  },
  it: {
    whatNext: "E adesso", whatNextText: "I temi di questo giro tornano domani per il ripasso. Ogni giorno fai prima i ripassi previsti, poi una nuova lezione.",
    showExplanation: "Mostra la spiegazione", answerFirst: "Rispondi prima alla domanda. La spiegazione appare dopo.",
    title: "Impara online", lede: "Lezioni brevi, ripassi al momento giusto ed esami di prova con le domande ufficiali.",
    lesson: "Lezione", continueLesson: "Continua la lezione", reviews: "Ripassa", due: (n) => `${n} da ripassare`, noneDue: "niente da ripassare",
    exam: "Esame di prova", examSub: "50 domande, senza aiuto", allDone: "Tutte le lezioni fatte",
    lessonsDone: "lezioni fatte", ready: "pronto per l'esame, per tema", examsDone: "Esami di prova",
    yourCode: "Il tuo codice", codeHelp: "Con questo codice continui su qualsiasi dispositivo, anche in Claude o ChatGPT.",
    haveCode: "Hai già un codice?", useCode: "Usa", unknownCode: "Questo codice non esiste. Controllalo.",
    next: "Avanti", right: "Giusto.", wrong: "Non proprio. La risposta giusta è", retry: "Prima avevi sbagliato questa domanda. Riprova.",
    comesAgain: "Questa domanda torna alla fine della lezione.", examNote: "Esame di prova: nessun riscontro fino alla fine.",
    overview: "Torna alla panoramica", source: "Fonte", keys: "Tasti da A a D per scegliere, Invio per continuare.",
    doneLesson: "Lezione finita", doneReview: "Ripasso finito", firstTry: "giuste al primo tentativo",
    examResult: "Risultato dell'esame di prova", passMark: "La soglia ufficiale per superare l'esame non è pubblicata.", mistakes: "I tuoi errori",
    yours: "La tua risposta", error: "Nessuna connessione al server. Riprova.", nextLesson: "Prossima lezione",
  },
  ru: {
    whatNext: "Что дальше", whatNextText: "Темы этого урока вернутся на повторение завтра. Каждый день сначала повторяй то, что пора повторить, потом проходи новый урок.",
    showExplanation: "Показать объяснение", answerFirst: "Сначала ответь на вопрос. Объяснение появится после ответа.",
    title: "Учиться онлайн", lede: "Короткие уроки, повторение в нужный момент и пробные экзамены с официальными вопросами.",
    lesson: "Урок", continueLesson: "Продолжить урок", reviews: "Повторить", due: (n) => `к повторению: ${n}`, noneDue: "повторять нечего",
    exam: "Пробный экзамен", examSub: "50 вопросов, без подсказок", allDone: "Все уроки пройдены",
    lessonsDone: "уроков пройдено", ready: "готовность к экзамену по темам", examsDone: "Пробные экзамены",
    yourCode: "Твой код ученика", codeHelp: "С этим кодом можно продолжить на любом устройстве, а также в Claude или ChatGPT.",
    haveCode: "Уже есть код?", useCode: "Ввести", unknownCode: "Такого кода нет. Проверь его.",
    next: "Дальше", right: "Верно.", wrong: "Не совсем. Правильный ответ:", retry: "Раньше здесь была ошибка. Попробуй ещё раз.",
    comesAgain: "Этот вопрос вернётся в конце урока.", examNote: "Пробный экзамен: без подсказок до конца.",
    overview: "К обзору", source: "Источник", keys: "Клавиши A–D выбирают ответ, Enter продолжает.",
    doneLesson: "Урок пройден", doneReview: "Повторение закончено", firstTry: "верно с первой попытки",
    examResult: "Результат пробного экзамена", passMark: "Официальный проходной балл не опубликован.", mistakes: "Твои ошибки",
    yours: "Твой ответ", error: "Нет связи с сервером. Попробуй ещё раз.", nextLesson: "Следующий урок",
  },
  uk: {
    whatNext: "Що далі", whatNextText: "Теми цього уроку повернуться на повторення завтра. Щодня спершу повторюй те, що час повторити, потім проходь новий урок.",
    showExplanation: "Показати пояснення", answerFirst: "Спершу дай відповідь на запитання. Пояснення з'явиться після відповіді.",
    title: "Навчатися онлайн", lede: "Короткі уроки, повторення у правильний час і пробні іспити з офіційними запитаннями.",
    lesson: "Урок", continueLesson: "Продовжити урок", reviews: "Повторити", due: (n) => `до повторення: ${n}`, noneDue: "нічого повторювати",
    exam: "Пробний іспит", examSub: "50 запитань, без підказок", allDone: "Усі уроки пройдено",
    lessonsDone: "уроків пройдено", ready: "готовність до іспиту за темами", examsDone: "Пробні іспити",
    yourCode: "Твій код учня", codeHelp: "З цим кодом можна продовжити на будь-якому пристрої, а також у Claude чи ChatGPT.",
    haveCode: "Уже маєш код?", useCode: "Увести", unknownCode: "Такого коду немає. Перевір його.",
    next: "Далі", right: "Правильно.", wrong: "Не зовсім. Правильна відповідь:", retry: "Раніше тут була помилка. Спробуй ще раз.",
    comesAgain: "Це запитання повернеться наприкінці уроку.", examNote: "Пробний іспит: без підказок до кінця.",
    overview: "До огляду", source: "Джерело", keys: "Клавіші A–D обирають відповідь, Enter продовжує.",
    doneLesson: "Урок пройдено", doneReview: "Повторення завершено", firstTry: "правильно з першої спроби",
    examResult: "Результат пробного іспиту", passMark: "Офіційний прохідний бал не опубліковано.", mistakes: "Твої помилки",
    yours: "Твоя відповідь", error: "Немає зв'язку із сервером. Спробуй ще раз.", nextLesson: "Наступний урок",
  },
};

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: code shown on screen */ } },
};
let lang = currentLang();
let code = store.get("sp-code");
const t = () => T[lang];

const app = document.querySelector("[data-app]");

/** Small element builder: h("p", { class: "x" }, "text", child). */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

let rpcId = 0;
/** Calls one MCP tool and returns { data, images }. */
async function call(name, args = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: ++rpcId, method: "tools/call",
      params: { name, arguments: { language: lang, ...(code && { learner_code: code }), ...args } },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  const { data, images } = result.structuredContent;
  if (data.learner_code && !data.error) {
    code = data.learner_code;
    store.set("sp-code", code);
  }
  return { data, images: images ?? {} };
}

/**
 * Every screen uses the same frame: a head row, then two columns on large screens.
 * Right: what you act on (the question, the buttons). Left: information (explanation, progress).
 * On phones the right part comes first.
 */
function frame(head, act, info) {
  return [
    head,
    h("div", { class: "cols" },
      h("section", { class: "act" }, act),
      h("aside", { class: "info" }, info)),
  ];
}

function show(...nodes) {
  app.replaceChildren(...nodes.flat().filter((n) => n != null && n !== false));
  window.scrollTo({ top: 0 });
}

function fail() {
  show(h("p", { class: "error" }, t().error), h("button", { class: "next", onclick: home }, t().overview));
}

// ---- Language switch ------------------------------------------------------------------

function renderLangs() {
  const nav = document.querySelector("[data-langs]");
  nav.replaceChildren(
    ...Object.entries(LANGS).map(([id, name]) =>
      h("button", { type: "button", lang: id, "aria-pressed": String(id === lang), onclick: () => setLang(id) }, name),
    ),
  );
  document.documentElement.lang = lang;
  document.title = `${t().title}: Swiss Passport`;
}
function setLang(id) {
  lang = id;
  saveLang(id);
  renderLangs();
  home();
}

// ---- Overview -------------------------------------------------------------------------

async function home() {
  let p;
  try {
    ({ data: p } = await call("get_progress"));
  } catch {
    return fail();
  }
  if (p.error) {
    // The stored code is unknown on the server: start fresh.
    code = null;
    return home();
  }
  const s = t();
  const exams = p.last_exams.map((e) => `${e.score}/${e.total}`).join(", ");
  show(...frame(
    h("div", { class: "intro" }, h("h1", {}, s.title), h("p", { class: "overview-lede" }, s.lede)),
    h("div", { class: "actions" },
      h("button", { class: "action primary", onclick: () => start("start_lesson"), disabled: !p.next_lesson },
        h("span", {}, p.next_lesson ? `${s.lesson} ${Number(p.next_lesson.id.slice(1))}: ${p.next_lesson.title}` : s.allDone),
        h("span", {}, p.next_lesson ? s.continueLesson : "")),
      h("button", { class: "action", onclick: () => start("start_reviews"), disabled: !p.reviews_due },
        h("span", {}, s.reviews), h("span", {}, p.reviews_due ? s.due(p.reviews_due) : s.noneDue)),
      h("button", { class: "action", onclick: () => start("start_mock_exam") },
        h("span", {}, s.exam), h("span", {}, s.examSub)),
    ),
    [h("section", { class: "stats" },
      h("table", { class: "facts" },
        h("tr", {}, h("td", {}, `${p.lessons_done}/${p.lessons_total}`), h("th", { scope: "row" }, s.lessonsDone)),
        exams && h("tr", {}, h("td", {}, String(p.last_exams.length)), h("th", { scope: "row" }, `${s.examsDone}: ${exams}`)),
      ),
      h("p", { class: "small readiness-title" }, s.ready),
      h("ul", { class: "readiness" },
        p.readiness_by_category.map((c) =>
          h("li", {}, h("span", {}, c.category), h("span", {}, `${c.percent}%`),
            h("span", { class: "meter", "aria-hidden": "true" }, h("i", { style: `width:${c.percent}%` })))),
      ),
    ),
    h("section", { class: "code" },
      h("p", {}, `${s.yourCode}: `, h("strong", {}, code)),
      h("p", { class: "small" }, s.codeHelp),
      h("form", { onsubmit: useCode },
        h("input", { name: "code", "aria-label": s.haveCode, placeholder: s.haveCode, autocomplete: "off", spellcheck: "false" }),
        h("button", { type: "submit" }, s.useCode)),
      h("p", { class: "error", "data-code-error": true, hidden: true }, s.unknownCode),
    )],
  ));
}

async function useCode(event) {
  event.preventDefault();
  const entered = new FormData(event.target).get("code").toString().trim();
  if (!entered) return;
  const { data } = await call("get_progress", { learner_code: entered }).catch(() => ({ data: { error: true } }));
  if (data.error) {
    document.querySelector("[data-code-error]").hidden = false;
    return;
  }
  home();
}

// ---- Quiz steps -----------------------------------------------------------------------

let kind = "lesson";

async function start(tool) {
  kind = { start_lesson: "lesson", start_reviews: "review", start_mock_exam: "exam" }[tool];
  try {
    const { data, images } = await call(tool);
    if (!data.question) return home();
    renderStep(data, images);
  } catch {
    fail();
  }
}

// Concept explanations seen in this session, so every question of a concept can offer it again.
const conceptCache = new Map();

/** The concept explanation, collapsed: learners try the question first and open it when they want. */
function conceptDetails(c, open = false) {
  return h("details", { class: "explain", open },
    h("summary", {}, t().showExplanation),
    h("div", { class: "explain-body" },
      c.intro.map((para) => h("p", {}, para)),
      h("dl", { class: "terms-list" }, c.key_terms.flatMap((k) => [h("dt", { lang: "de" }, k.term), h("dd", {}, k.definition)])),
      c.mnemonic && h("p", { class: "mnemonic" }, c.mnemonic)));
}

/**
 * One step, always in the same layout: the question with its options and the Next button on the right,
 * the explanation on the left (on phones: question first, explanation below).
 */
function renderStep(step, images, lessonTitle) {
  const s = t();
  const q = step.question;
  const title = step.lesson ? `${s.lesson} ${step.lesson.position.split("/")[0]}: ${step.lesson.title}` : lessonTitle ?? (kind === "exam" ? s.exam : s.reviews);
  if (step.explain_first) conceptCache.set(step.explain_first.title, step.explain_first);
  const concept = kind === "exam" ? undefined : conceptCache.get(step.concept);
  const hasPictures = Boolean(images.a);
  const choices = ["a", "b", "c", "d"].map((letter) =>
    h("button", { class: "choice", type: "button", "data-letter": letter, onclick: () => answer(letter, title) },
      h("b", {}, letter.toUpperCase()),
      images[letter] ? h("img", { src: images[letter], alt: `${letter.toUpperCase()}` }) : h("span", {}, q.options[letter])),
  );
  const heading = h("p", { class: "question", tabindex: "-1" }, q.question);
  show(
    ...frame(
      h("div", { class: "intro-step" },
        h("div", { class: "step-head" }, h("span", {}, title), h("span", {}, step.step), h("button", { type: "button", onclick: home }, s.overview)),
        h("div", { class: "bar" }, h("i", { style: `width:${progressPercent(step.step)}%` }))),
      [
        step.retry && h("p", { class: "retry" }, s.retry),
        heading,
        q.german && h("p", { class: "german", lang: "de" }, q.german.question),
        images.question && h("img", { class: "qpicture", src: images.question, alt: "" }),
        h("div", { class: `choices${hasPictures ? " pictures" : ""}`, "data-choices": true }, choices),
        h("div", { "data-after": true }),
        h("p", { class: "hint" }, s.keys)],
      [
        h("h2", { class: "info-title" }, kind === "exam" ? s.exam : step.concept),
        h("div", { "data-feedback": true }),
        kind === "exam" ? h("p", { class: "small" }, s.examNote)
          : concept ? conceptDetails(concept) : h("p", { class: "small", "data-answer-first": true }, s.answerFirst)],
    ),
  );
  heading.focus({ preventScroll: true });
}

const progressPercent = (step) => {
  const [n, total] = step.split("/").map(Number);
  return Math.round((100 * (n - 1)) / total);
};

let pendingNext = null;

async function answer(letter, title) {
  const buttons = [...document.querySelectorAll("[data-choices] button")];
  if (buttons[0]?.disabled) return;
  buttons.forEach((b) => (b.disabled = true));
  document.querySelector(`[data-letter="${letter}"]`).classList.add("chosen");
  let r;
  try {
    r = await call("answer", { answer: letter });
  } catch {
    return fail();
  }
  const { data, images } = r;
  if (data.error) return home();

  if (kind === "exam") {
    // No feedback in the mock exam: straight to the next question or the result.
    return data.next ? renderStep(data.next, images, title) : renderExamResult(data.finished);
  }

  const f = data.feedback;
  const s = t();
  buttons.forEach((b) => {
    b.classList.remove("chosen");
    if (b.dataset.letter === f.correct_answer) b.classList.add("is-right");
    else if (b.dataset.letter === letter) b.classList.add("is-wrong");
  });

  // Right: the verdict and the Next button, always in the same place.
  const next = h("button", { class: "next", type: "button", onclick: () => proceed() }, s.next);
  // h() drops empty parts; plain append() would print "false"/"undefined".
  document.querySelector("[data-after]").append(h("div", {},
    h("p", { class: `verdict-line${f.correct ? " ok" : ""}` },
      f.correct ? s.right : `${s.wrong} ${f.correct_answer.toUpperCase()}: ${f.correct_answer_text}`),
    f.correct_answer_german && !f.correct && h("p", { class: "german", lang: "de" }, f.correct_answer_german),
    f.comes_again_later_in_this_round && h("p", { class: "retry" }, s.comesAgain),
    next,
  ));
  document.querySelector(".hint")?.remove();

  // Left: why, why not the chosen option, notes and the source.
  document.querySelector("[data-feedback]").append(
    h("section", { class: "feedback" },
      h("p", {}, f.why),
      f.about_your_answer && h("p", {}, f.about_your_answer),
      f.note && h("p", { class: "note mnemonic" }, f.note),
      f.sources?.[0] && h("p", { class: "src" }, `${s.source}: `, h("a", { href: f.sources[0], target: "_blank", rel: "noopener" }, new URL(f.sources[0]).hostname.replace(/^www\./, "")))),
  );
  document.querySelector("[data-answer-first]")?.remove();

  pendingNext = () => (data.next ? renderStep(data.next, images, title) : renderSummary(data.finished));
  next.focus({ preventScroll: true });
}

function proceed() {
  const next = pendingNext;
  pendingNext = null;
  next?.();
}

function renderSummary(f) {
  const s = t();
  show(...frame(
    h("div", { class: "intro" }, h("h1", {}, f.lesson ? s.doneLesson : s.doneReview)),
    [
      h("p", { class: "score" }, `${f.correct_first_try}/${f.total}`),
      h("p", {}, s.firstTry),
      h("div", { class: "actions" },
        f.next_lesson && h("button", { class: "action primary", onclick: () => start("start_lesson") }, h("span", {}, s.nextLesson), h("span", {}, f.next_lesson)),
        f.reviews_due > 0 && h("button", { class: "action", onclick: () => start("start_reviews") }, h("span", {}, s.reviews), h("span", {}, s.due(f.reviews_due))),
        h("button", { class: "action", onclick: home }, h("span", {}, s.overview), h("span", {}))),
    ],
    [h("h2", { class: "info-title" }, s.whatNext), h("p", {}, s.whatNextText)],
  ));
}

function renderExamResult(r) {
  const s = t();
  show(...frame(
    h("div", { class: "intro" }, h("h1", {}, s.examResult)),
    [
      h("p", { class: "score" }, `${r.score}/${r.total}`),
      h("p", { class: "small" }, s.passMark),
      h("div", { class: "actions" }, h("button", { class: "action primary", onclick: home }, h("span", {}, s.overview), h("span", {}))),
    ],
    [
    r.mistakes.length > 0 && h("h2", { class: "info-title" }, s.mistakes),
    h("ol", { class: "mistakes" }, r.mistakes.map((m) =>
      h("li", {},
        h("p", { class: "q" }, m.question),
        h("p", { class: "w" }, `${s.yours}: ${m.your_answer.toUpperCase()}`),
        h("p", { class: "a" }, `${m.correct_answer.toUpperCase()}: ${m.correct_answer_text}`),
        h("p", { class: "w" }, m.why)))),
    ],
  ));
}

// Keyboard: A to D answer, Enter continues.
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
  const letter = e.key.toLowerCase();
  const btn = document.querySelector(`[data-choices] [data-letter="${letter}"]:not(:disabled)`);
  if (btn) { e.preventDefault(); btn.click(); return; }
  if (e.key === "Enter" && pendingNext && !e.target.closest("button")) { e.preventDefault(); proceed(); }
});

renderLangs();
home();
