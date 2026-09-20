/**
 * ============================================================
 *  SITE CONFIG — увесь персональний контент тут
 * ============================================================
 * Фото: src/img/memories/memory-01.jpg …
 * Відео: MP4 (H.264 + AAC) на Cloudflare R2 (див. R2_MEDIA_BASE_URL).
 *   { type: 'video', src: R2_MEDIA_BASE_URL + '/clip.mp4', poster: 'img/memories/poster.jpeg', title: '...', text: '...' }
 *   poster необовʼязковий. Поле image теж підходить замість src.
 * Аудіо (опційно): src/audio/ambient.mp3
 *
 * NOTIFY_ENDPOINT — публічний Worker endpoint (/api/telegram).
 * Секрети Telegram туди НЕ класти — лише Cloudflare runtime secrets.
 */

export const girlName = 'Настя';
export const authorName = 'Міша';

export const CONTACT_URL = '#';

/** Публічний endpoint. Порожній рядок = симуляція (console + sessionStorage). */
export const NOTIFY_ENDPOINT = '/api/telegram';

/** Публічний Cloudflare R2 base. Відео не класти в src/img — лише зовнішні URL. */
export const R2_MEDIA_BASE_URL =
  'https://pub-31f945531ebd449a91b3af7e180695d8.r2.dev';

export const ambientAudio = 'audio/ambient.mp3';

export const intro = {
  greeting: `Привіт, Настю 💗`,
  text: 'Я міг просто написати тобі повідомлення.\nАле вирішив зробити дещо цікавіше.',
  button: 'Відкрити ✨'
};

export const story = {
  heading: 'Дещо варто памʼятати.',
  paragraphs: [
    'Не тому, що все було ідеально.',
    'А тому, що було по-справжньому — тихі вечори, незакінчені жарти, звичайні дні, які чомусь залишились.',
    'Тут можна замінити цей текст на свій.'
  ]
};

