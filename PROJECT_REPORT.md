# Полный отчёт о проекте T.Digital (OrzuIT) — от А до Я

---

## А. Что это за проект

**Название:** T.Digital (сайт OrzuIT)  
**Тип:** Многостраничный корпоративный сайт с админ-панелью, REST API и базой данных PostgreSQL.  
**Назначение:**
- Визитка компании (главная, о нас, контакты).
- Каталог услуг и проектов с фильтрами по категориям.
- Приём заказов и обращений через форму (сохранение в БД и уведомления в Telegram).
- Админ-панель для редактирования контента, просмотра заказов и настройки Telegram.

**Деплой:** Vercel (статический хостинг + serverless API). База данных — внешний PostgreSQL (Neon, Railway, Supabase и т.п.).

---

## Б. Языки программирования

| Язык | Где используется |
|------|-------------------|
| **HTML5** | Все страницы: главная, о нас, услуги, проекты, контакты, основатель; страницы админки (dashboard, контент, заказы, Telegram и др.). |
| **CSS3** | Стили сайта (`styles.css`), стили админки (`admin.css`): переменные, адаптив, тёмная тема. |
| **JavaScript** | Фронтенд: загрузка контента, формы, навигация (`main.js`, `content.js`), админка (`admin-auth.js`, `admin-sections.js`, `admin-telegram.js`, `admin-orders.js`). |
| **Node.js (JavaScript)** | Бэкенд: все API-обработчики в папке `api/`, работа с БД, JWT, валидация, логирование, rate limiting. |

