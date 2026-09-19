# Our Little Story

Особистий інтерактивний сайт-історія ( Pug / SCSS / Webpack ).

## Розробка

```bash
cd landings/land-story
npm start
```

Білд:

```bash
cd landings/land-story
npm run build
```

Артефакти з’являться в `dist/land-story/`.

## Сповіщення

Фронтенд викликає лише публічний `POST` endpoint (`NOTIFY_ENDPOINT` у `src/js/siteConfig.js`).
Секрети живуть тільки в environment variables на сервері — див. `api/README.md`.

Потрібні змінні (email через Resend):

- `RESEND_API_KEY`
- `NOTIFY_TO_EMAIL`
- `NOTIFY_FROM_EMAIL` (опційно)

Без деплою API фронтенд симулює відправку через `sessionStorage`.

## Структура

- `landings/land-story/` — конфіг лендингу
- `src/components/` — секції сайту
- `src/js/` — логіка
- `src/img/memories/` — фото спогадів
- `api/notify.js` — serverless notify endpoint