export const timeline = [
  {
    id: 'meet',
    type: 'video',
    date: '31 Жовтня 2025',
    title: 'Перша зустріч',
    text: 'З цього все почалося 🤍' +
      'Звичайний вечір, звичайне відео… А поруч дівчина, яка згодом стала для мене зовсім не звичайною.',
    image: R2_MEDIA_BASE_URL + '/1-meet.mp4'
  },
  {
    id: 'date',
    type: 'video',
    date: '18 грудня 2025',
    title: 'Наше перше побачення 🤍',
    text: 'Останній ряд, мультик і момент, коли я вперше взяв тебе за руку. Пам’ятаю це тепло досі. Потім ми ще довго гуляли, я проводжав тебе додому… і зовсім не хотів, щоб цей вечір закінчувався. 🥺',
    image: R2_MEDIA_BASE_URL + '/1-date.mp4'
  },
  {
    id: 'evening',
    date: '26 Грудня 2025',
    title: 'Наш вечір «Холостяка» 🌹',
    text: 'Я просто хотів тебе порадувати, тому влаштував нам маленький тематичний вечір. Пам’ятаю твою реакцію і те, як тобі все сподобалося. Такі наші вечори я згадую з особливим теплом. 🤍',
    image: 'img/memories/1-night.jpeg'
  },
  {
    id: 'today',
    type: 'video',
    date: '28 Грудня 2025',
    title: 'Коли ми просто дуріли 😂🤍',
    text: 'Я вже навіть не пам’ятаю, що саме намагався тут повторити 😂 Але пам’ятаю тебе за камерою, наш сміх і те, як легко нам було разом. Саме з таких маленьких і трохи дурних моментів і складаються мої найтепліші спогади про нас.',
    image: R2_MEDIA_BASE_URL + '/1-funny-1.mp4'
  },
  {
    id: 'funny',
    type: 'video',
    date: '18 Січня 2026',
    title: 'Один із тих моментів, де просто ми 🤍',
    text: 'Блекаут, одна лампочка, якийсь рілс, який ми вирішили повторити, і купа сміху. Ти поруч, обіймаєш мене, цілуєш, ми дуріємо… І мені в той момент більше нічого не було потрібно. Просто було дуже тепло з тобою. 🥺',
    image: R2_MEDIA_BASE_URL + '/1-funny.mp4'
  },
  {
    id: 'important',
    date: '19 Січня 2026',
    title: 'Такі ж ніжні, як ти 🤍',
    text: 'Наступного дня я подарував тобі ці квіти. Просто тому, що мені хотілося тебе радувати. Бачити твою посмішку і знати, що я став її причиною. 🌸',
    image: 'img/memories/1-flowers.jpeg'
  },
  {
    id: 'meet',
    type: 'video',
    date: '16 Лютого 2025',
    title: 'Той самий вечір 🤍',
    text: 'Мабуть, один із найтепліших наших вечорів. Будиночок, вогонь у каміні, я наготував нам смачної їжі, ми відкрили вино, обіймалися й дивилися «Том і Джеррі». У той момент ми просто були разом і були безмежно щасливі. Хотілося, щоб цей вечір ніколи не закінчувався. 🥺🤍',
    image: R2_MEDIA_BASE_URL + '/video-6.mp4'
  },
  {
    id: 'important',
    date: '2 Травня 2026',
    title: ' ',
    text: 'Просто стояли, говорили, пили каву і нас випадково сфотографували. Нічого особливого, але саме такі прості моменти поруч із тобою чомусь і запам’ятовуються найбільше. ☕️🤍',
    image: 'img/memories/memory-22.jpeg'
  },
  {
    id: 'important',
    date: '3 Травня 2026',
    title: 'Разом у Карпатах 🤍',
    text: 'Одне з тих фото, яке я дуже люблю. Ми разом, навколо гори, ти поруч така красива і рідна. Дивлюся на нього і згадую, як мені було добре просто бути біля тебе. 🥺🤍',
    image: 'img/memories/memory-19.jpeg'
  },
  {
    id: 'important',
    date: '4 Травня 2026',
    title: 'Саме те фото 🤍',
    text: 'Я дуже хотів, щоб у нас було таке фото де ми поруч, закохані, де я дивлюся на тебе і просто щасливий, що ти зі мною. І саме цю фотографію я потім обрав, коли надсилав тобі букет. Мабуть, тому що для мене вона завжди була про нас. 🥺🤍',
    image: 'img/memories/memory-01.jpeg'
  },
  {
    id: 'important',
    date: '6 Червень 2026',
    title: 'Наше побачення 🤍',
    text: 'Я просто хотів повести тебе в гарне місце, де ми зможемо побути разом і насолодитися видом. Пам’ятаю, як тобі сподобався цей заклад, і мені від цього було ще приємніше. Просто ще один теплий вечір удвох. 🥺',
    image: 'img/memories/memory-13.jpeg'
  },
  {
    id: 'important',
    date: '13 Червень 2026',
    title: 'Наче закохався в тебе знову 🤍',
    text: 'Пам’ятаю, як ти прийшла на це побачення в тій білій шовковій сукні. Я дивився на тебе і відчував себе так, ніби закохуюсь у тебе вперше. Ти була неймовірно красивою, і я просто не міг намилуватися тобою. 🥺🤍',
    image: 'img/memories/memory-12.jpeg'
  },
  {
    id: 'important',
    date: '13 Червень 2026',
    title: 'Наш букет, зібраний разом 🌹',
    text: 'Ти захотіла поскладати Lego й обрала саме цей букет. Пам’ятаю, як ми сиділи удвох і потроху збирали його разом. Здається, він і досі стоїть у тебе маленьке нагадування про наші теплі вечори й час, коли нам просто було добре поруч. 🤍',
    image: 'img/memories/memory-15.jpeg'
  },
  {
    id: 'meet',
    type: 'video',
    date: '26 Жовтня 2026',
    title: 'Твій маленький затишок 🤍',
    text: 'Я подарував тобі ці квіти, а ти так красиво все облаштувала на балконі, влаштувала цілу фотосесію і виставила в сторіс. Пам’ятаю, як мені було приємно дивитися на це й знати, що тобі сподобалось. 🌸',
    image: R2_MEDIA_BASE_URL + '/video-13.mp4'
  },
];

