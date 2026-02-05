# User Service (FullstackNode)

Сервис управления пользователями по ТЗ: регистрация, авторизация, роли, статус, управление профилем и админ‑доступ. Проект включает backend на Express + MongoDB и простой frontend на Vite.

## Что реализовано по ТЗ
- Модель пользователя: **ФИО**, **дата рождения**, **email (уникальный)**, **пароль**, **роль (admin/user)**, **статус (active)**.
- Endpoint‑ы:
  - `POST /api/auth/register` — регистрация
  - `POST /api/auth/login` — авторизация
  - `GET /api/users/:id` — получить пользователя (admin или сам)
  - `GET /api/users` — список пользователей (только admin)
  - `PATCH /api/users/:id/block` — блокировка (admin или сам)
- Дополнительно:
  - `GET /api/auth/profile` — профиль текущего пользователя
  - `PUT /api/auth/update-profile` — обновление профиля
  - `POST /api/auth/logout` — выход
  - `GET /api/dashboard` — защищённый маршрут

## Технологии
- **Backend:** Node.js, Express, Mongoose, JWT (httpOnly cookies), CORS, Helmet, Rate Limiting
- **Frontend:** Vite, чистый HTML/CSS/JS
- **База:** MongoDB
- **Docker:** docker-compose (node:20 для frontend и backend)

## Структура проекта
- `backend/` — API, модели, middleware, миграции
- `frontend/` — статические страницы + JS
- `docker-compose.yml` — запуск инфраструктуры

## Модель пользователя
```json
{
  "fullName": "Иванов Иван Иванович",
  "birthDate": "1995-04-12",
  "email": "user@example.com",
  "username": "ivan95",
  "password": "hashed",
  "role": "user | admin",
  "isActive": true
}
```

## Авторизация (важно)
- JWT хранится в **httpOnly cookie** (без localStorage).
- Все защищённые запросы идут с `credentials: "include"`.
- Заблокированные пользователи не могут входить и получать данные.

## Переменные окружения
Файл: `backend/.env`
```
JWT_SECRET=super_long_random_value
MONGO_URI=mongodb://root:password@mongo:27017/auth-demo?authSource=admin
```

## Быстрый старт (Docker)
```bash
docker compose up --build
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

### Миграция существующих пользователей
```bash
docker compose exec web npm run migrate:users
```

## Запуск без Docker
```bash
cd backend
npm install
npm start
```
```bash
cd frontend
npm install
npm run dev
```

## Примеры запросов
### Регистрация
`POST /api/auth/register`
```json
{
  "fullName": "Иванов Иван Иванович",
  "birthDate": "1995-04-12",
  "email": "user@example.com",
  "username": "ivan95",
  "password": "secret123"
}
```

### Логин
`POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Получить пользователя по ID (admin или сам)
`GET /api/users/:id`

### Список пользователей (admin)
`GET /api/users`

### Блокировка пользователя (admin или сам)
`PATCH /api/users/:id/block`

## Безопасность
- `helmet()` для базовых заголовков
- `express-rate-limit` (200 запросов / 15 мин)
- `httpOnly` cookie для JWT

## Git и сдача на проверку
Рекомендуемый формат сдачи — ссылка на репозиторий:
```bash
git init
git add .
git commit -m "User service (TЗ)"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```

## Docker image (опционально)
Сейчас проект запускается через `docker-compose` с официальными образами `node:20`.  
Если требуется **собственный Docker image**, нужен `Dockerfile` (не включён по умолчанию).
Могу добавить Dockerfile и шаги сборки, если нужно.
