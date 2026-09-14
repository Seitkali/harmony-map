// questions.js — вопросы теста на трёх языках.
// PERSONALITY_QUESTIONS: 8 черт характера × 4 вопроса (авторская адаптация в духе Big Five)
// CAREER_QUESTIONS: 6 направлений RIASEC (модель Дж. Холланда) × 3 вопроса
// OPEN_QUESTIONS: 4 открытых вопроса про переломные моменты жизни

const PERSONALITY_QUESTIONS = [
  { id: "p1", trait: "analytical", text: { ru: "Мне нравится разбираться, почему что-то работает именно так", en: "I enjoy figuring out why things work the way they do", kk: "Бір нәрсенің неге дәл солай жұмыс істейтінін түсінгім келеді" } },
  { id: "p2", trait: "analytical", text: { ru: "Я люблю искать закономерности в информации и фактах", en: "I like finding patterns in information and facts", kk: "Ақпарат пен деректерден заңдылық іздегенді ұнатамын" } },
  { id: "p3", trait: "analytical", text: { ru: "Перед решением я обычно взвешиваю все «за» и «против»", en: "Before deciding, I usually weigh all the pros and cons", kk: "Шешім қабылдамас бұрын әдетте барлық артықшылығы мен кемшілігін салмақтаймын" } },
  { id: "p4", trait: "analytical", text: { ru: "Мне интересно докапываться до сути сложных вопросов", en: "I like getting to the bottom of complicated questions", kk: "Күрделі мәселелердің түп-төркінін қазып білгім келеді" } },

  { id: "p5", trait: "creative", text: { ru: "Мне нравится придумывать новые идеи и нестандартные решения", en: "I enjoy coming up with new ideas and unconventional solutions", kk: "Жаңа идеялар мен стандартты емес шешімдер ойлап табуды ұнатамын" } },
  { id: "p6", trait: "creative", text: { ru: "Я часто представляю, как можно улучшить привычные вещи", en: "I often imagine how everyday things could be improved", kk: "Әдеттегі нәрселерді қалай жақсартуға болатынын жиі елестетемін" } },
  { id: "p7", trait: "creative", text: { ru: "Мне скучно делать одно и то же по шаблону", en: "Doing the same thing by the same template bores me", kk: "Бір нәрсені үлгі бойынша қайта-қайта жасау мені жалықтырады" } },
  { id: "p8", trait: "creative", text: { ru: "Я легко нахожу необычные связи между разными вещами", en: "I easily spot unusual connections between different things", kk: "Әртүрлі нәрселердің арасынан күтпеген байланыстарды оңай табамын" } },

  { id: "p9", trait: "social", text: { ru: "Я заряжаюсь энергией, когда провожу время с людьми", en: "I get energized spending time around people", kk: "Адамдармен уақыт өткізгенде қуат жинаймын" } },
  { id: "p10", trait: "social", text: { ru: "Мне легко начать разговор с незнакомым человеком", en: "It's easy for me to start a conversation with a stranger", kk: "Бейтаныс адаммен әңгіме бастау маған оңай" } },
  { id: "p11", trait: "social", text: { ru: "Я быстро чувствую настроение других людей в комнате", en: "I quickly pick up on the mood of people around me", kk: "Айналамдағы адамдардың көңіл-күйін тез сеземін" } },
  { id: "p12", trait: "social", text: { ru: "Совместная работа с людьми мне интереснее, чем работа в одиночку", en: "Working together with people interests me more than working alone", kk: "Адамдармен бірге жұмыс істеу маған жалғыз жұмыс істегеннен қызық" } },

  { id: "p13", trait: "leadership", text: { ru: "Мне комфортно брать на себя ответственность за результат группы", en: "I'm comfortable taking responsibility for a group's outcome", kk: "Топтың нәтижесі үшін жауапкершілік алу маған қолайлы" } },
  { id: "p14", trait: "leadership", text: { ru: "Я легко убеждаю других в своей точке зрения", en: "I can easily persuade others of my point of view", kk: "Басқаларды өз көзқарасыма оңай сендіре аламын" } },
  { id: "p15", trait: "leadership", text: { ru: "В сложной ситуации я обычно беру инициативу на себя", en: "In a difficult situation I usually take the initiative", kk: "Қиын жағдайда әдетте бастаманы өз қолыма аламын" } },
  { id: "p16", trait: "leadership", text: { ru: "Мне нравится ставить цели для команды и вести к ним", en: "I like setting goals for a team and leading it toward them", kk: "Команда үшін мақсат қойып, соған бастап апаруды ұнатамын" } },

  { id: "p17", trait: "structure", text: { ru: "Мне важно, чтобы у задачи был чёткий план и порядок", en: "It matters to me that a task has a clear plan and order", kk: "Тапсырманың нақты жоспары мен реті болғаны маған маңызды" } },
  { id: "p18", trait: "structure", text: { ru: "Я чувствую дискомфорт, когда вокруг беспорядок или хаос", en: "I feel uneasy when things around me are messy or chaotic", kk: "Айналамда ретсіздік болса, өзімді жайсыз сеземін" } },
  { id: "p19", trait: "structure", text: { ru: "Я стараюсь заранее продумать все детали", en: "I try to think through all the details in advance", kk: "Барлық егжей-тегжейді алдын ала ойластыруға тырысамын" } },
  { id: "p20", trait: "structure", text: { ru: "Мне важно доводить начатое до конца по плану", en: "It matters to me to finish what I started, according to plan", kk: "Бастаған ісімді жоспар бойынша аяғына дейін жеткізу маған маңызды" } },

  { id: "p21", trait: "adaptability", text: { ru: "Я легко перестраиваюсь, если планы внезапно меняются", en: "I adjust easily when plans suddenly change", kk: "Жоспарлар кенеттен өзгерсе, оңай бейімделемін" } },
  { id: "p22", trait: "adaptability", text: { ru: "Новая, неопределённая ситуация скорее вдохновляет меня, чем пугает", en: "A new, uncertain situation tends to excite me more than scare me", kk: "Жаңа, беймәлім жағдай мені қорқытудан гөрі көбірек шабыттандырады" } },
  { id: "p23", trait: "adaptability", text: { ru: "Мне несложно работать сразу над несколькими разными задачами", en: "I don't find it hard to work on several different tasks at once", kk: "Бірден бірнеше түрлі тапсырмамен жұмыс істеу маған қиын емес" } },
  { id: "p24", trait: "adaptability", text: { ru: "Я быстро нахожу выход, если что-то пошло не по плану", en: "I quickly find a way out when something goes off-plan", kk: "Бірдеңе жоспар бойынша болмай қалса, тез шығар жол табамын" } },

  { id: "p25", trait: "empathy", text: { ru: "Мне важно, чтобы люди вокруг меня чувствовали себя хорошо", en: "It matters to me that the people around me feel good", kk: "Айналамдағы адамдардың көңіл-күйі жақсы болғаны маған маңызды" } },
  { id: "p26", trait: "empathy", text: { ru: "Я стараюсь понять человека, даже если не согласен с ним", en: "I try to understand a person even when I disagree with them", kk: "Адаммен келіспесем де, оны түсінуге тырысамын" } },
  { id: "p27", trait: "empathy", text: { ru: "Чужая боль или радость откликается во мне по-настоящему", en: "Someone else's pain or joy genuinely resonates with me", kk: "Басқа адамның қуанышы мен қайғысы менің жүрегіме шын мәнінде әсер етеді" } },
  { id: "p28", trait: "empathy", text: { ru: "Мне важно помогать другим, даже если это не моя задача", en: "Helping others matters to me even when it's not my job", kk: "Бұл менің міндетім болмаса да, басқаларға көмектесу маған маңызды" } },

  { id: "p29", trait: "drive", text: { ru: "Я готов долго работать над целью, даже без быстрого результата", en: "I'm willing to work toward a goal for a long time, even without quick results", kk: "Тез нәтиже болмаса да, мақсат үшін ұзақ уақыт жұмыс істеуге дайынмын" } },
  { id: "p30", trait: "drive", text: { ru: "Трудности скорее подстёгивают меня, чем останавливают", en: "Difficulties tend to push me forward rather than stop me", kk: "Қиындықтар мені тоқтатудан гөрі көбірек алға жетелейді" } },
  { id: "p31", trait: "drive", text: { ru: "Мне важно становиться лучше в том, что я делаю", en: "It matters to me to keep getting better at what I do", kk: "Істеп жатқан ісімде жақсарып отыруым маған маңызды" } },
  { id: "p32", trait: "drive", text: { ru: "Я редко откладываю важные дела надолго", en: "I rarely put off important things for long", kk: "Маңызды істерді сирек ұзақ уақытқа кейінге қалдырамын" } },
];

