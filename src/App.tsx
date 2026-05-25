import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { BrowserRouter, useLocation } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { Context, type IStoreContext } from '@/store/context';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import Header from './components/CoreComponents/Header';
import BottomNavigation from './components/CoreComponents/BottomNavigation';
import DailyRewardModal from "./components/modals/DailyRewardModal";
import StageRewardModal from "./components/modals/StageRewardModal";
import OpenStoryLevelModal from "./components/modals/OpenStoryLevelModal";
import CompanionArtifactModal from "./components/modals/CompanionArtifactModal";
import FirstMissionArtifactModal from "./components/modals/FirstMissionArtifactModal";
import StepRewardModal from "./components/modals/StepRewardModal";
import ArtifactAcquireModal from "./components/modals/ArtifactAcquireModal";
import InsufficientEnergyModal from "./components/modals/InsufficientEnergyModal";
import InsufficientGemsModal from "./components/modals/InsufficientGemsModal";
import Onboarding from './components/modals/Onboarding';
import SomethingWentWrongPage from './components/CoreComponents/SomethingWentWrongPage';
import { ProgressiveBlur } from './components/ui/progressive-blur';
import { initAnalytics, setUserId, setUserProperties, trackEvent, trackPageView } from '@/utils/analytics';

const AppRouter = lazy(() => import("@/router/AppRouter"));

