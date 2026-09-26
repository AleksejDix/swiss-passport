// The about page: who is behind the site, where the content comes from, and how it is checked.
// Links: {repo} {issues} {license} {content_license} {sources} {guide}
export const ABOUT_LINKS = {
  repo: "https://github.com/AleksejDix/swiss-passport",
  issues: "https://github.com/AleksejDix/swiss-passport/issues",
  license: "https://github.com/AleksejDix/swiss-passport/blob/main/LICENSE",
  content_license: "https://github.com/AleksejDix/swiss-passport/blob/main/LICENSE-CONTENT.md",
  sources: "https://github.com/AleksejDix/swiss-passport/blob/main/sources/README.md",
};

export const ABOUT = {
  de: {
    nav: "Über das Projekt",
    title: "Über Swiss Passport",
    desc: "Wer hinter Swiss Passport steht, woher die Fragen und Erklärungen kommen und wie sie geprüft werden.",
    sections: [
      ["Wer", ['Swiss Passport ist ein kostenloses, nicht kommerzielles Projekt von Aleksej Dix. Code und Inhalte sind offen auf <a href="{repo}">GitHub</a>.']],
      ["Woher die Inhalte kommen", [
        "Die 350 Fragen und die richtigen Antworten stammen aus der offiziellen Fragenliste des Kantons Zürich (Gemeindeamt, Abteilung Einbürgerungen, Stand Mai 2025).",
        'Erklärungen, Themen und Übersetzungen wurden für dieses Projekt geschrieben und mit offiziellen Quellen geprüft: den Lernbroschüren von Kanton und Stadt Zürich, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch und ch.ch. Jede Frage und jedes Thema nennt seine Quellen. <a href="{sources}">Liste aller Quellen</a>.',
      ]],
      ["Stand", ['Fragenliste: Mai 2025. Angaben zum Test auf der Seite <a href="{guide}">Zum Test</a>: geprüft am 25. September 2026.']],
      ["Kein offizielles Angebot", ["Swiss Passport ist kein Angebot des Kantons Zürich oder einer Gemeinde. Massgebend sind die Angaben von Kanton und Gemeinde."]],
      ["Fehler gefunden?", ['Bitte melde ihn auf <a href="{issues}">GitHub</a>. Jede Korrektur hilft allen, die für den Test lernen.']],
      ["Datenschutz", ["Kein Konto, keine Cookies. Der Lernfortschritt wird unter einem Lerncode gespeichert, ohne Namen oder E-Mail. Die Website zählt Seitenaufrufe anonym (Vercel Web Analytics, ohne Cookies)."]],
      ["Lizenz", ['Code: <a href="{license}">PolyForm Noncommercial</a>. Erklärungen und Übersetzungen: <a href="{content_license}">CC BY-NC-SA 4.0</a>. Frei für private und gemeinnützige Nutzung.']],
    ],
  },
  en: {
    nav: "About",
    title: "About Swiss Passport",
    desc: "Who is behind Swiss Passport, where the questions and explanations come from and how they are checked.",
    sections: [
      ["Who", ['Swiss Passport is a free, non-commercial project by Aleksej Dix. The code and the content are open on <a href="{repo}">GitHub</a>.']],
      ["Where the content comes from", [
        "The 350 questions and their correct answers come from the official question list of the Canton of Zurich (Gemeindeamt, Abteilung Einbürgerungen, May 2025).",
        'The explanations, topics and translations were written for this project and checked against official sources: the learning brochures of the Canton and the City of Zurich, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch and ch.ch. Every question and topic names its sources. <a href="{sources}">List of all sources</a>.',
      ]],
      ["Last checked", ['Question list: May 2025. Facts on the <a href="{guide}">About the test</a> page: checked on 25 September 2026.']],
      ["Not an official service", ["Swiss Passport is not a service of the Canton of Zurich or of any municipality. The information from the canton and your municipality is binding."]],
      ["Found a mistake?", ['Please report it on <a href="{issues}">GitHub</a>. Every correction helps everyone who is learning for the test.']],
      ["Privacy", ["No account, no cookies. Learning progress is saved under a learner code, without name or email. The website counts page views anonymously (Vercel Web Analytics, without cookies)."]],
      ["License", ['Code: <a href="{license}">PolyForm Noncommercial</a>. Explanations and translations: <a href="{content_license}">CC BY-NC-SA 4.0</a>. Free for personal and non-profit use.']],
    ],
  },
  fr: {
    nav: "À propos",
    title: "À propos de Swiss Passport",
    desc: "Qui est derrière Swiss Passport, d'où viennent les questions et les explications et comment elles sont vérifiées.",
    sections: [
      ["Qui", ['Swiss Passport est un projet gratuit et non commercial d\'Aleksej Dix. Le code et le contenu sont ouverts sur <a href="{repo}">GitHub</a>.']],
      ["D'où vient le contenu", [
        "Les 350 questions et leurs bonnes réponses viennent de la liste officielle du canton de Zurich (Gemeindeamt, Abteilung Einbürgerungen, mai 2025).",
        'Les explications, les thèmes et les traductions ont été écrits pour ce projet et vérifiés avec des sources officielles : les brochures du canton et de la ville de Zurich, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch et ch.ch. Chaque question et chaque thème indique ses sources. <a href="{sources}">Liste de toutes les sources</a>.',
      ]],
      ["Mise à jour", ['Liste des questions : mai 2025. Informations de la page <a href="{guide}">Le test</a> : vérifiées le 25 septembre 2026.']],
      ["Pas un service officiel", ["Swiss Passport n'est pas un service du canton de Zurich ni d'une commune. Seules les informations du canton et de ta commune font foi."]],
      ["Tu as trouvé une erreur ?", ['Signale-la sur <a href="{issues}">GitHub</a>. Chaque correction aide tous ceux qui apprennent pour le test.']],
      ["Protection des données", ["Pas de compte, pas de cookies. La progression est enregistrée sous un code d'apprentissage, sans nom ni e-mail. Le site compte les pages vues de façon anonyme (Vercel Web Analytics, sans cookies)."]],
      ["Licence", ['Code : <a href="{license}">PolyForm Noncommercial</a>. Explications et traductions : <a href="{content_license}">CC BY-NC-SA 4.0</a>. Libre pour un usage personnel et non lucratif.']],
    ],
  },
  it: {
    nav: "Chi siamo",
    title: "Informazioni su Swiss Passport",
    desc: "Chi c'è dietro Swiss Passport, da dove vengono le domande e le spiegazioni e come vengono verificate.",
    sections: [
      ["Chi", ['Swiss Passport è un progetto gratuito e non commerciale di Aleksej Dix. Il codice e i contenuti sono aperti su <a href="{repo}">GitHub</a>.']],
      ["Da dove vengono i contenuti", [
        "Le 350 domande e le risposte corrette provengono dalla lista ufficiale del Cantone di Zurigo (Gemeindeamt, Abteilung Einbürgerungen, maggio 2025).",
        'Le spiegazioni, i temi e le traduzioni sono stati scritti per questo progetto e verificati con fonti ufficiali: gli opuscoli del Cantone e della Città di Zurigo, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch e ch.ch. Ogni domanda e ogni tema indica le sue fonti. <a href="{sources}">Elenco di tutte le fonti</a>.',
      ]],
      ["Aggiornamento", ['Lista delle domande: maggio 2025. Informazioni della pagina <a href="{guide}">Il test</a>: verificate il 25 settembre 2026.']],
      ["Non è un servizio ufficiale", ["Swiss Passport non è un servizio del Cantone di Zurigo né di un comune. Fanno fede le informazioni del Cantone e del tuo comune."]],
      ["Hai trovato un errore?", ['Segnalalo su <a href="{issues}">GitHub</a>. Ogni correzione aiuta tutti quelli che studiano per il test.']],
      ["Protezione dei dati", ["Nessun account, nessun cookie. I progressi sono salvati con un codice di apprendimento, senza nome né e-mail. Il sito conta le visite in forma anonima (Vercel Web Analytics, senza cookie)."]],
      ["Licenza", ['Codice: <a href="{license}">PolyForm Noncommercial</a>. Spiegazioni e traduzioni: <a href="{content_license}">CC BY-NC-SA 4.0</a>. Libero per uso personale e senza scopo di lucro.']],
    ],
  },
  ru: {
    nav: "О проекте",
    title: "О проекте Swiss Passport",
    desc: "Кто стоит за Swiss Passport, откуда вопросы и объяснения и как они проверяются.",
    sections: [
      ["Кто", ['Swiss Passport — бесплатный некоммерческий проект, его автор Aleksej Dix. Код и материалы открыты на <a href="{repo}">GitHub</a>.']],
      ["Откуда материалы", [
        "350 вопросов и правильные ответы взяты из официального списка кантона Цюрих (Gemeindeamt, Abteilung Einbürgerungen, май 2025).",
        'Объяснения, темы и переводы написаны для этого проекта и проверены по официальным источникам: учебным брошюрам кантона и города Цюрих, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch и ch.ch. У каждого вопроса и каждой темы указаны источники. <a href="{sources}">Список всех источников</a>.',
      ]],
      ["Актуальность", ['Список вопросов: май 2025. Сведения на странице <a href="{guide}">О тесте</a>: проверены 25 сентября 2026.']],
      ["Не официальный сервис", ["Swiss Passport не является сервисом кантона Цюрих или общины. Обязательны сведения кантона и твоей общины."]],
      ["Есть ошибка?", ['Сообщи о ней на <a href="{issues}">GitHub</a>. Каждое исправление помогает всем, кто готовится к тесту.']],
      ["Данные", ["Без аккаунта и без cookies. Прогресс сохраняется под кодом учащегося, без имени и e-mail. Сайт анонимно считает просмотры страниц (Vercel Web Analytics, без cookies)."]],
      ["Лицензия", ['Код: <a href="{license}">PolyForm Noncommercial</a>. Объяснения и переводы: <a href="{content_license}">CC BY-NC-SA 4.0</a>. Бесплатно для личного и некоммерческого использования.']],
    ],
  },
  uk: {
    nav: "Про проєкт",
    title: "Про проєкт Swiss Passport",
    desc: "Хто стоїть за Swiss Passport, звідки запитання й пояснення та як їх перевіряють.",
    sections: [
      ["Хто", ['Swiss Passport — безкоштовний некомерційний проєкт, його автор Aleksej Dix. Код і матеріали відкриті на <a href="{repo}">GitHub</a>.']],
      ["Звідки матеріали", [
        "350 запитань і правильні відповіді взято з офіційного списку кантону Цюрих (Gemeindeamt, Abteilung Einbürgerungen, травень 2025).",
        'Пояснення, теми й переклади написано для цього проєкту й перевірено за офіційними джерелами: навчальними брошурами кантону й міста Цюрих, zh.ch, stadt-zuerich.ch, admin.ch, fedlex.admin.ch і ch.ch. У кожного запитання й кожної теми вказано джерела. <a href="{sources}">Список усіх джерел</a>.',
      ]],
      ["Актуальність", ['Список запитань: травень 2025. Відомості на сторінці <a href="{guide}">Про тест</a>: перевірено 25 вересня 2026.']],
      ["Не офіційний сервіс", ["Swiss Passport не є сервісом кантону Цюрих чи громади. Обов'язковими є відомості кантону й твоєї громади."]],
      ["Є помилка?", ['Повідом про неї на <a href="{issues}">GitHub</a>. Кожне виправлення допомагає всім, хто готується до тесту.']],
      ["Дані", ["Без акаунта й без cookies. Прогрес зберігається під кодом учня, без імені та e-mail. Сайт анонімно рахує перегляди сторінок (Vercel Web Analytics, без cookies)."]],
      ["Ліцензія", ['Код: <a href="{license}">PolyForm Noncommercial</a>. Пояснення й переклади: <a href="{content_license}">CC BY-NC-SA 4.0</a>. Безкоштовно для особистого й некомерційного використання.']],
    ],
  },
};