export const memories = [
  {
    id: 'm2',
    image: 'img/memories/memory-02.jpeg',
    date: 'Фото, яке досі зі мною 🤍',
    text: 'Я дуже хотів зробити саме це фото. Воно настільки мені сподобалося, що я поставив його на заставку телефона. І знаєш, воно досі там. Дивлюся на нього і щоразу згадую нас і ті теплі моменти. 🥺🤍',
    caption: ' '
  },
  {
    id: 'm3',
    image: 'img/memories/memory-03.jpeg',
    date: 'Звичайний вечір удвох 🤍',
    text: 'Нічого особливого просто ми вдома, а я стою й заплітаю тобі косичку. Але саме з таких простих дрібниць і складалися наші найтепліші вечори. 🥺',
    caption: ' '
  },
  {
    id: 'm4',
    image: 'img/memories/memory-04.jpeg',
    date: 'Той самий обруч 😄🤍',
    text: 'Тобі тільки прийшов цей обруч, і ми одразу почали сміятися, наскільки він схожий на обруч твоєї подруги. Звичайний момент, але я пам’ятаю, як нам було весело разом.',
    caption: ' '
  },
  {
    id: 'm5',
    image: 'img/memories/memory-05.jpeg',
    date: 'Ті самі кульки ❤️',
    text: 'Красиво стояли вдень і регулярно лякали мене серед ночі 😂',
    caption: ''
  },
  {
    id: 'm6',
    image: 'img/memories/memory-06.jpeg',
    date: 'Ти, я і трохи снігу ❄️',
    text: ' ',
    caption: ' '
  },
  {
    id: 'm7',
    image: 'img/memories/memory-07.jpeg',
    date: 'Наші маленькі дурощі',
    text: ' ',
    caption: ' '
  },
  {
    id: 'm8',
    image: 'img/memories/memory-08.jpeg',
    date: 'І ще один теплий спогад 🤍',
    text: ' ',
    caption: ' '
  },
  {
    id: 'm9',
    image: 'img/memories/memory-09.jpeg',
    date: 'Фото, в яке я закохуюсь щоразу 🤍',
    text: 'Скільки б разів я на нього не дивився щоразу закохуюсь у тебе, наче вперше. Ти тут неймовірно красива. 🥺',
    caption: ' '
  },
  {
    id: 'm10',
    image: 'img/memories/memory-10.jpeg',
    date: 'Ну тут без зайвих слів… 😏',
    text: 'Твоє неймовірне тіло, ця спинка і попа, від якої я досі втрачаю голову. Ти для мене тут просто вау. ❤️‍🔥',
    caption: ''
  },
  {
    id: 'm11',
    image: 'img/memories/memory-11.jpeg',
    date: 'Разом в офіс 🤍',
    text: 'Того дня ми просто пішли в офіс удвох. Звичайний день, але мені було класно просто від того, що ми разом. 🥰',
    caption: ' '
  },
  {
    id: 'm14',
    image: 'img/memories/memory-14.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm16',
    image: 'img/memories/memory-16.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm17',
    image: 'img/memories/memory-17.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm18',
    image: 'img/memories/memory-18.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm20',
    image: 'img/memories/memory-20.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm21',
    image: 'img/memories/memory-21.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm23',
    image: 'img/memories/memory-23.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm24',
    image: 'img/memories/memory-24.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm25',
    image: 'img/memories/memory-25.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm26',
    image: 'img/memories/memory-26.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm27',
    image: 'img/memories/memory-27.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm28',
    image: 'img/memories/memory-28.jpeg',
    date: '',
    text: '',
    caption: ''
  },
  {
    id: 'm29',
    image: 'img/memories/memory-29.jpeg',
    date: '',
    text: '',
    caption: ''
  }
];

/** Нові відео з R2 (video-1…video-13). Підписи додаси пізніше. */
export const videoMoments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (n) {
  return {
    id: 'v' + n,
    type: 'video',
    src: R2_MEDIA_BASE_URL + '/video-' + n + '.mp4',
    date: '',
    text: '',
    title: ''
  };
});

export const reactions = ['❤️', '🥹', '😂', '✨'];

