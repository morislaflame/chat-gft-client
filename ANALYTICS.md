# ChatGFT — Документация по аналитике (GA4)

Этот документ описывает, **какие события и параметры мы отправляем в Google Analytics 4 (GA4)**, как их интерпретировать и как настроить GA4 так, чтобы отчёты были читаемыми и полезными.

## 1) Обзор

- **Провайдер аналитики**: Google Analytics 4 (GA4) через `gtag.js`
- **Measurement ID**: `G-4PMB2RLYJR` (по умолчанию; можно переопределить)
- **Где подключено**: `src/App.tsx` + централизованные хелперы в `src/utils/analytics.ts`
- **Транспорт событий**: браузер → `https://www.google-analytics.com/g/collect`
- **SPA**: `page_view` отправляем вручную (авто `page_view` отключён).

### 1.1 Ключевые файлы

- `src/utils/analytics.ts`
  - Загружает `gtag.js`
  - Даёт API `trackEvent()` / `trackPageView()`
  - Автоматически добавляет `label_ru` для читаемости
  - Поддерживает debug режим `?ga_debug=1`
- `src/App.tsx`
  - Инициализирует аналитику один раз
  - Отправляет `app_open` и первый `page_view`
  - Устанавливает GA `user_id`
  - Отправляет `auth_ready`, события онбординга и итог по сессии (`session_quality`)

## 2) Безопасность и приватность (важно)

- Мы **НЕ** отправляем: текст сообщений, ФИО, email, телефон и т.п.
- Мы используем GA4 **User-ID** как `user.id` (внутренний числовой id из нашего backend). Это корректный способ анализировать воронки по пользователям без передачи PII.
- **Не отправляйте Telegram username в GA “как есть”** — по политике GA это может считаться PII.
  - Если когда‑нибудь потребуется “человеческий” идентификатор — делайте **хэш** (лучше сервер‑сайд).

## 3) Конфигурация во время выполнения

### 3.1 Переменные окружения (Vite)

Опционально (по умолчанию всё работает в production):

- `VITE_GA_MEASUREMENT_ID`
  - Переопределяет Measurement ID GA4.
- `VITE_GA_ENABLED=true`
  - Принудительно включает аналитику не только в production.
- `VITE_GA_DEBUG=true`
  - Принудительно включает debug_mode (см. ниже).

### 3.2 Debug mode

- Добавьте `?ga_debug=1` к URL, чтобы события уходили с `debug_mode=true`.
- В GA4 откройте **Admin → DebugView**, чтобы видеть события за секунды.

## 4) Общие поля, которые мы отправляем

### 4.1 `label_ru`

Для большинства кастомных событий мы автоматически добавляем:

- `label_ru` (string): человеко‑читаемое название события на русском.

Это поле удобно использовать в **Explorations** и кастомных отчётах GA4.

### 4.2 Идентификация пользователя

После авторизации мы вызываем:

- `gtag('config', MEASUREMENT_ID, { user_id: String(user.id) })`
- `gtag('set', 'user_properties', { language, selected_history })`

Это позволяет GA4 связывать события с конкретным user_id и сегментировать по языку/истории.

## 5) Словарь событий (что отправляем)

Формат:

- **Имя события**
  - **Когда отправляем**
  - **Параметры**

### 5.1 Навигация и просмотры страниц

- **`page_view`**
  - **Когда**: смена роутов (SPA) + первый рендер.
  - **Параметры**:
    - `page_path` (string) — pathname + query
    - `page_location` (string) — полный URL
    - `page_title` (string)

- **`navigation_tab_click`**
  - **Когда**: пользователь нажимает вкладку нижней навигации.
  - **Параметры**:
    - `tab_id` (string: `chat|quests|friends|rewards|store`)
    - `from_path` (string)
    - `to_path` (string)

### 5.2 Активация / авторизация / онбординг

- **`app_open`**
  - **Когда**: инициализация приложения.
  - **Параметры**:
    - `platform` (string: `telegram|web`)