Отдельных языков (PHP, Python, C#, Java) в проекте нет.

---

## В. Технологии и стек

### Фронтенд
- **HTML5** — семантическая разметка.
- **CSS3** — каскад, переменные (цвета, радиусы), медиа-запросы, flex/grid.
- **Ванильный JavaScript** — без React/Vue/Angular. Запросы к API через `fetch`, контент подставляется в DOM.

### Бэкенд
- **Vercel Serverless Functions** — каждая функция в `api/` соответствует маршруту (например, `api/order.js` → `POST /api/order`). Нет постоянного процесса, масштабирование по запросам.
- **Node.js** — среда выполнения (CommonJS, см. `package.json`).

### База данных
- **PostgreSQL** — единственное хранилище данных.
- **Клиент:** библиотека `pg` (node-postgres). Подключение через `DATABASE_URL`, SSL для не-localhost.
- **ORM-слой:** модули в `api/_lib/models/` (Admin, SiteContent, Order, TelegramSettings). Прямые SQL-запросы только внутри моделей и в `db.js` при инициализации.

### Безопасность и авторизация
- **JWT (jsonwebtoken)** — токен после входа в админку, срок жизни 12 часов, подпись по `JWT_SECRET`.
- **bcryptjs** — хеширование паролей (12 раундов), сравнение через `bcrypt.compare`.
- **Rate limiting** — ограничение запросов по IP (логин, заказы, контент); состояние в таблице `rate_limits`.
- **Валидация** — централизованная в `api/_lib/validate.js` для всех входящих данных (логин, заказ, контент, учётные данные, Telegram, bootstrap).

### Логирование
- **api/_lib/logger.js** — единый логгер (info, warn, error, debug). Вывод в stdout (JSON), уровень через `LOG_LEVEL`.

### Внешние сервисы
- **Telegram Bot API** — отправка уведомлений о заказах и тестовых сообщений (по желанию).
- **Vercel** — хостинг статики и API, переменные окружения для секретов.

### Инструменты
- **Git** — версионирование.
- **npm** — зависимости: `pg`, `bcryptjs`, `jsonwebtoken` (см. `package.json`).
- **.env / Vercel Environment Variables** — секреты не хранятся в репозитории; в коде только `.env.example`.

---

## Г. Структура проекта (полная)

```
T.Digital/
├── index.html              # Главная
├── about.html              # О нас
├── services.html           # Список услуг
├── service.html            # Страница одной услуги
├── projects.html           # Список проектов (с фильтром по категориям)
├── project.html            # Страница одного проекта
├── contacts.html           # Контакты + форма заказа
├── founder.html            # Основатель
├── styles.css              # Стили сайта
├── main.js                 # Логика страниц, формы, контент с API
├── content.js              # Загрузка контента с /api/content
│
├── admin.html              # Dashboard админки
├── admin-login.html        # Вход в админку
├── admin-home.html         # Редактирование главной
├── admin-services.html     # Редактирование услуг
├── admin-about.html        # Редактирование «О нас»
├── admin-contacts.html     # Редактирование контактов
├── admin-projects.html     # Редактирование проектов и категорий
├── admin-orders.html       # Список заказов
├── admin-telegram.html     # Настройки Telegram
├── admin.css               # Стили админки
├── admin-auth.js           # Проверка JWT, редирект на логин, logout
├── admin-sections.js       # Сохранение секций контента через API
├── admin-telegram.js       # Загрузка/сохранение настроек Telegram
├── admin-orders.js         # Загрузка списка заказов с /api/admin/orders
│
├── api/
│   ├── order.js            # POST /api/order — приём заказа (БД + Telegram)
│   ├── content.js          # GET /api/content — публичный контент
│   ├── auth/
│   │   ├── login.js        # POST /api/auth/login — выдача JWT
│   │   └── me.js           # GET /api/auth/me — проверка токена
│   ├── admin/
│   │   ├── content.js      # GET/PUT /api/admin/content
│   │   ├── orders.js       # GET /api/admin/orders
│   │   ├── telegram.js     # GET/PUT /api/admin/telegram
│   │   ├── credentials.js  # PUT /api/admin/credentials — смена логина/пароля
│   │   └── bootstrap.js    # POST /api/admin/bootstrap — сброс пароля по секрету
│   ├── telegram/
│   │   └── send.js         # POST /api/telegram/send — отправка сообщения в чат
│   └── _lib/
│       ├── db.js           # Подключение к PostgreSQL, initDatabase, query, создание таблиц
│       ├── auth.js         # JWT: createAdminToken, verifyAdminToken
│       ├── http.js         # getClientIp, sendJson, readJson
│       ├── logger.js       # info, warn, error, debug
│       ├── validate.js     # validateLogin, validateOrder, validateContent, validateCredentials, validateTelegram, validateBootstrap
│       ├── rateLimit.js    # check(req, res, scope) — лимиты по IP, состояние в БД
│       ├── defaultContent.js # Начальный контент при первом запуске
│       └── models/
│           ├── index.js    # Экспорт всех моделей
│           ├── Admin.js    # findByUsername, findById, getPrimary, updateCredentials
│           ├── SiteContent.js # get, save
│           ├── Order.js    # create, findAll
│           └── TelegramSettings.js # get, save
│
├── package.json            # name, scripts (vercel dev), dependencies (pg, bcryptjs, jsonwebtoken)
├── vercel.json             # framework: null, cleanUrls, trailingSlash
├── .env.example            # Шаблон переменных окружения
├── README.md               # Описание, переменные, production readiness
└── PROJECT_REPORT.md       # Этот отчёт
```

---

## Д. База данных: где и как хранятся данные

Все постоянные данные — **только в PostgreSQL**. Файлы используются только для кода и статики.

### Таблицы

| Таблица | Назначение | Ключевые поля |
|--------|------------|----------------|
| **admins** | Учётные записи администраторов | id, username, password_hash, created_at, updated_at |
| **site_content** | Контент сайта (одна запись) | id=1, data (JSONB), updated_at |
| **telegram_settings** | Настройки Telegram (одна запись) | id=1, chat_id, bot_token, updated_at |
| **orders** | Заказы с формы | id, name, email, phone, service, message, created_at |
| **rate_limits** | Состояние rate limiting по ключу (scope:IP) | key, count, reset_at |

### Как хранятся

- **Пароли:** только bcrypt-хеш в `admins.password_hash`, в открытом виде нигде не хранятся.
- **Контент:** один JSON в `site_content.data` (главная, услуги, о нас, контакты, категории, проекты).
- **Заказы:** каждая отправка формы — одна строка в `orders` с датой `created_at` (TIMESTAMPTZ).
- **Запросы к БД:** только параметризованные (`$1`, `$2`, …) — защита от SQL-инъекций.
- **Секреты:** JWT_SECRET, DATABASE_URL, пароли, Telegram — только в переменных окружения, не в коде и не в репозитории.

---

## Е. Безопасность (полный разбор)

### Реализовано

1. **Аутентификация админки**
   - Вход по username + password; пароль проверяется через bcrypt.
   - После успешного входа выдаётся JWT (срок жизни 12 ч). Все маршруты `/api/admin/*` и смена учётных данных требуют заголовок `Authorization: Bearer <token>`.

2. **Защита от перебора паролей и спама**
   - Rate limiting по IP: логин — 10 запросов / 15 мин; заказы — 20 / мин; контент — 60 / мин. При превышении — ответ 429 и заголовок/поле `retryAfter`.

3. **Валидация входящих данных**
   - Все тела запросов (логин, заказ, контент, учётные данные, Telegram, bootstrap) проходят централизованную проверку: типы, обязательные поля, длина, формат email. При ошибке — 400 и JSON `{ error, details }`.

4. **Защита от SQL-инъекций**
   - Все запросы к БД через параметризованные вызовы `query(text, [params])`.

5. **Секреты**
   - Не хранятся в коде. Используются переменные окружения (Vercel / .env): DATABASE_URL, JWT_SECRET, ADMIN_LOGIN, ADMIN_PASSWORD, ADMIN_BOOTSTRAP_SECRET, TELEGRAM_*.

6. **Разделение доступа**
   - Публично: чтение контента (`GET /api/content`), отправка заказа (`POST /api/order`), вход (`POST /api/auth/login`).
   - Только по JWT: все `/api/admin/*`, смена пароля, список заказов, настройки Telegram.

7. **HTTPS**
   - На Vercel весь трафик по HTTPS.

8. **Логирование**
   - Фиксируются важные события (вход, заказ, ошибки API/БД) без записи паролей и токенов в логи.

### Рекомендации для продакшена

- Задать длинный случайный **JWT_SECRET**.
- Задать надёжный **ADMIN_PASSWORD**, не использовать дефолт из кода.
- Регулярно обновлять зависимости (`npm audit`, обновление пакетов).
- При необходимости ограничить CORS для API.

**Итог:** уровень безопасности подходит для корпоративного сайта и админки: пароли хешированы, доступ разграничен, секреты в env, защита от инъекций и от перебора/спама.

---

## Ж. API (все маршруты)

| Метод и путь | Доступ | Назначение |
|--------------|--------|------------|
| GET /api/content | Публичный | Контент сайта (JSON). Rate limit: 60/мин. |
| POST /api/order | Публичный | Отправить заказ (валидация, БД, опционально Telegram). Rate limit: 20/мин. |
| POST /api/auth/login | Публичный | Вход: username, password → JWT. Rate limit: 10/15 мин. |
| GET /api/auth/me | По токену | Проверка JWT, данные админа. |
| GET /api/admin/content | По токену | Получить контент для редактирования. |
| PUT /api/admin/content | По токену | Сохранить контент (валидация). |
| GET /api/admin/orders | По токену | Список заказов. |
| GET /api/admin/telegram | По токену | Настройки Telegram (chatId, маскированный token). |
| PUT /api/admin/telegram | По токену | Сохранить настройки Telegram (валидация). |
| PUT /api/admin/credentials | По токену | Смена логина и пароля (текущий пароль обязателен). |
| POST /api/admin/bootstrap | По секрету | Сброс учётных данных первого админа (ADMIN_BOOTSTRAP_SECRET). |
| POST /api/telegram/send | Публичный | Отправить сообщение в настроенный чат (body: message или text). Rate limit: 100/мин. |

---

## З. Переменные окружения

| Переменная | Обязательность | Описание |
|------------|----------------|----------|
| DATABASE_URL | Обязательно | Строка подключения PostgreSQL. |
| JWT_SECRET | Обязательно | Секрет для подписи JWT (длинная случайная строка). |
| ADMIN_LOGIN | Опционально | Логин первого админа при первом запуске (по умолчанию admin). |
| ADMIN_PASSWORD | Опционально | Пароль первого админа (по умолчанию из кода — сменить в продакшене). |
| ADMIN_BOOTSTRAP_SECRET | Опционально | Секрет для сброса пароля через POST /api/admin/bootstrap. |
| TELEGRAM_BOT_TOKEN | Опционально | Токен бота; можно задать в админке вместо env. |
| TELEGRAM_CHAT_ID | Опционально | ID чата; можно задать в админке вместо env. |
| LOG_LEVEL | Опционально | Уровень логов: debug, info, warn, error (по умолчанию info). |

---

## И. Деплой и совместимость

- **Платформа:** Vercel. Статика и serverless-функции из папки `api/` развёртываются автоматически при push в репозиторий.
- **База данных:** Внешний PostgreSQL (Neon, Railway, Supabase и т.д.). `DATABASE_URL` задаётся в настройках проекта Vercel.
- **Особенности:** Нет постоянного процесса; rate limiting и сессии хранятся в БД, что подходит для serverless. Логи пишутся в stdout и доступны в Vercel Logs.

---

## К. Итог для презентации (кратко)

- **Проект:** Корпоративный сайт OrzuIT с админкой, приёмом заказов и уведомлениями в Telegram.
- **Языки:** HTML, CSS, JavaScript (фронт и бэкенд на Node.js).
- **Технологии:** Vercel Serverless, PostgreSQL, JWT, bcrypt, централизованная валидация, rate limiting, логирование, ORM-модели.
- **Данные:** Только в PostgreSQL (контент, админы, заказы, настройки Telegram, rate limits); секреты — в переменных окружения.
- **Безопасность:** Хеширование паролей, JWT, параметризованные запросы, лимиты запросов, валидация ввода, отсутствие секретов в коде.

Документ можно использовать как полный отчёт «от А до Я» для защиты или презентации проекта.