export const questions = [
  {
    question: 'Де було наше перше побачення?',
    answers: ['Той маленький заклад у центрі', 'Біля річки', 'У галасливій кавʼярні'],
    correct: 0,
    successText: 'Так. Я теж памʼятаю.'
  },
  {
    question: 'Що ми завжди замовляли?',
    answers: ['Щось солодке', 'Щось, що ніколи не доїдали', 'Те, що радили'],
    correct: 1,
    successText: 'Досі смішно згадувати.'
  },
  {
    question: 'Що завжди грало на фоні?',
    answers: ['Тиша', 'Той самий плейлист', 'Міський шум'],
    correct: 1,
    successText: 'Іноді досі чую.'
  },
  {
    question: 'Що робило звичайні дні іншими?',
    answers: ['Погода', 'Час', 'Ти'],
    correct: 2,
    successText: 'Деякі відповіді прості.'
  }
];

export const quizFinale = 'Дещо дивовижно важко забути.';

export const moods = [
  { id: 'sad', emoji: '😔', label: 'Не дуже' },
  { id: 'meh', emoji: '😕', label: 'Так собі' },
  { id: 'calm', emoji: '😌', label: 'Спокійно' },
  { id: 'good', emoji: '🙂', label: 'Добре' },
  { id: 'great', emoji: '🥰', label: 'Дуже добре' }
];

export const moodSection = {
  heading: 'Як ти сьогодні? 💭',
  subheading: 'Можеш просто залишити одну маленьку відповідь.',
  noteLabel: 'Хочеш щось додати?',
  notePlaceholder: 'Необовʼязково…',
  submit: 'Надіслати 💌',
  thanks: 'Дякую 💗'
};

/**
 * Атмосфера сайту після вибору настрою.
 * Кольори — у SCSS: [data-mood="…"] (site/mood-theme.scss).
 * Тут — повідомлення + поведінка floating elements.
 */
export const moodAtmosphere = {
  sad: {
    message: 'Тоді сьогодні тут буде трохи спокійніше 🤍',
    symbols: ['✨', '☁️'],
    countDesktop: 4,
    countMobile: 3,
    speed: 1.35,
    opacity: 0.16,
    scale: 0.9
  },
  meh: {
    message: 'Нехай хоча б тут буде трохи затишніше ✨',
    symbols: ['♡', '✨'],
    countDesktop: 6,
    countMobile: 4,
    speed: 1.2,
    opacity: 0.2,
    scale: 0.95
  },
  calm: {
    message: 'Спокійний режим увімкнено 🌸',
    symbols: ['🌸', '✨', '♡'],
    countDesktop: 8,
    countMobile: 5,
    speed: 1.1,
    opacity: 0.22,
    scale: 1
  },
  good: {
    message: 'О, тоді додамо трохи більше світла ✨',
    symbols: ['💗', '✨', '🌸', '♡'],
    countDesktop: 10,
    countMobile: 6,
    speed: 0.9,
    opacity: 0.28,
    scale: 1.05
  },
  great: {
    message: 'Тоді сьогодні можна трохи більше сердечок 💗',
    symbols: ['💗', '♡', '✨', '🌸'],
    countDesktop: 12,
    countMobile: 7,
    speed: 0.78,
    opacity: 0.34,
    scale: 1.1,
    sparkle: true
  }
};

export const MOOD_STORAGE_KEY = 'selectedMood';

export const message = {
  heading: 'А тепер — серйозно.',
  paragraphs: [
    'Минув деякий час.',
    'Я не робив цю сторінку, щоб на щось тиснути.',
    'Просто хотів сказати дещо інакше, ніж у ще одному довгому повідомленні.',
    'Що б не було далі — я вдячний за моменти, які були справжніми.'
  ]
};

export const finalSection = {
  heading: 'Хочеш поговорити?',
  subheading: 'Без тиску. Просто варіант.',
  choices: {
    meet: 'Побачитися',
    call: 'Зідзвонитися',
    text: 'Просто написати'
  },
  choiceHints: {
    meet: '☕',
    call: '📞',
    text: '💬'
  },
  textFlow: {
    title: 'Це теж добре.',
    button: 'Написати мені'
  },
  callIntro: 'Обери час, коли можна поговорити без поспіху.',
  meetIntro: 'Обери день, який здається легким — без поспіху.',
  confirmBtn: 'Обрати цей час',
  pickDate: 'Обери дату',
  pickTime: 'Доступний час',
  back: '← Назад',
  confirmTitle: 'Підтвердження'
};

