// The test guide: what the canton and the City of Zurich officially say about the Grundkenntnistest.
// Only facts from the official pages in sources/ (see sources/exam_rules.md). Nothing guessed.
// Links: {zh} canton page, {pdf} question list, {city} City of Zurich page, {kbuev} ordinance,
// {questions} {learn} are pages of this site.
export const LINKS = {
  zh: "https://www.zh.ch/de/migration-integration/einbuergerung/grundkenntnistest.html",
  pdf: "https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/migration-integration/einbuergerung/gkt/grundkenntnistest_kanton_zuerich.pdf",
  city: "https://www.stadt-zuerich.ch/de/lebenslagen/einwohner-services/einbuergerung/grundkenntnisse.html",
  kbuev: "https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-141_11-72-435.html",
};

const CONTACT = 'grundkenntnistest@ji.zh.ch, +41 43 259 83 81';

export const GUIDE = {
  de: {
    nav: "Zum Test",
    title: "Grundkenntnistest Zürich: so funktioniert der Einbürgerungstest",
    desc: "Wer den Grundkenntnistest im Kanton Zürich machen muss, welche Fragen kommen, wo er stattfindet und was er kostet. Nur Angaben aus offiziellen Quellen.",
    lede: "Was der Kanton und die Stadt Zürich offiziell zum Test sagen, mit Quellen.",
    faq: [
      { q: "Was ist der Grundkenntnistest?", a: [
        "Für eine ordentliche Einbürgerung im Kanton Zürich braucht es Kenntnisse über die Schweiz, den Kanton Zürich und das Zürcher Gemeindewesen. Diese weist du in einem Test nach. Im Test gibt es Fragen über Geographie, Politik und Geschichte.",
        'Rechtsgrundlage ist § 16 der <a href="{kbuev}">Kantonalen Bürgerrechtsverordnung (KBüV)</a>: Die Gemeinde prüft die Grundkenntnisse in einem Einbürgerungsgespräch mit einem standardisierten Fragebogen oder durch einen Test.',
      ] },
      { q: "Muss ich den Test machen?", a: [
        "Du musst keinen Test machen, wenn einer dieser Punkte zutrifft:",
        "<ul><li>Du bist jünger als 12 Jahre.</li><li>Du besuchst aktuell die obligatorische Schule oder eine Ausbildung auf Sekundarstufe II (Lehre, Gymnasium) in der Schweiz.</li><li>Du hast 5 Jahre die obligatorische Schule in der Schweiz besucht, davon mindestens 3 Jahre auf Sekundarstufe I.</li><li>Du hast eine Ausbildung auf Sekundarstufe II in der Schweiz abgeschlossen.</li></ul>",
        'Der <a href="{zh}">Self-Check des Kantons</a> zeigt es dir für deine Situation. In der Stadt Zürich werden bei der erleichterten Einbürgerung die Grundkenntnisse im Einbürgerungsgespräch geprüft.',
      ] },
      { q: "Welche Fragen kommen im Test?", a: [
        'Der Kanton veröffentlicht die <a href="{pdf}">Liste mit allen 350 Fragen</a> (PDF, Deutsch, Stand Mai 2025). Jede Frage hat 4 Antworten, genau eine ist richtig.',
        "Der offizielle Übungstest des Kantons stellt 50 Fragen und zeigt nach jeder Antwort, ob sie richtig war. Ob der echte Test gleich aufgebaut ist, ist nicht offiziell bestätigt.",
      ] },
      { q: "Wo und wann findet der Test statt?", a: [
        "Die Gemeinde sagt dir, wann und wo du den Test machen kannst. Für die Anmeldung fragst du deine Gemeinde. Je nach Gemeinde machst du den Test vor oder nach dem Einreichen des Gesuchs.",
        'In der <a href="{city}">Stadt Zürich</a> findet der Test im Stadthaus statt, erst nachdem du das Gesuch eingereicht hast.',
      ] },
      { q: "Was kostet der Test?", a: [
        "Die Gebühren unterscheiden sich je nach Gemeinde und Testanbieter. Frag bei deiner Gemeinde nach. In der Stadt Zürich ist der Test kostenlos.",
      ] },
      { q: "Wie viele Punkte braucht es zum Bestehen? Wie lange dauert der Test?", a: [
        `Beides ist nicht offiziell veröffentlicht, deshalb nennen wir hier keine Zahlen. Auskunft gibt das Gemeindeamt des Kantons: ${CONTACT} (Mo bis Do 13:30 bis 17:00, Fr 13:30 bis 16:00).`,
      ] },
      { q: "Wie bereite ich mich vor?", a: [
        'Der Kanton bietet den <a href="{zh}">Übungstest</a>, die Einbürgerungsbroschüre und die Liste aller Fragen an.',
        'Hier findest du <a href="{questions}">alle 350 Fragen mit Antwort und Erklärung</a>, nach Thema geordnet, in sechs Sprachen und immer mit dem deutschen Wortlaut. Mit <a href="{learn}">Online lernen</a> übst du in kurzen Lektionen mit Wiederholungen und Probeprüfungen.',
        'Warum diese Art zu lernen wirkt, erklärt <a href="{method}">die Seite zur Methode</a>.',
      ] },
    ],
    sources: "Quellen",
    disclaimer: "Kein offizielles Angebot. Massgebend sind die Angaben von Kanton und Gemeinde.",
  },
  en: {
    nav: "About the test",
    title: "Grundkenntnistest Zurich: how the citizenship test works",
    desc: "Who has to take the Zurich naturalisation knowledge test, which questions come up, where it takes place and what it costs. Official sources only.",
    lede: "What the Canton and the City of Zurich officially say about the test, with sources.",
    faq: [
      { q: "What is the Grundkenntnistest?", a: [
        "For ordinary naturalisation in the Canton of Zurich you need knowledge of Switzerland, the Canton of Zurich and the municipalities of Zurich. You prove it in a test with questions about geography, politics and history.",
        'The legal basis is § 16 of the <a href="{kbuev}">cantonal citizenship ordinance (KBüV)</a>: the municipality checks basic knowledge either in a naturalisation interview with a standardised questionnaire or with a test.',
      ] },
      { q: "Do I have to take the test?", a: [
        "You do not have to take the test if one of these applies:",
        "<ul><li>You are younger than 12.</li><li>You currently attend compulsory school or upper secondary education (apprenticeship, Gymnasium) in Switzerland.</li><li>You attended compulsory school in Switzerland for 5 years, at least 3 of them at lower secondary level.</li><li>You completed upper secondary education in Switzerland.</li></ul>",
        'The <a href="{zh}">canton\'s self-check</a> tells you for your situation. In the City of Zurich, people in the facilitated naturalisation procedure have their knowledge checked in the naturalisation interview.',
      ] },
      { q: "Which questions come up?", a: [
        'The canton publishes the <a href="{pdf}">list of all 350 questions</a> (PDF, German, May 2025). Each question has 4 answers, exactly one is correct.',
        "The canton's official practice test asks 50 questions and shows after each answer whether it was correct. Whether the real test has the same format is not officially confirmed.",
      ] },
      { q: "Where and when is the test?", a: [
        "Your municipality tells you when and where you can take the test. Ask your municipality to register. Depending on the municipality, you take the test before or after you submit your application.",
        'In the <a href="{city}">City of Zurich</a> the test takes place in the Stadthaus, only after you have submitted your application.',
      ] },
      { q: "How much does the test cost?", a: [
        "Fees differ by municipality and test provider. Ask your municipality. In the City of Zurich the test is free.",
      ] },
      { q: "What is the pass mark? How long does the test take?", a: [
        `Neither is officially published, so we do not give numbers here. The canton's Gemeindeamt answers questions: ${CONTACT} (Mon to Thu 13:30 to 17:00, Fri 13:30 to 16:00).`,
      ] },
      { q: "How do I prepare?", a: [
        'The canton offers the <a href="{zh}">practice test</a>, the naturalisation brochure and the list of all questions.',
        'Here you find <a href="{questions}">all 350 questions with answers and explanations</a>, sorted by topic, in six languages and always with the German wording. With <a href="{learn}">Learn online</a> you practise in short lessons with reviews and mock exams.',
        'Why this way of learning works is explained on <a href="{method}">the method page</a>.',
      ] },
    ],
    sources: "Sources",
    disclaimer: "Not an official service. The information from the canton and your municipality is binding.",
  },
  fr: {
    nav: "Le test",
    title: "Grundkenntnistest Zurich : comment se passe le test de naturalisation",
    desc: "Qui doit passer le test de connaissances du canton de Zurich, quelles questions sont posées, où il a lieu et combien il coûte. Uniquement des sources officielles.",
    lede: "Ce que le canton et la ville de Zurich disent officiellement du test, avec les sources.",
    faq: [
      { q: "Qu'est-ce que le Grundkenntnistest ?", a: [
        "Pour une naturalisation ordinaire dans le canton de Zurich, il faut connaître la Suisse, le canton de Zurich et les communes zurichoises. Tu le prouves dans un test avec des questions de géographie, de politique et d'histoire.",
        'La base légale est le § 16 de l\'<a href="{kbuev}">ordonnance cantonale sur le droit de cité (KBüV)</a> : la commune vérifie les connaissances lors d\'un entretien de naturalisation avec un questionnaire standardisé ou par un test.',
      ] },
      { q: "Dois-je passer le test ?", a: [
        "Tu n'as pas besoin de passer le test si l'un de ces points s'applique :",
        "<ul><li>Tu as moins de 12 ans.</li><li>Tu fréquentes actuellement l'école obligatoire ou une formation du secondaire II (apprentissage, gymnase) en Suisse.</li><li>Tu as fréquenté l'école obligatoire en Suisse pendant 5 ans, dont au moins 3 ans au secondaire I.</li><li>Tu as terminé une formation du secondaire II en Suisse.</li></ul>",
        'Le <a href="{zh}">self-check du canton</a> te le dit pour ta situation. En ville de Zurich, les connaissances des personnes en naturalisation facilitée sont vérifiées lors de l\'entretien de naturalisation.',
      ] },
      { q: "Quelles questions sont posées ?", a: [
        'Le canton publie la <a href="{pdf}">liste des 350 questions</a> (PDF, allemand, mai 2025). Chaque question a 4 réponses, une seule est correcte.',
        "Le test d'entraînement officiel du canton pose 50 questions et indique après chaque réponse si elle était juste. Il n'est pas confirmé officiellement que le vrai test a le même format.",
      ] },
      { q: "Où et quand a lieu le test ?", a: [
        "Ta commune te dit quand et où tu peux passer le test. Pour t'inscrire, demande à ta commune. Selon la commune, tu passes le test avant ou après le dépôt de ta demande.",
        'En <a href="{city}">ville de Zurich</a>, le test a lieu au Stadthaus, seulement après le dépôt de la demande.',
      ] },
      { q: "Combien coûte le test ?", a: [
        "Les frais varient selon la commune et le prestataire du test. Renseigne-toi auprès de ta commune. En ville de Zurich, le test est gratuit.",
      ] },
      { q: "Combien de points faut-il pour réussir ? Combien de temps dure le test ?", a: [
        `Ni l'un ni l'autre n'est publié officiellement, c'est pourquoi nous ne donnons pas de chiffres ici. Le Gemeindeamt du canton répond aux questions : ${CONTACT} (lun. à jeu. 13h30 à 17h00, ven. 13h30 à 16h00).`,
      ] },
      { q: "Comment me préparer ?", a: [
        'Le canton propose le <a href="{zh}">test d\'entraînement</a>, la brochure de naturalisation et la liste de toutes les questions.',
        'Ici, tu trouves <a href="{questions}">les 350 questions avec réponse et explication</a>, classées par thème, en six langues et toujours avec le texte allemand. Avec <a href="{learn}">Apprendre en ligne</a>, tu t\'entraînes en courtes leçons avec répétitions et examens blancs.',
        'Pourquoi cette façon d\'apprendre fonctionne : voir <a href="{method}">la page sur la méthode</a>.',
      ] },
    ],
    sources: "Sources",
    disclaimer: "Pas un service officiel. Seules les informations du canton et de ta commune font foi.",
  },
  it: {
    nav: "Il test",
    title: "Grundkenntnistest Zurigo: come funziona il test di naturalizzazione",
    desc: "Chi deve fare il test di conoscenze del Cantone di Zurigo, quali domande ci sono, dove si svolge e quanto costa. Solo fonti ufficiali.",
    lede: "Ciò che il Cantone e la Città di Zurigo dicono ufficialmente sul test, con le fonti.",
    faq: [
      { q: "Che cos'è il Grundkenntnistest?", a: [
        "Per la naturalizzazione ordinaria nel Cantone di Zurigo servono conoscenze sulla Svizzera, sul Cantone di Zurigo e sui comuni zurighesi. Le dimostri in un test con domande di geografia, politica e storia.",
        'La base legale è il § 16 dell\'<a href="{kbuev}">ordinanza cantonale sulla cittadinanza (KBüV)</a>: il comune verifica le conoscenze in un colloquio di naturalizzazione con un questionario standardizzato oppure con un test.',
      ] },
      { q: "Devo fare il test?", a: [
        "Non devi fare il test se vale uno di questi punti:",
        "<ul><li>Hai meno di 12 anni.</li><li>Frequenti attualmente la scuola dell'obbligo o una formazione di livello secondario II (apprendistato, liceo) in Svizzera.</li><li>Hai frequentato la scuola dell'obbligo in Svizzera per 5 anni, di cui almeno 3 al livello secondario I.</li><li>Hai concluso una formazione di livello secondario II in Svizzera.</li></ul>",
        'Il <a href="{zh}">self-check del Cantone</a> te lo dice per la tua situazione. Nella Città di Zurigo, per chi è nella procedura di naturalizzazione agevolata le conoscenze vengono verificate nel colloquio di naturalizzazione.',
      ] },
      { q: "Quali domande ci sono?", a: [
        'Il Cantone pubblica la <a href="{pdf}">lista di tutte le 350 domande</a> (PDF, tedesco, maggio 2025). Ogni domanda ha 4 risposte, una sola è corretta.',
        "Il test di esercitazione ufficiale del Cantone pone 50 domande e dopo ogni risposta mostra se era giusta. Non è confermato ufficialmente che il vero test abbia lo stesso formato.",
      ] },
      { q: "Dove e quando si svolge il test?", a: [
        "Il tuo comune ti dice quando e dove puoi fare il test. Per iscriverti chiedi al tuo comune. A seconda del comune, fai il test prima o dopo aver inoltrato la domanda.",
        'Nella <a href="{city}">Città di Zurigo</a> il test si svolge allo Stadthaus, solo dopo aver inoltrato la domanda.',
      ] },
      { q: "Quanto costa il test?", a: [
        "Le tasse variano secondo il comune e l'ente che organizza il test. Informati presso il tuo comune. Nella Città di Zurigo il test è gratuito.",
      ] },
      { q: "Quanti punti servono per superarlo? Quanto dura il test?", a: [
        `Nessuno dei due dati è pubblicato ufficialmente, perciò qui non diamo numeri. Il Gemeindeamt del Cantone risponde alle domande: ${CONTACT} (lun-gio 13:30-17:00, ven 13:30-16:00).`,
      ] },
      { q: "Come mi preparo?", a: [
        'Il Cantone offre il <a href="{zh}">test di esercitazione</a>, l\'opuscolo sulla naturalizzazione e la lista di tutte le domande.',
        'Qui trovi <a href="{questions}">tutte le 350 domande con risposta e spiegazione</a>, ordinate per tema, in sei lingue e sempre con il testo tedesco. Con <a href="{learn}">Impara online</a> ti eserciti in brevi lezioni con ripetizioni ed esami di prova.',
        'Perché questo modo di studiare funziona lo spiega <a href="{method}">la pagina sul metodo</a>.',
      ] },
    ],
    sources: "Fonti",
    disclaimer: "Non è un servizio ufficiale. Fanno fede le informazioni del Cantone e del tuo comune.",
  },
  ru: {
    nav: "О тесте",
    title: "Grundkenntnistest Цюрих: как проходит тест на гражданство",
    desc: "Кто должен сдавать тест на знания в кантоне Цюрих, какие вопросы бывают, где он проходит и сколько стоит. Только официальные источники.",
    lede: "Что кантон и город Цюрих официально говорят о тесте, с источниками.",
    faq: [
      { q: "Что такое Grundkenntnistest?", a: [
        "Для обычной натурализации в кантоне Цюрих нужны знания о Швейцарии, кантоне Цюрих и общинах Цюриха. Их подтверждают на тесте с вопросами по географии, политике и истории.",
        'Правовая основа: § 16 <a href="{kbuev}">кантонального постановления о гражданстве (KBüV)</a>. Община проверяет знания на собеседовании по натурализации со стандартной анкетой или с помощью теста.',
      ] },
      { q: "Нужно ли мне сдавать тест?", a: [
        "Тест не нужен, если верно одно из следующего:",
        "<ul><li>Тебе меньше 12 лет.</li><li>Ты сейчас учишься в обязательной школе или на уровне Sekundarstufe II (профобучение, гимназия) в Швейцарии.</li><li>Ты 5 лет посещал(а) обязательную школу в Швейцарии, из них не менее 3 лет на уровне Sekundarstufe I.</li><li>Ты закончил(а) обучение на уровне Sekundarstufe II в Швейцарии.</li></ul>",
        '<a href="{zh}">Self-check кантона</a> покажет это для твоей ситуации. В городе Цюрих при упрощённой натурализации знания проверяют на собеседовании.',
      ] },
      { q: "Какие вопросы бывают на тесте?", a: [
        'Кантон публикует <a href="{pdf}">список всех 350 вопросов</a> (PDF, на немецком, май 2025). У каждого вопроса 4 ответа, правильный ровно один.',
        "Официальный тренировочный тест кантона задаёт 50 вопросов и после каждого ответа показывает, был ли он правильным. Официально не подтверждено, что настоящий тест устроен так же.",
      ] },
      { q: "Где и когда проходит тест?", a: [
        "Община сообщает, когда и где можно сдать тест. Для записи обратись в свою общину. В зависимости от общины тест сдают до или после подачи заявления.",
        'В <a href="{city}">городе Цюрих</a> тест проходит в Stadthaus, только после подачи заявления.',
      ] },
      { q: "Сколько стоит тест?", a: [
        "Стоимость зависит от общины и организатора теста. Узнай в своей общине. В городе Цюрих тест бесплатный.",
      ] },
      { q: "Сколько баллов нужно, чтобы сдать? Сколько длится тест?", a: [
        `Ни то, ни другое официально не опубликовано, поэтому мы не называем здесь цифр. На вопросы отвечает Gemeindeamt кантона: ${CONTACT} (пн–чт 13:30–17:00, пт 13:30–16:00).`,
      ] },
      { q: "Как подготовиться?", a: [
        'Кантон предлагает <a href="{zh}">тренировочный тест</a>, брошюру о натурализации и список всех вопросов.',
        'Здесь есть <a href="{questions}">все 350 вопросов с ответами и объяснениями</a>, по темам, на шести языках и всегда с немецкой формулировкой. В разделе <a href="{learn}">Учиться онлайн</a> ты тренируешься короткими уроками с повторениями и пробными экзаменами.',
        'Почему такой способ учиться работает, объясняет <a href="{method}">страница о методе</a>.',
      ] },
    ],
    sources: "Источники",
    disclaimer: "Это не официальный сервис. Обязательны сведения кантона и твоей общины.",
  },
  uk: {
    nav: "Про тест",
    title: "Grundkenntnistest Цюрих: як проходить тест на громадянство",
    desc: "Хто має складати тест на знання в кантоні Цюрих, які бувають запитання, де він проходить і скільки коштує. Лише офіційні джерела.",
    lede: "Що кантон і місто Цюрих офіційно кажуть про тест, з джерелами.",
    faq: [
      { q: "Що таке Grundkenntnistest?", a: [
        "Для звичайної натуралізації в кантоні Цюрих потрібні знання про Швейцарію, кантон Цюрих і громади Цюриха. Їх підтверджують на тесті із запитаннями з географії, політики та історії.",
        'Правова основа: § 16 <a href="{kbuev}">кантональної постанови про громадянство (KBüV)</a>. Громада перевіряє знання на співбесіді з натуралізації зі стандартною анкетою або за допомогою тесту.',
      ] },
      { q: "Чи мушу я складати тест?", a: [
        "Тест не потрібен, якщо справджується одне з такого:",
        "<ul><li>Тобі менше 12 років.</li><li>Ти зараз навчаєшся в обов'язковій школі або на рівні Sekundarstufe II (профнавчання, гімназія) у Швейцарії.</li><li>Ти 5 років відвідував(-ла) обов'язкову школу у Швейцарії, з них щонайменше 3 роки на рівні Sekundarstufe I.</li><li>Ти закінчив(-ла) навчання на рівні Sekundarstufe II у Швейцарії.</li></ul>",
        '<a href="{zh}">Self-check кантону</a> покаже це для твоєї ситуації. У місті Цюрих при спрощеній натуралізації знання перевіряють на співбесіді.',
      ] },
      { q: "Які запитання бувають на тесті?", a: [
        'Кантон публікує <a href="{pdf}">список усіх 350 запитань</a> (PDF, німецькою, травень 2025). Кожне запитання має 4 відповіді, правильна рівно одна.',
        "Офіційний тренувальний тест кантону ставить 50 запитань і після кожної відповіді показує, чи вона правильна. Офіційно не підтверджено, що справжній тест побудовано так само.",
      ] },
      { q: "Де і коли проходить тест?", a: [
        "Громада повідомляє, коли і де можна скласти тест. Щоб записатися, звернися до своєї громади. Залежно від громади тест складають до або після подання заяви.",
        'У <a href="{city}">місті Цюрих</a> тест проходить у Stadthaus, лише після подання заяви.',
      ] },
      { q: "Скільки коштує тест?", a: [
        "Вартість залежить від громади та організатора тесту. Дізнайся у своїй громаді. У місті Цюрих тест безкоштовний.",
      ] },
      { q: "Скільки балів потрібно, щоб скласти? Скільки триває тест?", a: [
        `Ні те, ні інше офіційно не опубліковано, тому ми не називаємо тут цифр. На запитання відповідає Gemeindeamt кантону: ${CONTACT} (пн–чт 13:30–17:00, пт 13:30–16:00).`,
      ] },
      { q: "Як підготуватися?", a: [
        'Кантон пропонує <a href="{zh}">тренувальний тест</a>, брошуру про натуралізацію і список усіх запитань.',
        'Тут є <a href="{questions}">усі 350 запитань з відповідями й поясненнями</a>, за темами, шістьма мовами й завжди з німецьким формулюванням. У розділі <a href="{learn}">Навчатися онлайн</a> ти тренуєшся короткими уроками з повтореннями й пробними іспитами.',
        'Чому такий спосіб навчання працює, пояснює <a href="{method}">сторінка про метод</a>.',
      ] },
    ],
    sources: "Джерела",
    disclaimer: "Це не офіційний сервіс. Обов'язковими є відомості кантону й твоєї громади.",
  },
};
