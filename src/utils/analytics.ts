const DEFAULT_GA_MEASUREMENT_ID = "G-4PMB2RLYJR";

type GtagParams = Record<string, string | number | boolean | null | undefined>;

let initialized = false;
let scriptLoadingPromise: Promise<void> | null = null;

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

function ensureDataLayer() {
  if (!window.dataLayer) window.dataLayer = [];
  // Must match the official GA snippet: dataLayer.push(arguments)
  // Using a rest array here can break gtag.js processing in some environments.
  if (!window.gtag) {
    // eslint-disable-next-line func-names
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
    });
    initialized = true;
  } catch (e) {
    // Fail-open: app should work even if analytics is blocked.
    // eslint-disable-next-line no-console
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

  window.gtag?.("event", eventName, safeParams);
}

export function trackPageView(pagePath: string) {
  if (!isEnabled() || !initialized) return;
  const page_location = window.location?.href;

  trackEvent("page_view", {
    page_path: pagePath,
    page_location,
  });
}


