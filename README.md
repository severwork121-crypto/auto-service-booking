# Auto Service Booking

PWA для записи в автосервис/детейлинг-студию.

## Запуск

\`\`\`bash
npm install
cp .env.example .env   # заполни ключи Supabase
npm run dev
\`\`\`

Открой http://localhost:5173
Для клиента: быстрая запись без регистрации и установки. Работает по обычной ссылке на телефоне и компьютере. Устанавливается на главный экран как PWA — открывается без адресной строки, со своей иконкой, работает офлайн.

Для владельца: отдельный кабинет с управлением записями, услугами, ценами, фото и настройками студии.

Для тебя: конвейер. Новая студия разворачивается за 5–7 минут, код не трогается.

🛠️ Стек
Слой	Технология
Фронтенд	React 19, TypeScript, Vite, React Router
UI	Tailwind CSS + shadcn/ui, glassmorphism
Стейт	TanStack Query
Валидация	Zod + react-hook-form
Бэкенд	Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
Даты	date-fns + date-fns-tz
Уведомления	react-hot-toast + Supabase Realtime
PWA	vite-plugin-pwa + Workbox
Шрифт	Manrope Variable (@fontsource-variable/manrope)
Иконки	Phosphor Icons
Хостинг	Vercel (автодеплой через GitHub)
📁 Структура проекта
text
auto-service-booking/
├── public/
│   ├── fonts/                    # Локальные шрифты (не используется — шрифт в бандле)
│   └── icons/
│       ├── favicon.svg
│       ├── 192.png               # Иконка PWA
│       └── 512.png               # Иконка PWA
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── FadeIn.tsx        # Плавное появление при прокрутке
│   │   │   ├── GlassButton.tsx   # Стеклянная кнопка
│   │   │   ├── LoadingScreen.tsx # Анимированный лоадер
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx   # Главная карточка с фото и кнопкой
│   │   │   ├── InfoCards.tsx     # Три информационные карточки
│   │   │   └── GallerySection.tsx # Галерея работ
│   │   ├── booking/
│   │   │   └── BookingWizard.tsx # Форма записи
│   │   ├── assistant/
│   │   │   └── AssistantChat.tsx # Умный помощник
│   │   └── layout/
│   │       └── BottomNav.tsx     # Нижняя навигация (Главная / Услуги / Моя запись)
│   ├── hooks/
│   │   ├── useTenant.ts
│   │   ├── useServices.ts
│   │   ├── useBookings.ts
│   │   ├── useBooking.ts
│   │   ├── useAvailability.ts
│   │   ├── useGallery.ts
│   │   ├── useInfoCards.ts
│   │   └── useNewBookingNotifications.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── query-client.ts
│   │   ├── schemas.ts
│   │   ├── storage.ts
│   │   ├── tenant.ts
│   │   └── notifications.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── MyBookingPage.tsx
│   │   ├── NotFound.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── BookingsPage.tsx
│   │       ├── ServicesPage.tsx
│   │       ├── GalleryPage.tsx
│   │       └── SettingsPage.tsx
│   ├── styles/global.css
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── supabase/
│   ├── functions/
│   │   ├── create-booking/       # Атомарное создание записи
│   │   └── assistant/            # ИИ-помощник (опционально)
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── tenants/                      # Настройки студий (опционально)
└── README.md
🎨 Дизайн-система
Палитра:

Фон: #04060a (глубокий тёмно-синий)

Текст: #ffffff

Акцент: #4690FF (брендовый синий)

Стеклянные поверхности: rgba(255,255,255,0.035) – 0.08

Фон: гранёные SVG-фасетки + три радиальных свечения (синее сверху, синее справа-снизу, фиолетовое слева) + виньетка + шум.

Шрифт: Manrope Variable (геометрический гротеск, отличная кириллица).

Glassmorphism: backdrop-filter: blur(24px) saturate(180%) на карточках, кнопках, навигации, тостах, лоадере.

Анимации:

FadeIn — появление секций при прокрутке (уважает prefers-reduced-motion)

Трёхцветное пульсирующее кольцо в LoadingScreen

Плавный въезд тостов справа с cubic-bezier

🧭 Страницы
Клиентские
URL	Что делает
/s/<slug>/	Главная: hero с фото, название, описание, услуги, галерея, помощник, контакты
/s/<slug>/services	Форма записи: услуга → дата → время → контакты → подтверждение
/s/<slug>/my-booking	Детали записи, кнопка «В календарь», поиск по телефону
Админка
URL	Что делает
/s/<slug>/admin/login	Вход владельца (email + пароль через Supabase Auth)
/s/<slug>/admin	Дашборд: метрики за день и неделю, загрузка по дням, ближайшие записи
/s/<slug>/admin/bookings	Записи: список, статусы (принята / готова / отменена), оплата/возврат
/s/<slug>/admin/services	Услуги: добавление, редактирование, архивация
/s/<slug>/admin/gallery	Галерея: добавить, заменить фото, изменить подпись, удалить
/s/<slug>/admin/settings	Настройки: основное, часы работы, фото, инфо-карточки
⚙️ Функциональность
Клиент
Запись без регистрации. Выбор услуги → даты → свободного времени → ввод контактов.

Реальный расчёт свободного времени. Учитывает рабочие часы студии, длительность услуги, время на подготовку, занятость боксов, выходные, часовой пояс.

Занятые слоты явно помечены. Повторная запись на тот же слот невозможна.

Идемпотентность. Повторное нажатие кнопки подтверждения не создаёт дубликат.

Страница «Моя запись». Открывается после записи, помнит ID через localStorage, ищет записи по номеру телефона.

Добавление в календарь. Генерация .ics-файла с деталями записи.

Помощник. Понимает вопросы вида «Когда ближайшее окно?», «Какие услуги есть?», «Как вас найти?», «Когда вы работаете?». Отвечает на основе реальных данных студии — услуги, цены, часы, адрес. Работает без OpenAI (локальный парсер интентов).

PWA. Устанавливается на главный экран, работает офлайн (HTML и API — NetworkFirst, картинки — CacheFirst).

Админка владельца
Аутентификация. Email + пароль через Supabase Auth. RLS-политики гарантируют, что владелец видит только свою студию.

Дашборд.

Сегодня: количество записей, машин в работе, выручка (с учётом возвратов).

За неделю: всего записей, завершено (% от всех), выручка.

Загрузка по дням: мини-график с подсветкой текущего дня.

Ближайшие записи сегодня с кликабельным телефоном.

Записи.

Список предстоящих и прошедших.

Кликабельный телефон (tel: — на телефоне сразу звонит).

Смена статуса: «Принять машину» → «Отметить готовой» → «Отменить».

Внесение оплаты: модалка с суммой, тип (оплата / возврат), быстрые кнопки.

Зелёный / красный бейдж оплаты в шапке карточки.

Услуги. Список активных и архивных. Форма редактирования: название, цена, длительность, подготовка, количество боксов. Быстрые кнопки для цен и длительностей. Архивирование вместо удаления (сохраняет историю записей).

Галерея. Три действия: добавить работу, заменить фото, изменить подпись. Плюс удаление. Показывается на главной странице.

Настройки.

Основное: название, описание, адрес, телефон, часовой пояс (выбор из регионов РФ).

Часы работы: 7 дней, чекбокс «работает / выходной», время открытия и закрытия.

Фото: главное фото и логотип. Drag & drop или клик. Загрузка сразу в Supabase Storage.

Инфо-карточки: три карточки с заголовком и текстом на главной.

Realtime-уведомления. При новой записи владелец мгновенно получает стеклянный тост снизу справа с деталями (услуга, время, имя, телефон, авто) и кнопками «Открыть запись» / «Скрыть». Работает, когда админка открыта.

Инфраструктура
Мультитенантность. Данные каждой студии изолированы на уровне БД через RLS-политики.

Атомарное создание записи. Функция create_booking_atomic в Postgres с pg_advisory_xact_lock — при одновременном выборе одного слота успешной будет только одна запись.

RLS на всех таблицах: tenants, profiles, bookings, services, gallery, info_cards, holidays.

Storage-политики. Загрузка файлов в tenant-assets разрешена только авторизованным.

Хелпер get_user_tenant_id() — SECURITY DEFINER-функция для политик RLS.

🗄️ Схема базы
Таблицы
Таблица	Назначение
tenants	Студии: slug, название, адрес, телефон, часовой пояс, часы работы, URL-ы фото
services	Услуги: название, цена, длительность, подготовка, количество боксов, активна ли
bookings	Записи: клиент, телефон, авто, время, статус, оплата, idempotency_key
gallery	Галерея работ: image_url, caption, sort_order
info_cards	Три информационные карточки для главной
holidays	Выходные и праздники
profiles	Связь user_id (Supabase Auth) → tenant_id
rate_limits	Лимит запросов к помощнику
Функции
Функция	Назначение
get_available_slots(tenant_id, service_id, date)	Возвращает свободные слоты на дату
create_booking_atomic(...)	Атомарно создаёт запись с идемпотентностью
get_user_tenant_id()	Возвращает tenant_id текущего пользователя (для RLS)
Storage
Бакет tenant-assets — публичный.

Структура путей: <slug>/hero-<ts>.jpg, <slug>/logo-<ts>.png, <slug>/gallery-<ts>.jpg.

Политики: INSERT, UPDATE, DELETE — для authenticated; SELECT — для anon и authenticated.

Edge Functions
create-booking — принимает POST с данными записи, вызывает create_booking_atomic, возвращает bookingId. CORS настроен на apikey, authorization, content-type.

assistant — опциональная ИИ-функция (не используется в текущей версии, помощник работает локально).

🚀 Развёртывание
Переменные окружения
В Vercel → Settings → Environments → Production (и Preview, Development):

text
VITE_SUPABASE_URL        = https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY   = <publishable или legacy anon>
В Supabase Edge Functions:

text
OPENAI_API_KEY = <ключ>     (если используешь assistant)
OPENAI_MODEL   = gpt-4o-mini
Локальный запуск
powershell
npm install
cp .env.example .env        # вписать ключи
npm run dev -- --host
Открыть http://localhost:5173/s/studio-abc/.

Деплой
powershell
git add .
git commit -m "Описание"
git push
Vercel автоматически соберёт и задеплоит за 1–2 минуты.

🏭 Как добавить новую студию
Создай запись в tenants через SQL Editor:

sql
WITH new_tenant AS (
  INSERT INTO tenants (slug, name, description, address, phone, timezone, working_hours)
  VALUES (
    'detail-pro', 'Detail Pro', 'Детейлинг',
    'г. Москва, ул. Примерная, 1', '+7 (999) 123-45-67', 'Europe/Moscow',
    '{"1":{"start":"09:00","end":"20:00"},
      "2":{"start":"09:00","end":"20:00"},
      "3":{"start":"09:00","end":"20:00"},
      "4":{"start":"09:00","end":"20:00"},
      "5":{"start":"09:00","end":"20:00"},
      "6":{"start":"10:00","end":"18:00"}}'::jsonb
  ) RETURNING id
)
INSERT INTO services (tenant_id, name, price, duration_minutes, prep_time_minutes)
SELECT id, 'Полировка', 8000, 240, 30 FROM new_tenant
UNION ALL
SELECT id, 'Химчистка', 5000, 180, 20 FROM new_tenant;
Создай владельца в Supabase → Authentication → Users → Add user (Auto Confirm).

Свяжи с студией:

sql
INSERT INTO profiles (user_id, tenant_id)
SELECT '<UUID>', id FROM tenants WHERE slug = 'detail-pro';
Загрузи фото через админку: /s/detail-pro/admin/settings → Фото.

Отправь ссылку: https://<project>.vercel.app/s/detail-pro/.

🔐 Безопасность
Клиенты не имеют прямого доступа к bookings. Создание — через Edge Function.

Владельцы видят только свою студию (RLS по tenant_id).

Публичное чтение разрешено только для активных услуг, галереи, инфо-карточек и карточек студий.

Service role key никогда не попадает в клиентский код — только в Edge Functions.

Пароли хранит Supabase Auth (bcrypt).

Спецсимволы в URL шрифтов, доменов — кодируются (%20 вместо пробелов в SVG data URL).

🧪 Тестирование
Проверка клиента
Главная загружается, hero с фото, услуги, галерея.

Выбор услуги → даты → времени → заполнение полей → «Подтвердить запись».

Перенаправление на /my-booking?id=..., детали записи на месте.

Закрыть браузер, открыть /my-booking без параметров — запись помнится.

Поиск по номеру телефона находит записи.

Проверка админки
Вход по email/паролю.

Дашборд показывает реальные метрики.

Записи: смена статусов, внесение оплаты, возврат.

Услуги: добавить, редактировать, архивировать.

Галерея: добавить фото, заменить, изменить подпись.

Настройки: изменить телефон, часы, фото, инфо-карточки.

Realtime: сделать запись в другом окне → тост появляется.

Проверка PWA
Открыть на телефоне → «Добавить на главный экран».

Открыть с иконки — без адресной строки.

Проверить офлайн: включить авиарежим, открыть PWA — работает.
