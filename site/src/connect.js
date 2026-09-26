// The page on adding Swiss Passport to an AI app (/<lang>/connect/). Steps checked on 2026-09-26 against the help
// pages of Claude, ChatGPT, Grok, Mistral Vibe and Perplexity; the ChatGPT steps also in a real account.
// Menu names stay in English, as the apps show them. Check them again when an app changes its settings.
// Logos: LobeHub Icons (@lobehub/icons-static-svg 1.95.1, MIT), in currentColor. The marks are trademarks of their owners.
export const LOGOS = {
  claude: "<path d=\"M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z\"></path>",
  chatgpt: "<path d=\"M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z\"></path>",
  grok: "<path d=\"M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815\"></path>",
  mistral: "<path clip-rule=\"evenodd\" d=\"M3.428 3.4h3.429v3.428h3.429v3.429h-.002 3.431V6.828h3.427V3.4h3.43v13.714H24v3.429H13.714v-3.428h-3.428v-3.429h-3.43v3.428h3.43v3.429H0v-3.429h3.428V3.4zm10.286 13.715h3.428v-3.429h-3.427v3.429z\"></path>",
  perplexity: "<path d=\"M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z\"></path>",
};

export const CONNECT = {
  de: {
    nav: "Mit KI lernen",
    title: "Swiss Passport in deiner KI-App",
    desc: "So fügst du Swiss Passport zu Claude, ChatGPT, Grok, Mistral Vibe oder Perplexity hinzu. Danach lernst du im Chat, eine Frage nach der anderen.",
    link: "Schritt für Schritt für Claude, ChatGPT, Grok, Mistral Vibe und Perplexity",
    address: "Adresse",
    apps: [
      { id: "claude", name: "Claude", note: "Gratis und in den bezahlten Abos. Im Web oder am Computer hinzufügen, dann geht es auch in der Handy-App und mit Sprache. Mit der Quizkarte zum Anklicken.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Name: Swiss Passport. Adresse einfügen, dann Add und Connect.",
        "Im Chat: + → Connectors → Swiss Passport einschalten und sagen, dass du lernen willst.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise und Edu, nur im Web. Mit der Quizkarte zum Anklicken.", steps: [
        "Plugins in der Seitenleiste → Add → Create MCP App. Kein Add-Knopf? Zuerst in den Einstellungen den Developer mode einschalten.",
        "Name: Swiss Passport. Adresse einfügen, Authentifizierung: No Authentication, dann Create.",
        "In einem neuen Chat @Swiss Passport tippen und sagen, dass du lernen willst.",
        "Wirkt nach einem Update etwas veraltet? Einstellungen → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "Auf grok.com. Grok stellt die Fragen als Text.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Adresse einfügen und speichern.",
        "Im Chat sagen: «Nutze Swiss Passport, ich will für den Einbürgerungstest lernen.»",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Gratis und in den bezahlten Abos, im Web. Die Fragen kommen als Text.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Name: SwissPassport, ohne Leerzeichen. Adresse einfügen, dann Connect.",
        "Im Chat: + → Tools → SwissPassport einschalten.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro und Max, im Web. Die Fragen kommen als Text.", steps: [
        "Einstellungen → Connectors → + Custom connector → Remote.",
        "Name: Swiss Passport. Adresse einfügen, Authentifizierung: None, Transport: Streamable HTTP. Hinweis bestätigen, dann Add.",
        "Den Connector einschalten und in einem neuen Thread fragen.",
      ] },
    ],
    other: "Andere Apps", other_p: "Jede App, die einen entfernten MCP-Server hinzufügen kann, funktioniert gleich: Adresse oben, keine Authentifizierung. Gemini und Microsoft Copilot können das in der Schweiz noch nicht.",
    logos: "Die Logos sind Marken ihrer Inhaber. Swiss Passport ist mit keinem dieser Anbieter verbunden.",
  },
  en: {
    nav: "Learn with AI",
    title: "Swiss Passport in your AI app",
    desc: "How to add Swiss Passport to Claude, ChatGPT, Grok, Mistral Vibe or Perplexity. Then you learn in the chat, one question at a time.",
    link: "Step by step for Claude, ChatGPT, Grok, Mistral Vibe and Perplexity",
    address: "Address",
    apps: [
      { id: "claude", name: "Claude", note: "Free and paid plans. Add it on the web or on the computer, then it also works in the phone app and by voice. With the clickable quiz card.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Name: Swiss Passport. Paste the address, then Add and Connect.",
        "In a chat: + → Connectors → turn on Swiss Passport and say that you want to learn.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise and Edu, on the web only. With the clickable quiz card.", steps: [
        "Plugins in the sidebar → Add → Create MCP App. No Add button? Turn on Developer mode in the settings first.",
        "Name: Swiss Passport. Paste the address, authentication: No Authentication, then Create.",
        "In a new chat type @Swiss Passport and say that you want to learn.",
        "Something looks old after an update? Settings → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "On grok.com. Grok asks the questions as text.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Paste the address and save.",
        "In a chat say: “Use Swiss Passport, I want to learn for the citizenship test.”",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Free and paid plans, on the web. The questions come as text.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Name: SwissPassport, without a space. Paste the address, then Connect.",
        "In a chat: + → Tools → turn on SwissPassport.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro and Max, on the web. The questions come as text.", steps: [
        "Settings → Connectors → + Custom connector → Remote.",
        "Name: Swiss Passport. Paste the address, authentication: None, transport: Streamable HTTP. Accept the note, then Add.",
        "Turn the connector on and ask in a new thread.",
      ] },
    ],
    other: "Other apps", other_p: "Any app that can add a remote MCP server works the same way: the address above, no authentication. Gemini and Microsoft Copilot cannot do this in Switzerland yet.",
    logos: "The logos are trademarks of their owners. Swiss Passport is not affiliated with any of these companies.",
  },
  fr: {
    nav: "Apprendre avec l'IA",
    title: "Swiss Passport dans ton app d'IA",
    desc: "Comment ajouter Swiss Passport à Claude, ChatGPT, Grok, Mistral Vibe ou Perplexity. Ensuite tu apprends dans la conversation, une question après l'autre.",
    link: "Pas à pas pour Claude, ChatGPT, Grok, Mistral Vibe et Perplexity",
    address: "Adresse",
    apps: [
      { id: "claude", name: "Claude", note: "Gratuit et dans les abonnements payants. Ajoute-le sur le web ou sur ordinateur, ensuite il marche aussi dans l'app mobile et à la voix. Avec la carte de quiz cliquable.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Nom : Swiss Passport. Colle l'adresse, puis Add et Connect.",
        "Dans une conversation : + → Connectors → active Swiss Passport et dis que tu veux apprendre.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise et Edu, uniquement sur le web. Avec la carte de quiz cliquable.", steps: [
        "Plugins dans la barre latérale → Add → Create MCP App. Pas de bouton Add ? Active d'abord le Developer mode dans les réglages.",
        "Nom : Swiss Passport. Colle l'adresse, authentification : No Authentication, puis Create.",
        "Dans une nouvelle conversation, tape @Swiss Passport et dis que tu veux apprendre.",
        "Quelque chose semble ancien après une mise à jour ? Réglages → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "Sur grok.com. Grok pose les questions en texte.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Colle l'adresse et enregistre.",
        "Dans une conversation, dis : « Utilise Swiss Passport, je veux préparer le test de naturalisation. »",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Gratuit et dans les abonnements payants, sur le web. Les questions arrivent en texte.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Nom : SwissPassport, sans espace. Colle l'adresse, puis Connect.",
        "Dans une conversation : + → Tools → active SwissPassport.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro et Max, sur le web. Les questions arrivent en texte.", steps: [
        "Réglages → Connectors → + Custom connector → Remote.",
        "Nom : Swiss Passport. Colle l'adresse, authentification : None, transport : Streamable HTTP. Accepte l'avertissement, puis Add.",
        "Active le connecteur et pose ta question dans un nouveau fil.",
      ] },
    ],
    other: "Autres apps", other_p: "Toute app qui peut ajouter un serveur MCP distant fonctionne de la même façon : l'adresse ci-dessus, sans authentification. Gemini et Microsoft Copilot ne le permettent pas encore en Suisse.",
    logos: "Les logos sont des marques de leurs propriétaires. Swiss Passport n'est lié à aucune de ces entreprises.",
  },
  it: {
    nav: "Imparare con l'IA",
    title: "Swiss Passport nella tua app di IA",
    desc: "Come aggiungere Swiss Passport a Claude, ChatGPT, Grok, Mistral Vibe o Perplexity. Poi impari in chat, una domanda alla volta.",
    link: "Passo per passo per Claude, ChatGPT, Grok, Mistral Vibe e Perplexity",
    address: "Indirizzo",
    apps: [
      { id: "claude", name: "Claude", note: "Gratis e negli abbonamenti a pagamento. Aggiungilo sul web o sul computer, poi funziona anche nell'app per il telefono e con la voce. Con la scheda del quiz cliccabile.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Nome: Swiss Passport. Incolla l'indirizzo, poi Add e Connect.",
        "In una chat: + → Connectors → attiva Swiss Passport e di' che vuoi imparare.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise ed Edu, solo sul web. Con la scheda del quiz cliccabile.", steps: [
        "Plugins nella barra laterale → Add → Create MCP App. Manca il pulsante Add? Prima attiva il Developer mode nelle impostazioni.",
        "Nome: Swiss Passport. Incolla l'indirizzo, autenticazione: No Authentication, poi Create.",
        "In una nuova chat scrivi @Swiss Passport e di' che vuoi imparare.",
        "Dopo un aggiornamento qualcosa sembra vecchio? Impostazioni → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "Su grok.com. Grok fa le domande come testo.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Incolla l'indirizzo e salva.",
        "In una chat di': «Usa Swiss Passport, voglio prepararmi al test di naturalizzazione.»",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Gratis e negli abbonamenti a pagamento, sul web. Le domande arrivano come testo.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Nome: SwissPassport, senza spazio. Incolla l'indirizzo, poi Connect.",
        "In una chat: + → Tools → attiva SwissPassport.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro e Max, sul web. Le domande arrivano come testo.", steps: [
        "Impostazioni → Connectors → + Custom connector → Remote.",
        "Nome: Swiss Passport. Incolla l'indirizzo, autenticazione: None, trasporto: Streamable HTTP. Accetta l'avviso, poi Add.",
        "Attiva il connettore e fai la domanda in un nuovo thread.",
      ] },
    ],
    other: "Altre app", other_p: "Ogni app che può aggiungere un server MCP remoto funziona allo stesso modo: l'indirizzo qui sopra, senza autenticazione. Gemini e Microsoft Copilot in Svizzera non lo permettono ancora.",
    logos: "I loghi sono marchi dei rispettivi proprietari. Swiss Passport non è legato a nessuna di queste aziende.",
  },
  ru: {
    nav: "Учиться с ИИ",
    title: "Swiss Passport в твоём приложении ИИ",
    desc: "Как добавить Swiss Passport в Claude, ChatGPT, Grok, Mistral Vibe или Perplexity. Потом ты учишься прямо в чате, по одному вопросу.",
    link: "Пошагово для Claude, ChatGPT, Grok, Mistral Vibe и Perplexity",
    address: "Адрес",
    apps: [
      { id: "claude", name: "Claude", note: "Бесплатно и в платных тарифах. Добавь его в браузере или на компьютере, потом он работает и в приложении на телефоне, в том числе голосом. С карточкой теста, на которую можно нажимать.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Название: Swiss Passport. Вставь адрес, затем Add и Connect.",
        "В чате: + → Connectors → включи Swiss Passport и скажи, что хочешь учиться.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise и Edu, только в браузере. С карточкой теста, на которую можно нажимать.", steps: [
        "Plugins в боковой панели → Add → Create MCP App. Нет кнопки Add? Сначала включи Developer mode в настройках.",
        "Название: Swiss Passport. Вставь адрес, аутентификация: No Authentication, затем Create.",
        "В новом чате напиши @Swiss Passport и скажи, что хочешь учиться.",
        "После обновления что-то выглядит по-старому? Настройки → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "На grok.com. Grok задаёт вопросы текстом.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Вставь адрес и сохрани.",
        "В чате скажи: «Используй Swiss Passport, я хочу готовиться к тесту на гражданство».",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Бесплатно и в платных тарифах, в браузере. Вопросы приходят текстом.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Название: SwissPassport, без пробела. Вставь адрес, затем Connect.",
        "В чате: + → Tools → включи SwissPassport.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro и Max, в браузере. Вопросы приходят текстом.", steps: [
        "Настройки → Connectors → + Custom connector → Remote.",
        "Название: Swiss Passport. Вставь адрес, аутентификация: None, транспорт: Streamable HTTP. Подтверди предупреждение, затем Add.",
        "Включи коннектор и задай вопрос в новом треде.",
      ] },
    ],
    other: "Другие приложения", other_p: "Так же работает любое приложение, в которое можно добавить удалённый MCP-сервер: адрес выше, без аутентификации. Gemini и Microsoft Copilot в Швейцарии пока так не умеют.",
    logos: "Логотипы принадлежат их владельцам. Swiss Passport не связан ни с одной из этих компаний.",
  },
  uk: {
    nav: "Вчитися з ШІ",
    title: "Swiss Passport у твоєму застосунку ШІ",
    desc: "Як додати Swiss Passport до Claude, ChatGPT, Grok, Mistral Vibe чи Perplexity. Потім ти вчишся просто в чаті, по одному питанню.",
    link: "Покроково для Claude, ChatGPT, Grok, Mistral Vibe і Perplexity",
    address: "Адреса",
    apps: [
      { id: "claude", name: "Claude", note: "Безкоштовно й у платних тарифах. Додай його в браузері або на комп'ютері, потім він працює й у застосунку на телефоні, також голосом. З карткою тесту, на яку можна натискати.", steps: [
        "Customize → Connectors → + → Add custom connector.",
        "Назва: Swiss Passport. Встав адресу, потім Add і Connect.",
        "У чаті: + → Connectors → увімкни Swiss Passport і скажи, що хочеш вчитися.",
      ] },
      { id: "chatgpt", name: "ChatGPT", note: "Plus, Pro, Business, Enterprise і Edu, лише в браузері. З карткою тесту, на яку можна натискати.", steps: [
        "Plugins у бічній панелі → Add → Create MCP App. Немає кнопки Add? Спершу увімкни Developer mode у налаштуваннях.",
        "Назва: Swiss Passport. Встав адресу, автентифікація: No Authentication, потім Create.",
        "У новому чаті напиши @Swiss Passport і скажи, що хочеш вчитися.",
        "Після оновлення щось виглядає по-старому? Налаштування → Plugins → Swiss Passport → Refresh tools.",
      ] },
      { id: "grok", name: "Grok", note: "На grok.com. Grok ставить питання текстом.", steps: [
        "grok.com/connectors → New Connector → Custom.",
        "Встав адресу й збережи.",
        "У чаті скажи: «Використай Swiss Passport, я хочу готуватися до тесту на громадянство».",
      ] },
      { id: "mistral", name: "Mistral Vibe (Le Chat)", note: "Безкоштовно й у платних тарифах, у браузері. Питання приходять текстом.", steps: [
        "Connectors → Add Connector → Custom MCP Connector.",
        "Назва: SwissPassport, без пробілу. Встав адресу, потім Connect.",
        "У чаті: + → Tools → увімкни SwissPassport.",
      ] },
      { id: "perplexity", name: "Perplexity", note: "Pro і Max, у браузері. Питання приходять текстом.", steps: [
        "Налаштування → Connectors → + Custom connector → Remote.",
        "Назва: Swiss Passport. Встав адресу, автентифікація: None, транспорт: Streamable HTTP. Підтверди попередження, потім Add.",
        "Увімкни конектор і постав питання в новому треді.",
      ] },
    ],
    other: "Інші застосунки", other_p: "Так само працює будь-який застосунок, у який можна додати віддалений MCP-сервер: адреса вище, без автентифікації. Gemini і Microsoft Copilot у Швейцарії поки що так не вміють.",
    logos: "Логотипи належать їхнім власникам. Swiss Passport не пов'язаний із жодною з цих компаній.",
  },
};
