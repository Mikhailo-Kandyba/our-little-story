# Notify API (email)

Фронтенд викликає лише `POST /api/notify` з JSON.
Секрети **не** потрапляють у bundle.

## Що додати (один секрет + email)

1. `RESEND_API_KEY` — ключ з https://resend.com
2. `NOTIFY_TO_EMAIL` — твоя пошта
3. (опційно) `NOTIFY_FROM_EMAIL` — verified sender

У `src/js/siteConfig.js` поле `NOTIFY_ENDPOINT` — публічний URL функції
(наприклад `/api/notify` на тому ж домені після деплою).

Без деплою API фронтенд симулює відправку через `sessionStorage`.