- **`auth_ready`**
  - **Когда**: завершена авторизация (Telegram initData или checkAuth).
  - **Параметры**:
    - `auth_status` (string: `ok|fail`)
    - `fail_reason` (string, optional)

- **`onboarding_view`**
  - **Когда**: показан шаг онбординга.
  - **Параметры**:
    - `step` (number: 1 — welcome, 2 — выбор истории)
    - `variant` (string: `default|header`)

- **`onboarding_complete`**
  - **Когда**: онбординг завершён.
  - **Параметры**:
    - `variant` (string: `default|header`)
    - `time_spent_sec` (number)

Совместимость (legacy события, которые всё ещё отправляются):
- `onboarding_shown`
- `onboarding_completed`

### 5.3 Истории (stories / histories)

В нашем коде **`story_id = historyName`** (идентификатор истории агента).

- **`story_list_view`**
  - **Когда**: список историй показан (данные загружены).
  - **Параметры**:
    - `stories_shown_count` (number)
    - `sort` (string: `orderIndex_asc`)

- **`story_select`**
  - **Когда**: пользователь выбрал историю.
  - **Параметры**:
    - `story_id` (string)
    - `entry_point` (string: сейчас `home`)

- **`story_start`**
  - **Когда**: история сохранена как выбранная, пользователь начинает прохождение.
  - **Параметры**:
    - `story_id` (string)
    - `is_new` (number: 1 если история изменилась, 0 если осталась та же)

Совместимость (legacy события):
- `history_select_attempt`
- `history_selected`
- `history_select_failed`
- `history_selection_opened`

### 5.4 Чат / ИИ

- **`message_send`**
  - **Когда**: пользователь отправил сообщение (ядро core loop).
  - **Параметры**:
    - `story_id` (string)
    - `message_len` (number)
    - `has_voice` (number: 0/1)

- **`ai_response_show`**
  - **Когда**: получен и показан ответ ИИ.
  - **Параметры**:
    - `story_id` (string)
    - `response_len` (number)
    - `latency_ms` (number)

Совместимость (legacy события):
- `chat_message_send` (length/is_start/selected_history)
- `chat_message_send_failed` (`reason`)
- `chat_suggestion_click` (`length`)

### 5.5 Миссии

Примечания:
- Список миссий приходит с backend status API.
- `mission_id` — id миссии из backend. Может быть `null`, если миссии ещё не успели загрузиться.

- **`mission_view`**
  - **Когда**: карточка миссии показана в ленте (1 раз на `story_id:mission_id`).
  - **Параметры**:
    - `story_id` (string)
    - `mission_id` (number|null)
    - `mission_type` (string: сейчас `mission`)

- **`mission_start`**
  - **Когда**: пользователь нажал “Start” на миссии.
  - **Параметры**:
    - `story_id` (string)
    - `mission_id` (number|null)

- **`mission_complete`**
  - **Когда**: backend сообщил, что миссия завершена (`missionCompleted=true`).
  - **Параметры**:
    - `story_id` (string)
    - `mission_id` (number|null)
    - `attempts` (number; сейчас всегда 1)
    - `time_to_complete_sec` (number|null; считаем от клика Start, если он был)

- **`mission_fail`**
  - **Когда**: временная аппроксимация — ошибка отправки сообщения в контексте миссии.
  - **Параметры**:
    - `story_id` (string)
    - `fail_reason` (string: `energy_depleted|unknown`)

- **`scene_complete`**
  - **Когда**: маппинг на “завершение сцены” при завершении миссии.
  - **Параметры**:
    - `story_id` (string)
    - `scene_id` (number|null) — сейчас равен `mission_id`
    - `completion_type` (string: `mission`)

Совместимость (legacy события):
- `mission_start_click` (order_index, mission_id, story_id)
- `mission_video_open` / `mission_video_close`
- `mission_completed` (stage/reward_amount/selected_history)

