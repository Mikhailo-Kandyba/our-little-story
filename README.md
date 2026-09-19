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

## Сповіщення (Telegram)

Фронтенд викликає `POST /api/telegram` (`NOTIFY_ENDPOINT` у `src/js/siteConfig.js`).
Секрети — лише Cloudflare runtime secrets. Див. `api/README.md`.

## Cloudflare Workers

```bash
npm run build:site
npx wrangler deploy
```

Або одним кроком: `npm run deploy`.

## Структура

- `landings/land-story/` — конфіг лендингу
- `src/components/` — секції сайту
- `src/js/` — логіка
- `src/img/memories/` — фото спогадів
- `api/notify.js` — serverless notify endpoint
