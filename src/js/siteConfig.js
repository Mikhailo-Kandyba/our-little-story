/**
 * ============================================================
 *  SITE CONFIG — увесь персональний контент тут
 * ============================================================
 * Фото: src/img/memories/memory-01.jpg …
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
    date: 'Березень 2024',
    title: 'Перша зустріч',
    text: 'Коротка розмова, яка чомусь не відчувалась короткою. Placeholder — перепиши.',
    image: 'img/memories/memory-01.jpg'
  },
  {
    id: 'date',
    date: 'Квітень 2024',
    title: 'Перше побачення',
    text: 'Між хвилюванням і сміхом. Placeholder для того вечора.',
    image: 'img/memories/memory-02.jpg'
  },
  {
    id: 'evening',
    date: 'Червень 2024',
    title: 'Звичайний вечір',
    text: 'Нічого особливого в календарі. А в памʼяті — один із найкращих.',
    image: 'img/memories/memory-03.jpg'
  },
  {
    id: 'funny',
    date: 'Серпень 2024',
    title: 'Смішний момент',
    text: 'Ти знаєш який. Деталі — за тобою.',
    image: 'img/memories/memory-04.jpg'
  },
  {
    id: 'important',
    date: 'Жовтень 2024',
    title: 'Важливий день',
    text: 'Не гучний. Просто важливий.',
    image: 'img/memories/memory-05.jpg'
  },
  {
    id: 'today',
    date: 'Сьогодні',
    title: 'Сьогодні',
    text: 'І ось ми тут — дивимось назад трохи уважніше.',
    image: 'img/memories/memory-06.jpg'
  }
];

export const memories = [
  {
    id: 'm1',
    image: 'img/memories/memory-01.jpg',
    date: 'Весна 2024',
    text: 'Світло того дня було мʼякшим, ніж зазвичай.',
    caption: 'мʼяке світло'
  },
  {
    id: 'm2',
    image: 'img/memories/memory-02.jpg',
    date: 'Літо 2024',
    text: 'Прогулянка, яка затягнулась довше, ніж планували.',
    caption: 'довга прогулянка'
  },
  {
    id: 'm3',
    image: 'img/memories/memory-03.jpg',
    date: 'Пізній вечір',
    text: 'Музика десь поруч. Майже нічого не сказано. Майже все зрозуміло.',
    caption: 'тиша поруч'
  },
  {
    id: 'm4',
    image: 'img/memories/memory-04.jpg',
    date: 'Вівторок',
    text: 'Звичайні дні потім дивують найбільше.',
    caption: 'звичайний вівторок'
  },
  {
    id: 'm5',
    image: 'img/memories/memory-05.jpg',
    date: 'Осінь',
    text: 'Холодне повітря, тепла кава, речення, яке досі памʼятаю.',
    caption: 'осіння кава'
  },
  {
    id: 'm6',
    image: 'img/memories/memory-06.jpg',
    date: 'Одна ніч',
    text: 'Така тиша, яка відчувається як довіра.',
    caption: 'тиха ніч'
  },
  {
    id: 'm7',
    image: 'img/memories/memory-07.jpg',
    date: 'Десь поміж',
    text: 'Деталь настільки дрібна, що не мала б значення. Має.',
    caption: 'дрібниця'
  },
  {
    id: 'm8',
    image: 'img/memories/memory-08.jpg',
    date: 'Пізніше',
    text: 'Дивитись на це зараз — мʼякше і ясніше.',
    caption: 'трохи пізніше'
  }
];

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
