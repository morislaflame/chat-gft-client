const DEFAULT_GA_MEASUREMENT_ID = "G-4PMB2RLYJR";

type GtagParams = Record<string, string | number | boolean | null | undefined>;

let initialized = false;
let scriptLoadingPromise: Promise<void> | null = null;

function isDebugMode(): boolean {
  if (!isBrowser()) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any)?.env;
  const forced = String(env?.VITE_GA_DEBUG || "").toLowerCase() === "true";
  if (forced) return true;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("ga_debug") === "1";
  } catch {
    return false;
  }
}

function getMeasurementId(): string | null {
  // Allow overriding via Vite env without requiring it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envId = (import.meta as any)?.env?.VITE_GA_MEASUREMENT_ID as string | undefined;
  const id = (envId || DEFAULT_GA_MEASUREMENT_ID).trim();
  return id.length ? id : null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isEnabled(): boolean {
  // Default behavior: enable in production builds only.
  // You can force-enable in other environments via VITE_GA_ENABLED=true.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any)?.env;
  const isProd = !!env?.PROD;
  const forcedEnabled = String(env?.VITE_GA_ENABLED || "").toLowerCase() === "true";
  return isBrowser() && (isProd || forcedEnabled) && !!getMeasurementId();
}

function getDefaultLabelRu(eventName: string, params: Record<string, unknown>): string | null {
  const tab = String(params.tab_id || "");
  const tabRu =
    tab === "chat" ? "Чат" :
    tab === "quests" ? "Квесты" :
    tab === "friends" ? "Друзья" :
    tab === "rewards" ? "Лут" :
    tab === "store" ? "Магазин" :
    tab ? tab : null;

  switch (eventName) {
    case "app_open":
      return "Открытие приложения";
    case "auth_ready":
      return "Готовность авторизации";
    case "login":
      return "Вход";
    case "logout":
      return "Выход";
    case "page_view":
      return params.page_path ? `Просмотр страницы: ${String(params.page_path)}` : "Просмотр страницы";
    case "navigation_tab_click":
      return tabRu ? `Навигация: ${tabRu}` : "Навигация (вкладка)";
    case "history_selection_opened":
      return "Открыт выбор истории";
    case "history_selected":
      return "Выбрана история";
    case "history_select_attempt":
      return "Выбор истории (попытка)";
    case "history_select_failed":
      return "Выбор истории (ошибка)";
    case "language_change":
      return "Смена языка";
    case "onboarding_view":
      return "Просмотр шага онбординга";
    case "onboarding_complete":
      return "Онбординг завершён (канон)";
    case "onboarding_shown":
      return "Показ онбординга";
    case "onboarding_completed":
      return "Онбординг завершён";
    case "story_list_view":
      return "Просмотр списка историй";
    case "story_select":
      return "Выбор истории (канон)";
    case "story_start":
      return "Старт истории";
    case "message_send":
      return "Сообщение отправлено (канон)";
    case "ai_response_show":
      return "Показ ответа ИИ";
    case "chat_message_send":
      return "Отправка сообщения";
    case "chat_message_send_failed":
      return "Ошибка отправки сообщения";
    case "chat_suggestion_click":
      return "Клик по подсказке";
    case "mission_start_click":
      return "Старт миссии";
    case "mission_video_open":
      return "Открыто видео миссии";
    case "mission_video_close":
      return "Закрыто видео миссии";
    case "mission_completed":
      return "Миссия завершена";
    case "mission_view":
      return "Показ миссии";
    case "mission_start":
      return "Старт миссии (канон)";
    case "mission_complete":
      return "Миссия завершена (канон)";
    case "mission_fail":
      return "Миссия не засчитана";
    case "scene_complete":
      return "Сцена завершена";
    case "energy_spent":
      return "Списана энергия";
    case "energy_depleted":
      return "Энергия закончилась";
    case "energy_refill":
      return "Пополнение энергии";
    case "gems_earned":
      return "Начислены Gems";
    case "gems_spent":
      return "Потрачены Gems";
    case "loot_view":
      return "Просмотр лута";
    case "box_open_start":
      return "Открытие бокса (старт)";
    case "box_open_result":
      return "Открытие бокса (результат)";
    case "stars_paywall_view":
      return "Показ paywall (Stars)";
    case "stars_purchase_start":
      return "Оплата Stars (старт)";
    case "stars_purchase_success":
      return "Оплата Stars (успех)";
    case "stars_purchase_fail":
      return "Оплата Stars (ошибка/отмена)";
    case "invite_link_copied":
      return "Реф. ссылка скопирована";
    case "invite_share":
      return "Реф. ссылка — поделиться";
    case "session_quality":
      return "Качество сессии";
    case "error_show":
      return "Показ ошибки пользователю";
    case "reward_detail_open":
      return "Открыта карточка награды";
    case "reward_purchase_attempt":
      return "Покупка награды (попытка)";
    case "reward_purchase":
      return "Покупка награды";
    case "reward_purchase_failed":
      return "Покупка награды (ошибка)";
    case "withdrawal_modal_open":
      return "Открыт вывод (модалка)";
    case "withdrawal_request_create_attempt":
      return "Запрос на вывод (попытка)";
    case "withdrawal_request_created":
      return "Запрос на вывод создан";
    case "withdrawal_request_create_failed":
      return "Запрос на вывод (ошибка)";
    case "case_detail_open":
      return "Открыта карточка кейса";
    case "case_navigate":
      return "Переход на страницу кейса";
    case "case_purchase_attempt":
      return "Покупка кейса (попытка)";
    case "case_purchase":
      return "Покупка кейса";
    case "case_purchase_failed":
      return "Покупка кейса (ошибка)";
    case "case_open_attempt":
      return "Открытие кейса (попытка)";
    case "case_open":
      return "Открытие кейса";
    case "case_open_failed":
      return "Открытие кейса (ошибка)";
    case "daily_reward_claim":
      return "Получение ежедневной награды";
    case "quest_action_success":
      return "Действие по квесту (успех)";
    case "quest_action_failed":
      return "Действие по квесту (ошибка)";
    case "quest_completed":
      return "Квест выполнен";
    case "quest_share_story_attempt":
      return "Шэр в сторис (попытка)";
    case "quest_share_story_success":
      return "Шэр в сторис (успех)";
    case "quest_share_story_failed":
      return "Шэр в сторис (ошибка)";
    case "referral_copy":
      return "Копирование реф. ссылки";
    case "referral_share":
      return "Поделиться реф. ссылкой";
    case "store_purchase_start":
      return "Покупка в магазине (старт)";
    case "store_purchase_paid":
      return "Покупка в магазине (оплачено)";
    case "store_purchase_result":
      return "Покупка в магазине (статус)";
    case "store_purchase_failed":
      return "Покупка в магазине (ошибка)";
    default:
      return null;
  }
}

function ensureDataLayer() {
  if (!window.dataLayer) window.dataLayer = [];
  // Must match the official GA snippet: dataLayer.push(arguments)
  // Using a rest array here can break gtag.js processing in some environments.
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
}

async function loadGtagScript(measurementId: string): Promise<void> {
  if (!isBrowser()) return;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-ga-measurement-id="${measurementId}"]`
  );
  if (existing) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.setAttribute("data-ga-measurement-id", measurementId);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load gtag.js"));
    document.head.appendChild(script);
  });
}

/**
 * Initializes GA4 (gtag.js).
 * We disable automatic page_view and send SPA page_view manually on route changes.
 */
export async function initAnalytics(): Promise<void> {
  if (!isEnabled()) return;
  if (initialized) return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = (async () => {
      ensureDataLayer();
      await loadGtagScript(measurementId);
      ensureDataLayer();
    })();
  }

  try {
    await scriptLoadingPromise;
    window.gtag?.("js", new Date());
    window.gtag?.("config", measurementId, {
      send_page_view: false,
      debug_mode: isDebugMode(),
    });
    initialized = true;
  } catch (e) {
    // Fail-open: app should work even if analytics is blocked.
    console.warn("[analytics] init failed:", e);
  }
}

export function setUserId(userId: string | number | null | undefined) {
  if (!isEnabled() || !initialized) return;
  const measurementId = getMeasurementId();
  if (!measurementId) return;
  if (userId === null || userId === undefined) return;

  window.gtag?.("config", measurementId, {
    user_id: String(userId),
  });
}

export function setUserProperties(props: Record<string, string | number | boolean | null | undefined>) {
  if (!isEnabled() || !initialized) return;
  window.gtag?.("set", "user_properties", props);
}

export function trackEvent(eventName: string, params: GtagParams = {}) {
  if (!isEnabled() || !initialized) return;
  if (!eventName || typeof eventName !== "string") return;

  // Avoid sending huge payloads or objects (PII / size issues).
  const safeParams: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      safeParams[k] = v;
    }
  }

  if (!safeParams.label_ru) {
    const label = getDefaultLabelRu(eventName, safeParams);
    if (label) safeParams.label_ru = label;
  }
  if (isDebugMode()) {
    safeParams.debug_mode = true;
  }

  window.gtag?.("event", eventName, safeParams);
}

export function trackPageView(pagePath: string) {
  if (!isEnabled() || !initialized) return;
  const page_location = window.location?.href;
  const page_title = document.title;

  trackEvent("page_view", {
    page_path: pagePath,
    page_location,
    page_title,
  });
}