### 5.6 Энергия

- **`energy_spent`**
  - **Когда**: списываем 1 энергию за попытку отправки сообщения.
  - **Параметры**:
    - `amount` (number: сейчас 1)
    - `balance_after` (number|null) — прогноз на клиенте (может отличаться от сервера)
    - `reason` (string: `step`)

- **`energy_depleted`**
  - **Когда**: энергии не хватает (или показан paywall).
  - **Параметры**:
    - `balance` (number|null)
    - `context` (string: `story`)

- **`energy_refill`**
  - **Когда**: энергия пополнена.
  - **Параметры**:
    - `amount` (number)
    - `balance_after` (number)
    - `method` (string: `daily|box|stars|...`)

### 5.7 Gems (гемы)

- **`gems_earned`**
  - **Когда**: начислили Gems (миссии / daily / бокс).
  - **Параметры**:
    - `amount` (number)
    - `balance_after` (number)
    - `source` (string: `mission|daily|box`)

- **`gems_spent`**
  - **Когда**: потратили Gems (покупка награды / бокса).
  - **Параметры**:
    - `amount` (number)
    - `balance_after` (number|null)
    - `sink` (string: `direct_purchase|box`)

### 5.8 Лут / боксы / кейсы

- **`loot_view`**
  - **Когда**: открыт экран лута или переключена вкладка.
  - **Параметры**:
    - `tab` (string: `boxes|inventory`)

- **`case_purchase`** (legacy название, оставлено)
  - **Когда**: пользователь купил кейс.
  - **Параметры**:
    - `case_id` (number)
    - `quantity` (number)
    - `new_balance` (number)

- **`box_open_start`**
  - **Когда**: пользователь начал открытие бокса (open case).
  - **Параметры**:
    - `box_id` (number|null)
    - `balance_before` (number|null)

- **`box_open_result`**
  - **Когда**: получен результат открытия бокса.
  - **Параметры**:
    - `box_id` (number|null)
    - `reward_type` (string: `gems|energy|reward`)
    - `reward_amount` (number|null) — для `reward` сейчас отправляем **цену награды**, т.к. amount не применим
    - `nft_id` (number|null) — сейчас равен reward id, если выпала награда (`reward`)

### 5.9 Платежи (Telegram Stars)

- **`stars_paywall_view`**
  - **Когда**: показана модалка “закончилась энергия” или переход в магазин из неё.
  - **Параметры**:
    - `context` (string: `energy_depleted`)
    - `placement` (string, optional: `modal_to_store|modal_to_quests`)

- **`stars_purchase_start`**
  - **Когда**: пользователь начал оплату Stars (открыт invoice).
  - **Параметры**:
    - `offer_id` (string; равен id продукта)
    - `price_stars` (number|null)

- **`stars_purchase_success`**
  - **Когда**: invoice вернул статус `paid`.
  - **Параметры**:
    - `offer_id` (string)
    - `price_stars` (number|null)
    - `currency` (string: `XTR`)
    - `energy_granted` (number|null)

- **`stars_purchase_fail`**
  - **Когда**: invoice вернул статус не `paid` или произошла ошибка.
  - **Параметры**:
    - `offer_id` (string)
    - `fail_reason` (string)

Совместимость (legacy события):
- `store_purchase_start` / `store_purchase_paid` / `store_purchase_result` / `store_purchase_failed`

### 5.10 Рефералка / друзья

- **`invite_link_copied`**
  - **Когда**: пользователь скопировал реферальную ссылку.
  - **Параметры**:
    - `placement` (string: `friends`)
    - `channel` (string: `copy`)

- **`invite_share`**
  - **Когда**: пользователь поделился реферальной ссылкой через Telegram.
  - **Параметры**:
    - `placement` (string: `friends`)
    - `channel` (string: `tg_share`)

Совместимость:
- `referral_copy` / `referral_share` (уровень UI)

### 5.11 Квесты

