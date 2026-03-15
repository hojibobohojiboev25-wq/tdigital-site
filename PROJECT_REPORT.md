# Полный отчёт о проекте T.Digital (OrzuIT)

## 1. О проекте

**Название:** T.Digital (сайт OrzuIT)  
**Тип:** Многостраничный корпоративный сайт с админ-панелью, API и базой данных.  
**Назначение:** Визитка компании, каталог услуг и проектов, приём заказов и обращений через форму, уведомления в Telegram.

---

## 2. Языки программирования

| Язык        | Где используется |
|------------|-------------------|
| **HTML5**  | Все страницы сайта и админки (index, about, services, projects, contacts, founder; admin, admin-login, admin-home, admin-services, admin-about, admin-contacts, admin-projects, admin-orders, admin-telegram). |
| **CSS3**   | Стили сайта (`styles.css`), стили админки (`admin.css`). |
| **JavaScript** | Фронтенд: логика страниц, формы, навигация (`main.js`, `content.js`), админка (`admin-auth.js`, `admin-sections.js`, `admin-telegram.js`, `admin-orders.js`). Бэкенд: серверная логика в Node.js (API). |
| **Node.js (JavaScript)** | Серверная часть: API (Vercel Serverless Functions), работа с БД, авторизация, отправка в Telegram. |