const AnalyticsRouteListener = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search || ''}`);
  }, [location.pathname, location.search]);

  return null;
};

const AppContent = () => {
  const isMobile = document.body.classList.contains('telegram-mobile');
  const blurHeight = isMobile ? 124 : 56;

  return (
    <>
      <AnalyticsRouteListener />
      <Header />
      <ProgressiveBlur
        className="pointer-events-none fixed left-0 right-0 top-0 z-15"
        containerStyle={{ height: `${blurHeight}px` }}
        blurIntensity={2}
        direction="top"
      />
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-screen">
          <LoadingIndicator />
        </div>
      }>
        <AppRouter />
      </Suspense>
      <ProgressiveBlur
        className="pointer-events-none fixed left-0 right-0 bottom-0 z-15"
        containerStyle={{ height: `${blurHeight}px` }}
        blurIntensity={2}
        direction="bottom"
      />
      <BottomNavigation />
      <DailyRewardModal />
      <StageRewardModal />
      <OpenStoryLevelModal />
      <CompanionArtifactModal />
      <FirstMissionArtifactModal />
      <StepRewardModal />
      <ArtifactAcquireModal />
      <InsufficientEnergyModal />
      <InsufficientGemsModal />
    </>
  );
};

const App = observer(() => {
  const { user, dailyReward } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);
  const analyticsBootstrappedRef = useRef(false);
  const lastAuthTrackedRef = useRef(false);
  const onboardingShownRef = useRef(false);
  const onboardingStartRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const sessionCountersRef = useRef({
    messages_sent: 0,
    missions_completed: 0,
    energy_spent_total: 0,
    gems_earned_total: 0,
  });
  const {
    disableVerticalSwipes,
    lockOrientation,
    ready,
    isAvailable,
    setHeaderColor,
    setBackgroundColor
  } = useTelegramApp();

  useEffect(() => {
    // Init analytics once (safe no-op in dev builds by default).
    if (!analyticsBootstrappedRef.current) {
      analyticsBootstrappedRef.current = true;
      void initAnalytics().then(() => {
        trackEvent('app_open', {
          platform: window.Telegram?.WebApp ? 'telegram' : 'web',
        });
        trackPageView(`${window.location.pathname}${window.location.search || ''}`);
      });
    }

    if (isAvailable) {
      disableVerticalSwipes();
      setHeaderColor('#050505');
      setBackgroundColor('#050505');
      lockOrientation();

      ready();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, disableVerticalSwipes, lockOrientation, ready]);

  useEffect(() => {
    // Lightweight session-quality aggregation (no new deps).
    // We listen to dataLayer pushes and count key events.
    const dl = window.dataLayer;
    if (!dl || typeof dl.push !== 'function') return;

    type PatchedPush = ((...args: unknown[]) => number) & {
      __chatgftSessionPatched?: boolean;
      __chatgftOriginal?: (...args: unknown[]) => number;
    };

    const currentPush = dl.push as PatchedPush;
    // Идемпотентность: если хук уже навешен (Strict Mode / повторный mount),
    // не оборачиваем повторно — иначе будет двойной/тройной счёт событий
    // и удержание замыканий старых обёрток.
    if (currentPush.__chatgftSessionPatched) return;

    const originalPush = currentPush.bind(dl) as (...args: unknown[]) => number;

    const patched: PatchedPush = ((...args: unknown[]) => {
      try {
        const payload = args?.[0] as unknown[] | undefined;
        // payload is "arguments" object: ["event", eventName, params]
        if (payload && payload[0] === 'event') {
          const eventName = payload[1] as string;
          const params = (payload[2] || {}) as Record<string, unknown>;
          const c = sessionCountersRef.current;

          if (eventName === 'message_send' || eventName === 'chat_message_send') {
            c.messages_sent += 1;
            c.energy_spent_total += 1;
          }
          if (eventName === 'mission_completed' || eventName === 'mission_complete') {
            c.missions_completed += 1;
          }
          if (eventName === 'gems_earned') {
            const amount = typeof params.amount === 'number' ? params.amount : Number(params.amount || 0);
            if (!Number.isNaN(amount)) c.gems_earned_total += amount;
          }
        }
      } catch {
        // ignore
      }
      return originalPush(...args);
    }) as PatchedPush;
    patched.__chatgftSessionPatched = true;
    patched.__chatgftOriginal = originalPush;

    (dl as { push: PatchedPush }).push = patched;

    const flushSession = () => {
      const durationSec = Math.max(0, Math.round((Date.now() - sessionStartRef.current) / 1000));
      const c = sessionCountersRef.current;
      trackEvent('session_quality', {
        time_spent_sec: durationSec,
        messages_sent: c.messages_sent,
        missions_completed: c.missions_completed,
        energy_spent_total: c.energy_spent_total,
        gems_earned_total: c.gems_earned_total,
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSession();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      // Восстанавливаем оригинал только если на месте именно наша обёртка
      // (иначе можем затереть чужой/более свежий патч).
      const now = (window.dataLayer as { push: PatchedPush } | undefined)?.push;
      if (now && now.__chatgftSessionPatched && window.dataLayer) {
        (window.dataLayer as { push: PatchedPush }).push = originalPush as PatchedPush;
      }
    };
  }, []);

  const tg = window?.Telegram?.WebApp;

  useEffect(() => {
    const authenticate = async () => {
      const initData = tg?.initData;
      if (initData) {
        try {
          await user.telegramLogin(initData);
          trackEvent('auth_ready', { auth_status: 'ok' });
        } catch (error) {
          console.error("Telegram authentication error:", error);
          trackEvent('auth_ready', { auth_status: 'fail', fail_reason: 'telegram_login_failed' });
          trackEvent('error_show', { error_area: 'auth', error_code: 'telegram_login_failed', fatal: 1 });
        }
      } else {
        try {
          await user.checkAuth();
          trackEvent('auth_ready', { auth_status: 'ok' });
        } catch (error) {
          console.error("Check authentication error:", error);
          trackEvent('auth_ready', { auth_status: 'fail', fail_reason: 'check_auth_failed' });
          trackEvent('error_show', { error_area: 'auth', error_code: 'check_auth_failed', fatal: 1 });
        }
      }
      setLoading(false);
    };

    authenticate();
  }, [user, tg?.initData]);

  useEffect(() => {
    // Once authenticated, attach stable identity and key properties.
    if (!loading && user.isAuth && user.user) {
      setUserId(user.user.id);
      setUserProperties({
        language: user.user.language,
        selected_history: user.user.selectedHistoryName || 'unknown',
      });

      if (!lastAuthTrackedRef.current) {
        lastAuthTrackedRef.current = true;
        trackEvent('login', {
          method: tg?.initData ? 'telegram' : 'session',
        });
      }
    }
  }, [loading, user.isAuth, user.user, tg?.initData]);

  useEffect(() => {
    if (!loading && user.isAuth) {
      const checkDailyRewardFn = async () => {
        try {
          await dailyReward.checkDailyReward();
        } catch (error) {
          console.error("Error checking daily reward:", error);
        }
      };
      checkDailyRewardFn();
    }
  }, [loading, user.isAuth, dailyReward]);

  const handleOnboardingComplete = async () => {
    const startedAt = onboardingStartRef.current;
    const timeSpentSec = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : null;
    trackEvent('onboarding_complete', {
      variant: user.isHistorySelectionFromHeader ? 'header' : 'default',
      time_spent_sec: timeSpentSec,
    });
    trackEvent('onboarding_completed', {
      source: user.isHistorySelectionFromHeader ? 'header' : 'auto',
    });
    await user.completeOnboarding();
  };

  const handleHistorySelectionClose = () => {
    user.closeHistorySelection();
  };

  // Экспортируем функцию через window для доступа из Header
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).openHistorySelection = () => {
      user.openHistorySelection();
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).openHistorySelection;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoadingIndicator />
      </div>
    );
  }

  if (user.isServerError) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#050505]">
        <SomethingWentWrongPage
          onRetry={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Если нужно показать онбординг
  // Показываем онбординг если: обычный онбординг (shouldShowOnboarding) ИЛИ открыт из Header (showOnboarding)
  if ((user.shouldShowOnboarding && user.showOnboarding) || (user.showOnboarding && user.isHistorySelectionFromHeader)) {
    if (!onboardingShownRef.current) {
      onboardingShownRef.current = true;
      onboardingStartRef.current = Date.now();
      trackEvent('onboarding_shown', {
        initial_step: user.onboardingInitialStep,
        source: user.isHistorySelectionFromHeader ? 'header' : 'auto',
      });
    }
    return (
      <BrowserRouter>
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          initialStep={user.onboardingInitialStep}
          isFromHeader={user.isHistorySelectionFromHeader}
          onClose={handleHistorySelectionClose}
        />
      </BrowserRouter>
    );
  }

  // Основной контент показывается только если онбординг не нужен
  return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
  )
});

export default App;
