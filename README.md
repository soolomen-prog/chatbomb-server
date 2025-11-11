# chatbomb-server (Vercel)

Серверless API для чат-бота Chatbomb (автошкола START).  
Эндпоинты:
- `POST /api/chat` — обращение к OpenAI ChatGPT
- `GET  /api/ping` — проверка живости

## Деплой

1. Заливаешь в GitHub (этот репозиторий).
2. Подключаешь к Vercel → New Project → Import.
3. В Vercel → Project Settings → Environment Variables:
   - `OPENAI_API_KEY` = твой ключ OpenAI
4. Deploy.

## Формат запроса к /api/chat

```json
POST /api/chat
Content-Type: application/json

{
  "message": "Was kostet Klasse B?",
  "locale": "de",
  "biz": "school",
  "history": [
    { "role": "user", "content": "Hallo!" },
    { "role": "assistant", "content": "Hallo! Wie kann ich helfen?" }
  ]
}