const CAREER_QUESTIONS = [
  { id: "c1", track: "realistic", text: { ru: "Мне нравится работать руками и видеть результат сразу", en: "I like working with my hands and seeing results right away", kk: "Қолыммен жұмыс істеп, нәтижесін бірден көргенді ұнатамын" } },
  { id: "c2", track: "realistic", text: { ru: "Мне интересно, как устроены механизмы и техника", en: "I'm curious how mechanisms and technical things work", kk: "Механизмдер мен техниканың қалай құрылғанына қызығамын" } },
  { id: "c3", track: "realistic", text: { ru: "Я предпочту практическую задачу теоретической дискуссии", en: "I'd rather tackle a practical task than a theoretical discussion", kk: "Теориялық талқылаудан гөрі практикалық тапсырманы жөн көремін" } },

  { id: "c4", track: "investigative", text: { ru: "Мне нравится разбираться в сложных научных или технических вопросах", en: "I enjoy digging into complex scientific or technical questions", kk: "Күрделі ғылыми немесе техникалық мәселелерді зерттегенді ұнатамын" } },
  { id: "c5", track: "investigative", text: { ru: "Я люблю искать ответы через анализ и эксперименты", en: "I like finding answers through analysis and experiments", kk: "Жауапты талдау мен тәжірибе арқылы іздегенді ұнатамын" } },
  { id: "c6", track: "investigative", text: { ru: "Мне интересно узнавать, как устроен мир на глубоком уровне", en: "I'm curious about how the world works at a deep level", kk: "Әлемнің терең деңгейде қалай құрылғанын білгім келеді" } },

  { id: "c7", track: "artistic", text: { ru: "Мне важно самовыражение через творчество", en: "Self-expression through creativity matters to me", kk: "Шығармашылық арқылы өзімді көрсету маған маңызды" } },
  { id: "c8", track: "artistic", text: { ru: "Я люблю создавать что-то новое: тексты, образы, музыку, дизайн", en: "I love creating new things — writing, visuals, music, design", kk: "Жаңа нәрсе жасауды ұнатамын: мәтін, бейне, музыка, дизайн" } },
  { id: "c9", track: "artistic", text: { ru: "Мне нравится работа, где нет жёстких рамок и шаблонов", en: "I like work that isn't boxed in by rigid rules and templates", kk: "Қатаң шеңбер мен үлгісі жоқ жұмысты ұнатамын" } },

  { id: "c10", track: "social", text: { ru: "Мне важно, чтобы моя работа помогала другим людям", en: "It matters to me that my work helps other people", kk: "Жұмысымның басқа адамдарға пайдасы тигені маған маңызды" } },
  { id: "c11", track: "social", text: { ru: "Мне интересно обучать, консультировать или поддерживать людей", en: "I'm drawn to teaching, advising, or supporting people", kk: "Адамдарды оқыту, кеңес беру немесе қолдау маған қызық" } },
  { id: "c12", track: "social", text: { ru: "Я получаю удовлетворение, когда вижу, что помог кому-то вырасти", en: "I feel fulfilled when I see I've helped someone grow", kk: "Біреудің өсуіне көмектескенімді көргенде қанағаттанамын" } },

  { id: "c13", track: "enterprising", text: { ru: "Мне интересно запускать новые проекты и вести переговоры", en: "I'm drawn to launching new projects and negotiating deals", kk: "Жаңа жобаларды бастап, келіссөз жүргізу маған қызық" } },
  { id: "c14", track: "enterprising", text: { ru: "Мне нравится брать на себя риск ради результата", en: "I like taking on risk in order to get results", kk: "Нәтиже үшін тәуекелге баруды ұнатамын" } },
  { id: "c15", track: "enterprising", text: { ru: "Я хочу видеть, как мои решения влияют на бизнес или проект", en: "I want to see how my decisions affect a business or project", kk: "Шешімдерімнің бизнеске немесе жобаға қалай әсер ететінін көргім келеді" } },

  { id: "c16", track: "conventional", text: { ru: "Мне комфортно работать с чёткими процессами и правилами", en: "I'm comfortable working within clear processes and rules", kk: "Нақты процестер мен ережелермен жұмыс істеу маған қолайлы" } },
  { id: "c17", track: "conventional", text: { ru: "Мне нравится наводить порядок в данных, документах, системах", en: "I like bringing order to data, documents, and systems", kk: "Деректерді, құжаттарды, жүйелерді ретке келтіруді ұнатамын" } },
  { id: "c18", track: "conventional", text: { ru: "Мне важна стабильность и предсказуемость в работе", en: "Stability and predictability at work matter to me", kk: "Жұмыста тұрақтылық пен болжамдылық маған маңызды" } },
];

const OPEN_QUESTIONS = [
  { id: "o1", text: { ru: "Опишите момент, который сильно изменил то, как вы смотрите на себя.", en: "Describe a moment that significantly changed how you see yourself.", kk: "Өзіңізге деген көзқарасыңызды түбегейлі өзгерткен сәтті сипаттаңыз." } },
  { id: "o2", text: { ru: "Какая ситуация в жизни давалась вам тяжелее всего — и что помогло вам через неё пройти?", en: "What situation in your life was hardest for you — and what helped you get through it?", kk: "Өміріңіздегі ең қиын жағдай қандай болды және одан өтуге не көмектесті?" } },
  { id: "o3", text: { ru: "Чем вы гордитесь больше всего в том, как вы справляетесь с трудностями?", en: "What are you most proud of in how you handle difficulties?", kk: "Қиындықтарды жеңу тәсіліңізде өзіңізді ең нені мақтан тұтасыз?" } },
  { id: "o4", text: { ru: "Что вы хотели бы в себе изменить или развить в ближайший год?", en: "What would you like to change or develop in yourself in the coming year?", kk: "Келесі бір жылда өзіңізде нені өзгерткіңіз немесе дамытқыңыз келеді?" } },
];