Итого: **HTML, CSS, JavaScript** на фронте; **JavaScript (Node.js)** на бэкенде. Отдельных языков (PHP, Python, C# и т.д.) нет.

---

## 3. Технологии и стек

### Фронтенд
- **HTML5** — разметка страниц.
- **CSS3** — стили, адаптивная вёрстка, переменные (например, тёмная тема).
- **Ванильный JavaScript** — без фреймворков (React/Vue не используются). Загрузка контента через API, работа с формами, админ-логика.

### Бэкенд
- **Vercel Serverless Functions** — API развёрнут как serverless-функции в папке `api/`. Каждый файл = маршрут (например, `api/order.js` → `POST /api/order`).
- **Node.js** — среда выполнения серверного кода (CommonJS, `"type": "commonjs"` в package.json).

### База данных
- **PostgreSQL** — единственное хранилище структурированных данных.
- **Клиент БД:** библиотека `pg` (node-postgres), подключение по `DATABASE_URL` (SSL для не-localhost).

### Безопасность и авторизация
- **JWT (jsonwebtoken)** — токены для входа в админку, срок жизни 12 часов.
- **bcryptjs** — хеширование паролей администраторов (соль, 12 раундов).
- **JWT_SECRET** — секрет для подписи токенов (задаётся через переменные окружения).

### Внешние сервисы
- **Telegram Bot API** — отправка уведомлений о заказах/обращениях в чат (по желанию).
- **Vercel** — хостинг фронтенда и serverless API.

### Инструменты и окружение
- **Git** — версионирование.
- **npm** — зависимости (в проекте только runtime-зависимости: pg, bcryptjs, jsonwebtoken).
- **.env / Vercel Environment Variables** — секреты и настройки не хранятся в коде.

---

## 4. Где хранятся данные

Все постоянные данные хранятся **только в PostgreSQL**. Файловая система используется только для кода и статики (HTML/CSS/JS), не для данных.

### Таблицы в PostgreSQL

| Таблица              | Назначение | Основные поля |
|----------------------|------------|----------------|
| **admins**           | Учётные записи администраторов | id, username, password_hash, created_at, updated_at |
| **site_content**     | Контент сайта (одна запись) | id=1, data (JSONB), updated_at. В JSON: тексты главной, услуг, «О нас», контакты, проекты, категории и т.д. |
| **telegram_settings** | Настройки Telegram (одна запись) | id=1, chat_id, bot_token, updated_at |
| **orders**           | Заказы/обращения с формы | id, name, email, phone, service, message, created_at |

### Откуда что читается/пишется
- **Контент сайта** — из `site_content` (API `GET /api/content`, админка сохраняет через `PUT /api/admin/content`).
- **Админы** — логин по `admins`, пароль проверяется через bcrypt; после входа выдаётся JWT.
- **Заказы** — при отправке формы вызывается `POST /api/order`: заказ сохраняется в `orders` и (если настроено) отправляется в Telegram.
- **Список заказов в админке** — из `orders` через `GET /api/admin/orders`.
- **Telegram** — chat_id и bot_token берутся из `telegram_settings` или из переменных окружения (env имеет приоритет).

Файлы **не используются** для хранения контента, заказов или паролей — только БД.

---

## 5. Как хранятся данные

- **Строки (логин, пароль, заказы, настройки):** в таблицах PostgreSQL в виде текста или с параметризованными запросами (`$1`, `$2`, …), чтобы избежать SQL-инъекций.
- **Пароли:** только хеш bcrypt в `admins.password_hash`, не в открытом виде.
- **Контент сайта:** один JSON-объект в поле `site_content.data` (JSONB). Админка редактирует секции (главная, услуги, проекты и т.д.) — всё в этом JSON.
- **Заказы:** каждая отправка формы = одна строка в `orders` с датой `created_at` (TIMESTAMPTZ).
- **Секреты (JWT_SECRET, DATABASE_URL, пароль админа, Telegram):** только в переменных окружения (Vercel / .env), не в репозитории. В коде нет жёстко прописанных паролей или ключей.

---

## 6. Безопасность

### Реализовано
- **Пароли:** хранение только в виде bcrypt-хеша, сравнение через `bcrypt.compare`.
- **Админ-API:** все маршруты `/api/admin/*` и смена учётных данных требуют валидный JWT (`Authorization: Bearer <token>`). JWT проверяется секретом и сроком жизни.
- **Защита от SQL-инъекций:** все запросы к БД через параметризованные запросы (`pg` с `$1`, `$2`).
- **Секреты в окружении:** DATABASE_URL, JWT_SECRET, ADMIN_LOGIN, ADMIN_PASSWORD, Telegram — только env, не в коде. В репозитории есть только `.env.example` без реальных значений.
- **Разделение прав:** публичный доступ только к чтению контента и отправке заказа; изменение контента, заказов, настроек — только после входа в админку по JWT.
- **HTTPS:** на Vercel трафик по HTTPS (важно для передачи токена и паролей).

### Рекомендации для продакшена
- Задать **сильный JWT_SECRET** (длинная случайная строка).
- Задать **надёжный ADMIN_PASSWORD** и не использовать дефолтный из кода.
- При необходимости ограничить CORS для API (сейчас Vercel по умолчанию отдаёт API с того же домена).
- Регулярно обновлять зависимости (`npm audit`, обновление `pg`, `bcryptjs`, `jsonwebtoken`).
- При росте нагрузки рассмотреть лимиты на частоту запросов (rate limiting) на `/api/order` и `/api/auth/login`.

Итог: уровень безопасности для корпоративного сайта и админки **хороший**: пароли не хранятся в открытом виде, доступ к данным и контенту разграничен, секреты вынесены из кода, БД защищена от типичных SQL-инъекций.

---

## 7. Структура проекта (кратко)

```
T.Digital/
├── index.html, about.html, services.html, projects.html, contacts.html, founder.html, project.html, service.html
├── styles.css, main.js, content.js
├── admin.html, admin-login.html, admin-*.html (страницы админки)
├── admin.css, admin-auth.js, admin-sections.js, admin-telegram.js, admin-orders.js
├── api/
│   ├── order.js              → POST /api/order (форма заказа, сохранение в БД + Telegram)
│   ├── content.js             → GET /api/content (публичное чтение контента)
│   ├── auth/login.js          → POST /api/auth/login
│   ├── auth/me.js             → GET /api/auth/me (проверка токена)
│   ├── admin/content.js       → GET/PUT /api/admin/content
│   ├── admin/orders.js        → GET /api/admin/orders
│   ├── admin/telegram.js      → GET/PUT /api/admin/telegram
│   ├── admin/credentials.js   → смена логина/пароля админа
│   ├── admin/bootstrap.js    → одноразовый сброс пароля по секрету
│   ├── telegram/send.js       → отправка сообщения в Telegram
│   └── _lib/
│       ├── db.js             → PostgreSQL: таблицы, getContent, saveContent, admins, orders, telegram
│       ├── auth.js            → JWT: создание и проверка токена
│       └── http.js            → утилиты sendJson, readJson
├── package.json (pg, bcryptjs, jsonwebtoken)
├── vercel.json
├── .env.example
└── README.md
```

---

## 8. API (кратко)

| Метод и путь               | Доступ   | Назначение |
|----------------------------|----------|------------|
| GET /api/content           | Публичный | Получить контент сайта (JSON). |
| POST /api/order            | Публичный | Отправить заказ (сохраняется в БД, опционально Telegram). |
| POST /api/auth/login       | Публичный | Вход: username + password → JWT. |
| GET /api/auth/me           | По токену | Проверка авторизации админа. |
| GET/PUT /api/admin/content | По токену | Чтение/сохранение контента. |
| GET /api/admin/orders      | По токену | Список заказов из БД. |
| GET/PUT /api/admin/telegram| По токену | Настройки Telegram. |
| PUT /api/admin/credentials | По токену | Смена логина/пароля админа. |

---

## 9. Итог для презентации

- **Языки:** HTML, CSS, JavaScript (фронт и бэкенд на Node.js).
- **Технологии:** Vercel Serverless, PostgreSQL, JWT, bcrypt, Telegram Bot API, ванильный JS без фреймворков.
- **Данные:** только в PostgreSQL (контент, админы, заказы, настройки Telegram); секреты — в переменных окружения.
- **Безопасность:** хеширование паролей, JWT для админки, параметризованные запросы к БД, отсутствие секретов в коде — уровень подходит для презентации как «безопасное хранение и разграничение доступа».

Документ можно использовать как основу для слайдов или раздаточного материала на защите/презентации проекта.
