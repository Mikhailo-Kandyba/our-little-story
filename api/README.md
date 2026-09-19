# Notify API (Telegram)

Фронтенд викликає лише `POST /api/telegram` з JSON.
Секрети **не** потрапляють у bundle — лише Cloudflare Worker secrets.

## Runtime secrets

1. `TELEGRAM_BOT_TOKEN` — токен бота від @BotFather
2. `TELEGRAM_CHAT_ID` — ID чату/каналу для повідомлень

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

Локально: скопіюй `.dev.vars.example` → `.dev.vars` (файл у `.gitignore`).

## Payload types

- `mood` — `{ type, mood, emoji, message? }`
- `booking` — `{ type, bookingType, date, dateLabel?, time }`
- `reaction` — `{ type, memoryId, reaction }`

`chat_id` / token з клієнта **відхиляються**.

У `src/js/siteConfig.js` поле `NOTIFY_ENDPOINT` = `/api/telegram`.
Без Worker (локальний webpack) фронтенд симулює через `sessionStorage`.
