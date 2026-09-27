// The method page: how Swiss Passport teaches and why. Every claim about the app matches server/src/engine/engine.ts
// (intervals 1, 3, 7, 14, 30 days; a mistake moves a topic back one step) and server/src/catalog.ts (50-question mock exams).
// Research claims cite SOURCES below; keep them as careful as the studies themselves.
export const SOURCES = [
  { cite: "Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.", doi: "10.1111/j.1467-9280.2006.01693.x" },
  { cite: "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.", doi: "10.1037/0033-2909.132.3.354" },
  { cite: "Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. Memory & Cognition, 36(3), 604–616.", doi: "10.3758/MC.36.3.604" },
  { cite: "Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481–498.", doi: "10.1007/s11251-007-9015-8" },
  { cite: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.", doi: "10.1177/1529100612453266" },
];

export const METHOD = {
  de: {
    nav: "Methode",
    link: "Warum diese Methode funktioniert",
    title: "So lernst du für den Einbürgerungstest: die Methode hinter Swiss Passport",
    desc: "Warum Fragen beantworten und in wachsenden Abständen wiederholen besser wirkt als Lesen, und wie Swiss Passport damit auf den Grundkenntnistest Zürich vorbereitet.",
    lede: "Die meisten lernen, indem sie die Fragen immer wieder durchlesen. Das fühlt sich gut an, gehört aber zu den am wenigsten wirksamen Methoden. Swiss Passport nutzt Techniken, die die Gedächtnisforschung seit Jahrzehnten prüft.",
    sections: [
      ["Antworten statt nochmals lesen", [
        "Jedes Mal, wenn du eine Antwort aus dem Gedächtnis abrufst, festigst du sie. In einer bekannten Studie erinnerten sich Studierende, die das Abrufen übten, eine Woche später an mehr als jene, die den Text nochmals lasen, obwohl das Nochmals-Lesen direkt nach dem Lernen besser abschnitt (Roediger & Karpicke 2006).",
        "Darum zeigt Swiss Passport eine kurze Erklärung und fragt dann sofort. Du beantwortest jede Frage selbst, bevor du die Lösung siehst.",
      ]],
      ["Wiederholen, kurz bevor du vergisst", [
        "Was du lernst, verblasst schnell, wenn du es nicht wieder brauchst. Wiederholungen, verteilt über Tage und Wochen, halten Wissen viel länger als gleich viel Übung auf einmal. Je länger du etwas behalten musst, desto grösser dürfen die Abstände sein (Cepeda et al. 2006).",
        "Swiss Passport bringt jedes Thema nach 1, 3, 7, 14 und 30 Tagen wieder. Antwortest du richtig, wird der nächste Abstand länger. Machst du einen Fehler, geht das Thema eine Stufe zurück und kommt am nächsten Tag wieder. So übst du, was du vergisst, und überspringst, was du kannst.",
      ]],
      ["Aus jeder Antwort lernen", [
        "Nach jeder Antwort siehst du, warum sie richtig ist, und wenn du falsch lagst, warum die verlockende falsche Antwort falsch ist. Gerade bei Multiple-Choice-Fragen zählt das: Ohne Rückmeldung halten Lernende eine falsche Antwort später manchmal für richtig, mit Rückmeldung wird dieser Effekt kleiner (Butler & Roediger 2008).",
        "Eine falsch beantwortete Frage kommt am Ende der Lektion wieder, bis du sie richtig beantwortest.",
      ]],
      ["Vor dem Test gemischt üben", [
        "Im echten Test kommen die Fragen durcheinander. Die Wiederholungen mischen Themen aus verschiedenen Lektionen, und jede Probeprüfung stellt 50 zufällige Fragen aus allen 350, ohne Hilfe, wie der Übungstest des Kantons. Gemischtes Üben fühlt sich schwerer an, führte in Studien aber zu besseren Resultaten in späteren Tests als Üben Thema für Thema (Rohrer & Taylor 2007).",
        "Deine Bereitschaft zeigt, bei welchem Anteil der Fragen du das Thema schon an mehreren Tagen richtig beantwortet hast.",
      ]],
      ["In deiner Sprache verstehen, auf Deutsch wiedererkennen", [
        "Du lernst in der Sprache, die du am besten verstehst, damit du den Inhalt verstehst und nicht nur Wörter auswendig lernst. Zu jeder Frage siehst du immer auch den deutschen Wortlaut aus dem echten Test, damit du ihn dort wiedererkennst.",
      ]],
      ["Warum das für deinen Test wichtig ist", [
        "Es gibt 350 offizielle Fragen, und die Gemeinde sagt dir, wann du den Test machst. Büffeln am Vorabend hilft vielleicht für den nächsten Tag, aber so Gelerntes verblasst schnell.",
        "Eine grosse Übersichtsarbeit bewertet Üben mit Tests und verteiltes Üben als die zwei nützlichsten Lerntechniken, Nochmals-Lesen und Markieren dagegen als wenig nützlich (Dunlosky et al. 2013).",
        "Kurz gesagt: Jeden Tag ein wenig ist besser als viel auf einmal. Mach jeden Tag eine kurze Lektion und zuerst die fälligen Wiederholungen.",
      ]],
    ],
  },
  en: {
    nav: "Method",
    link: "Why this method works",
    title: "How to learn for the citizenship test: the method behind Swiss Passport",
    desc: "Why answering questions and repeating them at growing intervals works better than rereading, and how Swiss Passport uses it to prepare you for the Zurich knowledge test.",
    lede: "Most people prepare by reading the questions again and again. It feels productive, but it is one of the least effective ways to learn. Swiss Passport uses techniques that memory research has tested for decades.",
    sections: [
      ["Answer instead of rereading", [
        "Every time you pull an answer out of your memory, you strengthen it. In a well-known study, students who practised recalling a text remembered more of it a week later than students who read it again, even though rereading did better right after studying (Roediger & Karpicke 2006).",
        "That is why Swiss Passport shows a short explanation and then asks right away. You answer every question yourself before you see the solution.",
      ]],
      ["Repeat just before you forget", [
        "What you learn fades quickly if you do not use it again. Repetitions spread over days and weeks keep knowledge much longer than the same amount of practice in one go. The longer you need to remember something, the longer the gaps can be (Cepeda et al. 2006).",
        "Swiss Passport brings every topic back after 1, 3, 7, 14 and 30 days. If you answer correctly, the next gap gets longer. If you make a mistake, the topic moves back one step and comes back the next day. So you practise what you forget and skip what you know.",
      ]],
      ["Learn from every answer", [
        "After each answer you see why it is right, and if you chose a wrong one, why that tempting option is wrong. This matters especially for multiple-choice questions: without feedback, learners sometimes later take a wrong option for true; with feedback, this effect gets smaller (Butler & Roediger 2008).",
        "A question you get wrong comes back at the end of the lesson until you answer it correctly.",
      ]],
      ["Mix topics before the test", [
        "In the real test the questions come in no particular order. Reviews mix topics from different lessons, and every mock exam asks 50 random questions from all 350, without help, like the canton's practice test. Mixed practice feels harder, but in studies it led to better results on later tests than practising one topic at a time (Rohrer & Taylor 2007).",
        "Your readiness score shows the share of questions whose topic you have already answered correctly on several days.",
      ]],
      ["Understand in your language, recognise the German", [
        "You learn in the language you understand best, so you understand the content instead of memorising words. Every question also shows the German wording used in the real test, so you recognise it there.",
      ]],
      ["Why this matters for your test", [
        "There are 350 official questions, and your municipality tells you when you take the test. Cramming the evening before may help the next day, but what you cram fades quickly.",
        "A large review of learning techniques rates practice testing and spaced practice as the two most useful, and rereading and highlighting as of low use (Dunlosky et al. 2013).",
        "In short: a little every day beats a lot at once. Do one short lesson a day, and the due reviews first.",
      ]],
    ],
  },
  fr: {
    nav: "Méthode",
    link: "Pourquoi cette méthode fonctionne",
    title: "Comment apprendre pour le test de naturalisation : la méthode de Swiss Passport",
    desc: "Pourquoi répondre aux questions et les répéter à intervalles croissants fonctionne mieux que relire, et comment Swiss Passport t'y prépare pour le test de connaissances de Zurich.",
    lede: "La plupart des gens se préparent en relisant les questions encore et encore. Cela donne une impression de progrès, mais c'est l'une des façons les moins efficaces d'apprendre. Swiss Passport utilise des techniques que la recherche sur la mémoire étudie depuis des décennies.",
    sections: [
      ["Répondre plutôt que relire", [
        "Chaque fois que tu retrouves une réponse dans ta mémoire, tu la renforces. Dans une étude connue, des étudiants qui s'étaient exercés à se rappeler un texte en retenaient davantage une semaine plus tard que ceux qui l'avaient relu, même si la relecture donnait de meilleurs résultats juste après l'étude (Roediger & Karpicke 2006).",
        "C'est pourquoi Swiss Passport montre une courte explication puis pose tout de suite une question. Tu réponds toi-même à chaque question avant de voir la solution.",
      ]],
      ["Répéter juste avant d'oublier", [
        "Ce que tu apprends s'efface vite si tu ne t'en sers plus. Des répétitions réparties sur des jours et des semaines gardent les connaissances bien plus longtemps que la même quantité d'exercice en une fois. Plus tu dois retenir longtemps, plus les intervalles peuvent être longs (Cepeda et al. 2006).",
        "Swiss Passport fait revenir chaque thème après 1, 3, 7, 14 et 30 jours. Si tu réponds juste, l'intervalle suivant s'allonge. Si tu te trompes, le thème recule d'un niveau et revient le lendemain. Ainsi tu travailles ce que tu oublies et tu sautes ce que tu sais.",
      ]],
      ["Apprendre de chaque réponse", [
        "Après chaque réponse, tu vois pourquoi elle est juste et, si tu t'es trompé, pourquoi la mauvaise réponse tentante est fausse. C'est important surtout pour les questions à choix multiple : sans retour, on tient parfois plus tard une mauvaise réponse pour vraie ; avec un retour, cet effet diminue (Butler & Roediger 2008).",
        "Une question manquée revient à la fin de la leçon jusqu'à ce que tu y répondes juste.",
      ]],
      ["Mélanger les thèmes avant le test", [
        "Dans le vrai test, les questions arrivent dans le désordre. Les répétitions mélangent des thèmes de différentes leçons, et chaque examen blanc pose 50 questions au hasard parmi les 350, sans aide, comme le test d'entraînement du canton. S'exercer de façon mélangée paraît plus difficile, mais dans des études cela a donné de meilleurs résultats aux tests ultérieurs que s'exercer thème par thème (Rohrer & Taylor 2007).",
        "Ton niveau de préparation montre la part des questions dont tu as déjà répondu juste au thème sur plusieurs jours.",
      ]],
      ["Comprendre dans ta langue, reconnaître l'allemand", [
        "Tu apprends dans la langue que tu comprends le mieux, pour comprendre le contenu au lieu d'apprendre des mots par cœur. Chaque question montre aussi le texte allemand du vrai test, pour que tu le reconnaisses le jour venu.",
      ]],
      ["Pourquoi c'est important pour ton test", [
        "Il y a 350 questions officielles, et ta commune te dit quand tu passes le test. Bachoter la veille peut aider le lendemain, mais ce qu'on bachote s'efface vite.",
        "Une grande synthèse sur les techniques d'apprentissage juge l'entraînement par tests et la pratique espacée comme les deux plus utiles, et la relecture et le surlignage comme peu utiles (Dunlosky et al. 2013).",
        "En bref : un peu chaque jour vaut mieux que beaucoup d'un coup. Fais une courte leçon par jour, et d'abord les répétitions prévues.",
      ]],
    ],
  },
  it: {
    nav: "Metodo",
    link: "Perché questo metodo funziona",
    title: "Come studiare per il test di naturalizzazione: il metodo di Swiss Passport",
    desc: "Perché rispondere alle domande e ripeterle a intervalli crescenti funziona meglio che rileggere, e come Swiss Passport ti prepara così al test di conoscenze di Zurigo.",
    lede: "La maggior parte delle persone si prepara rileggendo le domande più e più volte. Sembra utile, ma è uno dei modi meno efficaci di imparare. Swiss Passport usa tecniche che la ricerca sulla memoria studia da decenni.",
    sections: [
      ["Rispondere invece di rileggere", [
        "Ogni volta che richiami una risposta dalla memoria, la rafforzi. In uno studio noto, gli studenti che si erano esercitati a richiamare un testo ne ricordavano di più una settimana dopo rispetto a chi lo aveva riletto, anche se subito dopo lo studio la rilettura dava risultati migliori (Roediger & Karpicke 2006).",
        "Per questo Swiss Passport mostra una breve spiegazione e poi chiede subito. Rispondi tu a ogni domanda prima di vedere la soluzione.",
      ]],
      ["Ripetere poco prima di dimenticare", [
        "Ciò che impari svanisce in fretta se non lo usi di nuovo. Ripetizioni distribuite su giorni e settimane conservano le conoscenze molto più a lungo della stessa quantità di esercizio fatta in una volta. Più a lungo devi ricordare qualcosa, più lunghi possono essere gli intervalli (Cepeda et al. 2006).",
        "Swiss Passport ripropone ogni tema dopo 1, 3, 7, 14 e 30 giorni. Se rispondi giusto, l'intervallo successivo si allunga. Se sbagli, il tema torna indietro di un livello e ritorna il giorno dopo. Così ti eserciti su ciò che dimentichi e salti ciò che sai.",
      ]],
      ["Imparare da ogni risposta", [
        "Dopo ogni risposta vedi perché è giusta e, se hai sbagliato, perché la risposta sbagliata allettante è sbagliata. Conta soprattutto con le domande a scelta multipla: senza riscontro, a volte più tardi si ritiene vera una risposta sbagliata; con il riscontro, questo effetto si riduce (Butler & Roediger 2008).",
        "Una domanda sbagliata torna alla fine della lezione finché non rispondi correttamente.",
      ]],
      ["Mescolare i temi prima del test", [
        "Nel test vero le domande arrivano in ordine sparso. Le ripetizioni mescolano temi di lezioni diverse, e ogni esame di prova pone 50 domande a caso fra tutte le 350, senza aiuto, come il test di esercitazione del Cantone. Esercitarsi in modo misto sembra più difficile, ma negli studi ha portato a risultati migliori nei test successivi rispetto all'esercitarsi un tema alla volta (Rohrer & Taylor 2007).",
        "Il tuo livello di preparazione mostra la quota di domande il cui tema hai già risposto correttamente in più giorni.",
      ]],
      ["Capire nella tua lingua, riconoscere il tedesco", [
        "Impari nella lingua che capisci meglio, per capire il contenuto invece di imparare parole a memoria. Ogni domanda mostra anche il testo tedesco del test vero, così lo riconosci il giorno del test.",
      ]],
      ["Perché è importante per il tuo test", [
        "Le domande ufficiali sono 350, e il tuo comune ti dice quando fai il test. Studiare tutto la sera prima può aiutare il giorno dopo, ma ciò che si impara così svanisce presto.",
        "Un'ampia rassegna sulle tecniche di studio valuta l'esercitazione con test e la pratica distribuita come le due più utili, e la rilettura e la sottolineatura come poco utili (Dunlosky et al. 2013).",
        "In breve: un po' ogni giorno è meglio che tanto in una volta. Fai una breve lezione al giorno, e prima le ripetizioni in scadenza.",
      ]],
    ],
  },
  ru: {
    nav: "Метод",
    link: "Почему этот метод работает",
    title: "Как готовиться к тесту на гражданство: метод Swiss Passport",
    desc: "Почему отвечать на вопросы и повторять их с растущими интервалами полезнее, чем перечитывать, и как Swiss Passport готовит так к тесту на знания в Цюрихе.",
    lede: "Большинство готовится, перечитывая вопросы снова и снова. Кажется, что это помогает, но это один из наименее эффективных способов учиться. Swiss Passport использует приёмы, которые исследования памяти проверяют уже десятилетиями.",
    sections: [
      ["Отвечать, а не перечитывать", [
        "Каждый раз, когда ты достаёшь ответ из памяти, ты его укрепляешь. В известном исследовании студенты, которые тренировались вспоминать текст, через неделю помнили больше, чем те, кто его перечитывал, хотя сразу после занятия перечитывание давало лучший результат (Roediger & Karpicke 2006).",
        "Поэтому Swiss Passport показывает короткое объяснение и сразу задаёт вопрос. Ты сам отвечаешь на каждый вопрос, прежде чем увидеть решение.",
      ]],
      ["Повторять незадолго до того, как забудешь", [
        "То, что ты выучил, быстро забывается, если этим не пользоваться. Повторения, распределённые на дни и недели, сохраняют знания гораздо дольше, чем столько же занятий за один раз. Чем дольше нужно помнить, тем длиннее могут быть промежутки (Cepeda et al. 2006).",
        "Swiss Passport возвращает каждую тему через 1, 3, 7, 14 и 30 дней. Если отвечаешь верно, следующий промежуток становится длиннее. Если ошибаешься, тема опускается на ступень и возвращается на следующий день. Так ты тренируешь то, что забываешь, и пропускаешь то, что знаешь.",
      ]],
      ["Учиться на каждом ответе", [
        "После каждого ответа ты видишь, почему он верный, а если ошибся, почему соблазнительный неверный ответ неверен. Особенно это важно для вопросов с вариантами ответа: без обратной связи люди иногда позже принимают неверный вариант за правильный; с обратной связью этот эффект уменьшается (Butler & Roediger 2008).",
        "Вопрос с ошибкой возвращается в конце урока, пока ты не ответишь правильно.",
      ]],
      ["Перед тестом смешивать темы", [
        "На настоящем тесте вопросы идут вперемешку. Повторения смешивают темы из разных уроков, а каждый пробный экзамен задаёт 50 случайных вопросов из всех 350, без подсказок, как тренировочный тест кантона. Смешанная тренировка кажется труднее, но в исследованиях она давала лучшие результаты на последующих тестах, чем тренировка по одной теме (Rohrer & Taylor 2007).",
        "Твоя готовность показывает долю вопросов, по темам которых ты уже отвечал правильно в разные дни.",
      ]],
      ["Понимать на своём языке, узнавать по-немецки", [
        "Ты учишься на языке, который понимаешь лучше всего, чтобы понимать смысл, а не заучивать слова. У каждого вопроса ты также видишь немецкую формулировку из настоящего теста, чтобы узнать её на экзамене.",
      ]],
      ["Почему это важно для твоего теста", [
        "Официальных вопросов 350, и община сообщает, когда ты сдаёшь тест. Зубрёжка накануне может помочь на следующий день, но выученное так быстро забывается.",
        "Большой обзор методов обучения называет тренировку тестами и распределённое повторение двумя самыми полезными приёмами, а перечитывание и выделение текста маркером малополезными (Dunlosky et al. 2013).",
        "Коротко: понемногу каждый день лучше, чем много за раз. Проходи один короткий урок в день, а сначала делай назначенные повторения.",
      ]],
    ],
  },
  uk: {
    nav: "Метод",
    link: "Чому цей метод працює",
    title: "Як готуватися до тесту на громадянство: метод Swiss Passport",
    desc: "Чому відповідати на запитання й повторювати їх із дедалі більшими інтервалами краще, ніж перечитувати, і як Swiss Passport так готує до тесту на знання в Цюриху.",
    lede: "Більшість готується, перечитуючи запитання знову й знову. Здається, що це допомагає, але це один із найменш ефективних способів учитися. Swiss Passport використовує прийоми, які дослідження пам'яті перевіряють уже десятиліттями.",
    sections: [
      ["Відповідати, а не перечитувати", [
        "Щоразу, коли ти дістаєш відповідь із пам'яті, ти її зміцнюєш. У відомому дослідженні студенти, які тренувалися пригадувати текст, через тиждень пам'ятали більше, ніж ті, хто його перечитував, хоча одразу після заняття перечитування давало кращий результат (Roediger & Karpicke 2006).",
        "Тому Swiss Passport показує коротке пояснення й одразу ставить запитання. Ти сам відповідаєш на кожне запитання, перш ніж побачити розв'язок.",
      ]],
      ["Повторювати незадовго до того, як забудеш", [
        "Те, що ти вивчив, швидко забувається, якщо цим не користуватися. Повторення, розподілені на дні й тижні, зберігають знання набагато довше, ніж стільки ж занять за один раз. Що довше треба пам'ятати, то довшими можуть бути проміжки (Cepeda et al. 2006).",
        "Swiss Passport повертає кожну тему через 1, 3, 7, 14 і 30 днів. Якщо відповідаєш правильно, наступний проміжок стає довшим. Якщо помиляєшся, тема опускається на щабель і повертається наступного дня. Так ти тренуєш те, що забуваєш, і пропускаєш те, що знаєш.",
      ]],
      ["Вчитися з кожної відповіді", [
        "Після кожної відповіді ти бачиш, чому вона правильна, а якщо помилився, чому спокуслива хибна відповідь хибна. Особливо це важливо для запитань із варіантами відповіді: без зворотного зв'язку люди іноді згодом вважають хибний варіант правильним; зі зворотним зв'язком цей ефект меншає (Butler & Roediger 2008).",
        "Запитання з помилкою повертається наприкінці уроку, доки ти не відповіси правильно.",
      ]],
      ["Перед тестом змішувати теми", [
        "На справжньому тесті запитання йдуть упереміш. Повторення змішують теми з різних уроків, а кожен пробний іспит ставить 50 випадкових запитань з усіх 350, без підказок, як тренувальний тест кантону. Змішане тренування здається важчим, але в дослідженнях воно давало кращі результати на подальших тестах, ніж тренування по одній темі (Rohrer & Taylor 2007).",
        "Твоя готовність показує частку запитань, на теми яких ти вже відповідав правильно в різні дні.",
      ]],
      ["Розуміти своєю мовою, впізнавати німецькою", [
        "Ти вчишся мовою, яку розумієш найкраще, щоб розуміти зміст, а не завчати слова. У кожного запитання ти також бачиш німецьке формулювання зі справжнього тесту, щоб упізнати його на іспиті.",
      ]],
      ["Чому це важливо для твого тесту", [
        "Офіційних запитань 350, і громада повідомляє, коли ти складаєш тест. Зубріння напередодні може допомогти наступного дня, але вивчене так швидко забувається.",
        "Великий огляд методів навчання називає тренування тестами й розподілене повторення двома найкориснішими прийомами, а перечитування й виділення тексту маркером малокорисними (Dunlosky et al. 2013).",
        "Коротко: потроху щодня краще, ніж багато за раз. Проходь один короткий урок на день, а спершу роби заплановані повторення.",
      ]],
    ],
  },
};

// Labels of the four visuals on the method page (components in src/components/method/).
export const VIZ = {
  de: {
    curveTitle: "Wie viel du noch weisst", cram: "Alles an einem Abend (6-mal)", spaced: "Verteilt: nach 1, 3, 7, 14 und 30 Tagen",
    cramShort: "An einem Abend", spacedShort: "Verteilt", day: "Tag", days: "Tage", review: "Wiederholung", all: "alles", none: "nichts",
    levels: ["fast vergessen", "unsicher", "gut", "sehr gut"], table: "Als Tabelle",
    curveNote: "Schema, keine Messwerte: So verlaufen Vergessen und Wiederholen typischerweise. Beide Linien stehen für gleich viele Wiederholungen.",
    tryIt: "Probier es aus: Wähl die Antwort, die dir richtig scheint.",
    blocked: "Thema für Thema", mixed: "Gemischt, wie im Test", mixNote: "12 Fragen aus 3 Themen.",
    showIn: "Frage anzeigen auf",
    order: "Reihenfolge der Fragen",
  },
  en: {
    curveTitle: "How much you still know", cram: "All in one evening (6 times)", spaced: "Spread out: after 1, 3, 7, 14 and 30 days",
    cramShort: "One evening", spacedShort: "Spread out", day: "Day", days: "Days", review: "Review", all: "everything", none: "nothing",
    levels: ["almost forgotten", "unsure", "good", "very good"], table: "As a table",
    curveNote: "Schematic, not measured data: how forgetting and reviewing typically unfold. Both lines stand for the same number of repetitions.",
    tryIt: "Try it: pick the answer that seems right to you.",
    blocked: "Topic by topic", mixed: "Mixed, like in the test", mixNote: "12 questions from 3 topics.",
    showIn: "Show the question in",
    order: "Order of the questions",
  },
  fr: {
    curveTitle: "Ce que tu sais encore", cram: "Tout en une soirée (6 fois)", spaced: "Réparti : après 1, 3, 7, 14 et 30 jours",
    cramShort: "Une soirée", spacedShort: "Réparti", day: "Jour", days: "Jours", review: "Répétition", all: "tout", none: "rien",
    levels: ["presque oublié", "incertain", "bien", "très bien"], table: "Sous forme de tableau",
    curveNote: "Schéma, pas des mesures : comment l'oubli et les répétitions évoluent en général. Les deux lignes représentent le même nombre de répétitions.",
    tryIt: "Essaie : choisis la réponse qui te semble juste.",
    blocked: "Thème par thème", mixed: "Mélangé, comme au test", mixNote: "12 questions de 3 thèmes.",
    showIn: "Afficher la question en",
    order: "Ordre des questions",
  },
  it: {
    curveTitle: "Quanto ricordi ancora", cram: "Tutto in una sera (6 volte)", spaced: "Distribuito: dopo 1, 3, 7, 14 e 30 giorni",
    cramShort: "Una sera", spacedShort: "Distribuito", day: "Giorno", days: "Giorni", review: "Ripetizione", all: "tutto", none: "niente",
    levels: ["quasi dimenticato", "incerto", "bene", "molto bene"], table: "Come tabella",
    curveNote: "Schema, non dati misurati: come procedono di solito l'oblio e le ripetizioni. Le due linee rappresentano lo stesso numero di ripetizioni.",
    tryIt: "Prova: scegli la risposta che ti sembra giusta.",
    blocked: "Un tema alla volta", mixed: "Misto, come nel test", mixNote: "12 domande da 3 temi.",
    showIn: "Mostra la domanda in",
    order: "Ordine delle domande",
  },
  ru: {
    curveTitle: "Сколько ты ещё помнишь", cram: "Всё за один вечер (6 раз)", spaced: "Распределённо: через 1, 3, 7, 14 и 30 дней",
    cramShort: "Один вечер", spacedShort: "Распределённо", day: "День", days: "Дни", review: "Повторение", all: "всё", none: "ничего",
    levels: ["почти забыто", "неуверенно", "хорошо", "очень хорошо"], table: "В виде таблицы",
    curveNote: "Схема, а не данные измерений: как обычно идут забывание и повторение. Обе линии означают одинаковое число повторений.",
    tryIt: "Попробуй: выбери ответ, который кажется тебе правильным.",
    blocked: "Тема за темой", mixed: "Вперемешку, как на тесте", mixNote: "12 вопросов из 3 тем.",
    showIn: "Показать вопрос на",
    order: "Порядок вопросов",
  },
  uk: {
    curveTitle: "Скільки ти ще пам'ятаєш", cram: "Усе за один вечір (6 разів)", spaced: "Розподілено: через 1, 3, 7, 14 і 30 днів",
    cramShort: "Один вечір", spacedShort: "Розподілено", day: "День", days: "Дні", review: "Повторення", all: "усе", none: "нічого",
    levels: ["майже забуто", "непевно", "добре", "дуже добре"], table: "У вигляді таблиці",
    curveNote: "Схема, а не дані вимірювань: як зазвичай відбуваються забування й повторення. Обидві лінії означають однакову кількість повторень.",
    tryIt: "Спробуй: обери відповідь, яка здається тобі правильною.",
    blocked: "Тема за темою", mixed: "Упереміш, як на тесті", mixNote: "12 запитань із 3 тем.",
    showIn: "Показати запитання мовою",
    order: "Порядок запитань",
  },
};