export const closing = {
  title: 'Дякую, що додивилась до кінця.',
  text: 'Тут немає правильної відповіді.\nЯ просто хотів зробити для тебе щось особливе.',
  signature: 'Міша'
};

export const availableDates = {
  '2026-09-21': ['18:00', '19:00', '20:00'],
  '2026-09-22': ['18:30', '20:00'],
  '2026-09-24': ['19:00', '20:30'],
  '2026-09-26': ['17:00', '18:00', '19:30'],
  '2026-09-28': ['16:00', '18:00']
};

export const availableCallDates = {
  '2026-09-21': ['12:00', '15:00', '21:00'],
  '2026-09-23': ['13:00', '19:00'],
  '2026-09-25': ['11:00', '18:30', '20:00'],
  '2026-09-27': ['14:00', '21:00']
};

export const betweenSections = [
  'Деяким моментам не потрібен підпис.',
  'Усе ще тут.',
  'Мʼяко.'
];

export const confirmationCopy = {
  title: 'Добре.',
  subtitle: 'Я буду.',
  change: 'Змінити час'
};

export const randomMemory = {
  heading: 'Випадковий спогад ✨',
  button: 'Що випаде цього разу?'
};

export const carouselSection = {
  eyebrow: 'Стрічка спогадів',
  heading: 'Моменти, які я памʼятаю',
  lead: 'Гортай — мишкою, пальцем або стрілками.'
};

export const videoMomentsSection = {
  eyebrow: 'Відео',
  heading: 'Наші моменти 🎥',
  lead: 'Гортай між відео — мишкою, пальцем або стрілками.'
};

export const polaroidSection = {
  eyebrow: 'Polaroid',
  heading: 'Картки, які можна змахнути',
  lead: 'Свайпни або натисни — верхня картка відлетить.'
};

export const easterEggs = {
  heartClicks: 3,
  heartMessage: 'Ти знайшла маленьке серце 💗',
  secretPhotoId: 'm3',
  secretNote: 'Ця фотографія знає більше, ніж здається.'
};

export const ui = {
  openMemory: 'Відкрити спогад',
  close: 'Закрити',
  prev: 'Попереднє',
  next: 'Наступне',
  questionOf: 'Питання',
  of: 'з',
  quizSoft: 'Майже — я памʼятаю трохи інакше.',
  timelineEyebrow: 'Хронологія',
  timelineTitle: 'Наша історія',
  timelineLead: 'Моменти в тому порядку, як вони досі приходять.',
  storyEyebrow: 'Початок',
  quizEyebrow: 'Тихі питання',
  quizTitle: 'А ти памʼятаєш?',
  bookingTitle: 'Коли тобі зручно?',
  sending: 'Надсилаю…',
  sendError: 'Не вийшло надіслати. Спробуй ще раз трохи згодом.'
};

/**
 * ============================================================
 *  STORY GAME — «Збери нашу історію»
 * ============================================================
 * Замінюй фото / тексти / звуки тут. Не чіпай selectedMood.
 * Звуки (опційно): src/audio/game-*.mp3 — див. audio/README.txt
 */
export const GAME_STORAGE_KEY = 'storyGameProgress';

export const gameSection = {
  eyebrow: 'Маленька гра',
  heading: 'У мене є для тебе маленька гра 💗',
  lead: 'Пʼять розділів. Пʼять фрагментів серця. Одна спільна історія.',
  startButton: 'Почати'
};

