# Our Little Story

Особистий інтерактивний сайт-історія ( Pug / SCSS / Webpack ).

## Локальне середовище

- Node.js **v10.24.1**
- npm **6.14.12**

```bash
cd landings/land-story
npm start
```

Production build:

```bash
npm run build --prefix landings/land-story
# → dist/land-story/
```

## Сповіщення (Telegram)

Фронтенд викликає `POST /api/telegram`.
Секрети — лише Cloudflare runtime secrets (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
Див. `api/README.md`.

## Cloudflare Workers Builds (Git integration)

Не став `NODE_VERSION=10` на весь pipeline — Wrangler потребує сучасний Node.

| Dashboard setting | Value |
| --- | --- |
| Root directory | `/` (корінь репо) |
| Build command | `bash scripts/cf-build.sh` |
| Deploy command | `npx wrangler deploy` |
| Non-production deploy | `npx wrangler versions upload` |

**Build variables:**

| Variable | Value |
| --- | --- |
| `SKIP_DEPENDENCY_INSTALL` | `true` |

Не додавай `.nvmrc` з `10` у корінь — Cloudflare тоді перемкне весь build image на Node 10 і зламає Wrangler.

**Що робить кожен етап**

1. **Build** (`scripts/cf-build.sh`): через nvm ставить Node **10.24.1** / npm **6.14.12** → `npm install --ignore-engines` → webpack build → `dist/land-story`
2. **Deploy** (`npx wrangler deploy`): image Node **22/24** + Wrangler з `package.json` → Worker (`worker/index.js`) + static assets (`dist/land-story`).  
   `wrangler.jsonc` має `assets.run_worker_first: true`, щоб `POST /api/telegram` завжди потрапляв у Worker, а не в Assets 404.  
   Не використовуй `wrangler pages deploy` і не став Deploy command на assets-only.

**Runtime secrets** (Settings → Variables and Secrets, не Build vars):

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Локально після build:

```bash
npx wrangler deploy
# або: npm run deploy:full   (build + deploy на машині з Node 10 для build і Node 22+ для wrangler)
```

## Структура

- `landings/land-story/` — конфіг лендингу
- `src/components/` — секції сайту
- `src/js/` — логіка
- `src/img/memories/` — фото спогадів
- `api/telegram.js` — Telegram notify logic
- `worker/index.js` — Cloudflare Worker entry
- `scripts/cf-build.sh` — CI build для Workers Builds