- **`quest_action_success`**
  - **Когда**: обработчик действия по квесту вернул успех.
  - **Параметры**:
    - `task_id` (number)
    - `task_type` (string)
    - `code` (string)

- **`quest_completed`**
  - **Когда**: квест перешёл в статус “выполнен”.
  - **Параметры**:
    - `task_id` (number)
    - `task_type` (string)
    - `reward` (number)
    - `reward_type` (string)
    - `code` (string)

- **`quest_action_failed`**
  - **Когда**: обработчик квеста упал с исключением.
  - **Параметры**:
    - `task_id` (number)
    - `reason` (string)

- **`quest_share_story_attempt|success|failed`**
  - **Когда**: шаринг в Telegram Story.
  - **Параметры**:
    - `task_id` (number)
    - `code` (string, for attempt)
    - `reason` (string, for failed)

### 5.12 Ежедневная награда

- **`daily_reward_claim`**
  - **Когда**: ежедневная награда получена.
  - **Параметры**:
    - `day_index` (number)
    - `reward` (number)
    - `reward_type` (string: `energy|tokens`)
    - `second_reward` (number)
    - `second_reward_type` (string|null)

Дополнительно мы отправляем `energy_refill` или `gems_earned` в зависимости от типа награды.

### 5.13 Ошибки

- **`error_show`**
  - **Когда**: мы показываем/фиксируем важную ошибку (в т.ч. фатальную).
  - **Параметры**:
    - `error_area` (string: `auth|energy|...`)
    - `error_code` (string)
    - `fatal` (number: 0/1)

## 6) Итог по сессии (`session_quality`)

- **`session_quality`**
  - **Когда**: приложение уходит в background (`document.visibilityState === 'hidden'`).
  - **Параметры**:
    - `time_spent_sec` (number)
    - `messages_sent` (number)
    - `missions_completed` (number)
    - `energy_spent_total` (number)
    - `gems_earned_total` (number)

## 7) Настройка GA4 (рекомендованный чек‑лист)

### 7.1 Custom definitions (кастомные измерения)

GA4 Admin → Custom definitions → Create custom dimension:

**Event-scoped (рекомендуемый минимум)**
- `label_ru`
- `story_id`
- `mission_id`
- `tab_id`
- `from_path`
- `to_path`
- `box_id`
- `reward_type`
- `reward_amount`
- `offer_id`
- `price_stars`
- `fail_reason`
- `time_to_complete_sec`

**User-scoped (user properties)**
- `language`
- `selected_history`

### 7.2 Conversions

Отметить как conversions (минимум):
- `onboarding_complete`
- `story_start`
- `mission_complete`
- `box_open_result`
- `stars_purchase_success`
- `quest_completed`

### 7.3 Explorations (шаблоны)

**Воронка активации**
- `app_open` → `onboarding_complete` → `story_start` → `message_send`

**Воронка экономики**
- `energy_depleted` → `stars_paywall_view` → `stars_purchase_success`

**Воронка лута**
- `gems_earned` → `loot_view (tab=boxes)` → `case_purchase` → `box_open_result`

**Популярность историй**
- Строки (Rows): `story_id`
- Метрики (Metrics): Users, `story_start`, `message_send`, `mission_complete`

## 8) Retention (как считать удержание)

Рекомендуемое определение retention для ChatGFT:

- **D1/D7/D30 удержание по значимому действию**
  - Критерий возврата: `message_send` (или `mission_complete`)
  - Сегментация: `story_id`, `language`, `selected_history`

Используйте **Explore → Cohort exploration**.

## 9) Примечания / известные ограничения

- `energy_spent.balance_after` сейчас считается прогнозно на клиенте и может отличаться от фактического значения на сервере.
- `mission_id` может быть `null`, если список миссий не успел загрузиться к моменту маппинга completion.
- `box_open_result.reward_amount` для выпадения `reward` сейчас использует **цену награды** (потому что amount не применим). Если позже появится NFT/TON value — обновите маппинг.