export const gameContent = {
  title: 'Збери нашу історію',
  titleWithHeart: 'Збери нашу історію 💗',
  subtitle: 'Деякі моменти залишаються з нами довше, ніж ми думаємо.',
  startStory: 'Почати історію',
  close: 'Закрити гру',
  restart: 'Почати спочатку',
  fragmentsLabel: 'Фрагменти',
  chapterTransitionMs: 900,

  // --- Chapter 1: fog reveal ---
  reveal: {
    title: 'Спогад №1',
    subtitle: 'Іноді достатньо стерти трохи туману...',
    photo: 'img/memories/memory-01.jpeg',
    photoAlt: 'Спогад — фото для розкриття',
    progressLabel: 'Спогад відкрито на',
    completeAt: 0.75,
    afterReveal: 'Памʼятаєш цей момент? 💗',
    choices: [
      'Так, звісно 🥹',
      'Щось пригадую 😌',
      'Тепер точно памʼятаю ❤️'
    ]
  },

  // --- Chapter 2: catch moments ---
  catch: {
    title: 'Лови хороші моменти',
    subtitle: 'Хороші моменти іноді пролітають дуже швидко.',
    durationSec: 20,
    scoreLabel: 'Зібрано моментів:',
    endLabel: 'Ти зібрала',
    endSuffix: 'хороших моментів 💗',
    polaroidPhotos: [
      'img/memories/memory-02.jpeg',
      'img/memories/memory-03.jpeg',
      'img/memories/memory-05.jpeg'
    ]
  },

  // --- Chapter 3: puzzle ---
  puzzle: {
    title: 'Склади момент',
    subtitle: 'Деякі речі складаються з маленьких шматочків.',
    photo: 'img/memories/memory-04.jpeg',
    photoAlt: 'Фото-пазл',
    helpButton: 'Трошки допомогти ✨',
    helpAfterMs: 12000,
    done: 'Готово 💗',
    afterText: 'Є моменти, які хочеться складати знову і знову.'
  },

  // --- Chapter 4: maze ---
  maze: {
    title: 'Лабіринт спогадів',
    subtitle: 'Пройди тихо. Чотири спогади чекають.',
    exitFound: 'Вихід знайдено ✨',
    objects: {
      photo: {
        icon: '📷',
        label: 'Фото',
        image: 'img/memories/memory-06.jpeg',
        text: 'Цей кадр досі світиться мʼяко.'
      },
      note: {
        icon: '💌',
        label: 'Нотатка',
        text: 'Деякі слова хочеться залишити тут, щоб вони не загубилися.'
      },
      memory: {
        icon: '✨',
        label: 'Спогад',
        text: 'Маленький момент, який чомусь залишився в памʼяті.'
      },
      music: {
        icon: '🎵',
        label: 'Музика',
        text: 'Тут може звучати наша пісня 🎵',
        audio: '' // наприклад: 'audio/game-memory.mp3'
      }
    }
  },

  // --- Chapter 5: hidden fragment ---
  hidden: {
    title: 'Залишився один фрагмент...',
    subtitle: 'Пошукай уважно серед спогадів.',
    decoyMessages: [
      'Не тут 😌',
      'Майже...',
      'Шукай далі ✨',
      'Тепліше 💗'
    ],
    collagePhotos: [
      'img/memories/memory-02.jpeg',
      'img/memories/memory-07.jpeg',
      'img/memories/memory-08.jpeg',
      'img/memories/memory-03.jpeg'
    ]
  },

  // --- Finale ---
  finale: {
    foundAll: 'Ти знайшла всі спогади.',
    oneQuestion: 'І залишилося лише одне маленьке питання...',
    question: 'Який момент ти хотіла б пережити ще раз? 💭',
    options: [
      'Одна з наших прогулянок',
      'Один із наших вечорів',
      'Одна з наших поїздок'
    ],
    customOption: 'Свій варіант',
    customPlaceholder: 'Напиши тут, якщо хочеш…',
    save: 'Зберегти відповідь 💗',
    thanks: 'Дякую, що пройшла цю маленьку історію 💗',
    replay: 'Переглянути спогади ще раз',
    backToSite: 'Повернутися на сайт',
    revealPhoto: 'img/memories/memory-05.jpeg'
  },

  // --- Optional SFX paths (empty = silent, game still works) ---
  sounds: {
    ui: '', // 'audio/game-ui.mp3'
    success: '', // 'audio/game-success.mp3'
    heart: '', // 'audio/game-heart.mp3'
    memory: '' // 'audio/game-memory.mp3'
  }
};
