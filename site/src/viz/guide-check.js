// Test guide visuals (issue #10). The four questions follow the canton's self-check on zh.ch (see sources/),
// in the same wording as the exemption list in guide.js. The order of test and application depends on the
// municipality (zh.ch); the City of Zurich tests only after the application (stadt-zuerich.ch).
export const CHECK_TEXT = {
  de: {
    caption: "Schnell-Check in 4 Fragen",
    qs: ["Bist du jünger als 12 Jahre?", "Besuchst du zurzeit die obligatorische Schule oder eine Ausbildung auf Sekundarstufe II (Lehre, Gymnasium) in der Schweiz?", "Hast du 5 Jahre die obligatorische Schule in der Schweiz besucht, davon mindestens 3 Jahre auf Sekundarstufe I?", "Hast du eine Ausbildung auf Sekundarstufe II in der Schweiz abgeschlossen?"],
    yes: "Ja", no: "Nein", noTest: "kein Test nötig", test: "Test nötig", allNo: "Viermal Nein:",
    resultNo: "Du musst den Test voraussichtlich nicht machen.", resultYes: "Du musst den Test voraussichtlich machen.", again: "Nochmals",
    note: "Unverbindlich. Verbindlich sind der Self-Check des Kantons und die Auskunft deiner Gemeinde.", link: "Self-Check des Kantons",
  },
  en: {
    caption: "Quick check in 4 questions",
    qs: ["Are you younger than 12?", "Do you currently attend compulsory school or upper secondary education (apprenticeship, Gymnasium) in Switzerland?", "Did you attend compulsory school in Switzerland for 5 years, at least 3 of them at lower secondary level?", "Have you completed upper secondary education in Switzerland?"],
    yes: "Yes", no: "No", noTest: "no test needed", test: "test needed", allNo: "Four times no:",
    resultNo: "You probably do not have to take the test.", resultYes: "You probably have to take the test.", again: "Start again",
    note: "Not binding. The canton's self-check and your municipality are binding.", link: "The canton's self-check",
  },
  fr: {
    caption: "Vérification rapide en 4 questions",
    qs: ["As-tu moins de 12 ans ?", "Fréquentes-tu actuellement l'école obligatoire ou une formation du secondaire II (apprentissage, gymnase) en Suisse ?", "As-tu fréquenté l'école obligatoire en Suisse pendant 5 ans, dont au moins 3 ans au secondaire I ?", "As-tu terminé une formation du secondaire II en Suisse ?"],
    yes: "Oui", no: "Non", noTest: "pas de test", test: "test nécessaire", allNo: "Quatre fois non :",
    resultNo: "Tu n'as probablement pas besoin de passer le test.", resultYes: "Tu dois probablement passer le test.", again: "Recommencer",
    note: "Sans engagement. Seuls le self-check du canton et ta commune font foi.", link: "Self-check du canton",
  },
  it: {
    caption: "Verifica rapida in 4 domande",
    qs: ["Hai meno di 12 anni?", "Frequenti attualmente la scuola dell'obbligo o una formazione di livello secondario II (apprendistato, liceo) in Svizzera?", "Hai frequentato la scuola dell'obbligo in Svizzera per 5 anni, di cui almeno 3 al livello secondario I?", "Hai concluso una formazione di livello secondario II in Svizzera?"],
    yes: "Sì", no: "No", noTest: "nessun test", test: "test necessario", allNo: "Quattro volte no:",
    resultNo: "Probabilmente non devi fare il test.", resultYes: "Probabilmente devi fare il test.", again: "Ricomincia",
    note: "Non vincolante. Fanno fede il self-check del Cantone e il tuo comune.", link: "Self-check del Cantone",
  },
  ru: {
    caption: "Быстрая проверка: 4 вопроса",
    qs: ["Тебе меньше 12 лет?", "Ты сейчас учишься в обязательной школе или на уровне Sekundarstufe II (профобучение, гимназия) в Швейцарии?", "Ты 5 лет посещал(а) обязательную школу в Швейцарии, из них не менее 3 лет на уровне Sekundarstufe I?", "Ты закончил(а) обучение на уровне Sekundarstufe II в Швейцарии?"],
    yes: "Да", no: "Нет", noTest: "тест не нужен", test: "тест нужен", allNo: "Четыре раза «нет»:",
    resultNo: "Скорее всего, тебе не нужно сдавать тест.", resultYes: "Скорее всего, тебе нужно сдавать тест.", again: "Сначала",
    note: "Не является обязательным. Обязательны self-check кантона и сведения твоей общины.", link: "Self-check кантона",
  },
  uk: {
    caption: "Швидка перевірка: 4 запитання",
    qs: ["Тобі менше 12 років?", "Ти зараз навчаєшся в обов'язковій школі або на рівні Sekundarstufe II (профнавчання, гімназія) у Швейцарії?", "Ти 5 років відвідував(-ла) обов'язкову школу у Швейцарії, з них щонайменше 3 роки на рівні Sekundarstufe I?", "Ти закінчив(-ла) навчання на рівні Sekundarstufe II у Швейцарії?"],
    yes: "Так", no: "Ні", noTest: "тест не потрібен", test: "тест потрібен", allNo: "Чотири рази «ні»:",
    resultNo: "Найімовірніше, тобі не треба складати тест.", resultYes: "Найімовірніше, тобі треба складати тест.", again: "Спочатку",
    note: "Не є обов'язковим. Обов'язковими є self-check кантону й відомості твоєї громади.", link: "Self-check кантону",
  },
};

export const ORDER_TEXT = {
  de: { caption: "Test und Gesuch: zwei Reihenfolgen", before: "Test vor dem Gesuch", after: "Test nach dem Gesuch (zum Beispiel Stadt Zürich)",
    when: "Gemeinde sagt, wann und wo", test: "Test", apply: "Gesuch einreichen", note: "Welche Reihenfolge gilt, sagt dir deine Gemeinde." },
  en: { caption: "Test and application: two orders", before: "Test before the application", after: "Test after the application (for example the City of Zurich)",
    when: "Your municipality says when and where", test: "Test", apply: "Submit the application", note: "Your municipality tells you which order applies." },
  fr: { caption: "Test et demande : deux ordres possibles", before: "Test avant la demande", after: "Test après la demande (par exemple la ville de Zurich)",
    when: "Ta commune dit quand et où", test: "Test", apply: "Déposer la demande", note: "Ta commune te dit quel ordre s'applique." },
  it: { caption: "Test e domanda: due sequenze", before: "Test prima della domanda", after: "Test dopo la domanda (per esempio la Città di Zurigo)",
    when: "Il comune dice quando e dove", test: "Test", apply: "Inoltrare la domanda", note: "Il tuo comune ti dice quale sequenza vale." },
  ru: { caption: "Тест и заявление: два порядка", before: "Тест до подачи заявления", after: "Тест после подачи заявления (например, город Цюрих)",
    when: "Община сообщает, когда и где", test: "Тест", apply: "Подать заявление", note: "Какой порядок действует, сообщит твоя община." },
  uk: { caption: "Тест і заява: два порядки", before: "Тест до подання заяви", after: "Тест після подання заяви (наприклад, місто Цюрих)",
    when: "Громада повідомляє, коли і де", test: "Тест", apply: "Подати заяву", note: "Який порядок діє, повідомить твоя громада." },
};
