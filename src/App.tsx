import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import Header from './components/CoreComponents/Header';
import BottomNavigation from './components/CoreComponents/BottomNavigation';
import DailyRewardModal from "./components/modals/DailyRewardModal";
import StageRewardModal from "./components/modals/StageRewardModal";
import InsufficientEnergyModal from "./components/modals/InsufficientEnergyModal";
import Onboarding from './components/modals/Onboarding';
import { ProgressiveBlur } from './components/ui/progressive-blur';

const AppRouter = lazy(() => import("@/router/AppRouter"));


const AppContent = () => {
  const isMobile = document.body.classList.contains('telegram-mobile');
  const blurHeight = isMobile ? 124 : 56;

  return (
    <>
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
      <BottomNavigation />
      <DailyRewardModal />
      <StageRewardModal />
      <InsufficientEnergyModal />
    </>
  );
};

const App = observer(() => {
  const { user, dailyReward } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);
  const {
    disableVerticalSwipes,
    lockOrientation,
    ready,
    isAvailable,
    setHeaderColor,
    setBackgroundColor
  } = useTelegramApp();

  useEffect(() => {
    if (isAvailable) {
      disableVerticalSwipes();
      setHeaderColor('#121826');
      setBackgroundColor('#121826');
      lockOrientation();

      ready();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, disableVerticalSwipes, lockOrientation, ready]);

  const tg = window?.Telegram?.WebApp;

  useEffect(() => {
    const authenticate = async () => {
      const initData = tg?.initData;
      console.log("Init Data:", initData);

      if (initData) {
        try {
          await user.telegramLogin(initData);
        } catch (error) {
          console.error("Telegram authentication error:", error);
        }
      } else {
        try {
          await user.checkAuth();
        } catch (error) {
          console.error("Check authentication error:", error);
        }
      }
      setLoading(false);
    };

    authenticate();
  }, [user, tg?.initData]);

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

  // Если нужно показать онбординг, показываем только его (без Header и основного контента)
  // Показываем онбординг если: обычный онбординг (shouldShowOnboarding) ИЛИ открыт из Header (showOnboarding)
  if ((user.shouldShowOnboarding && user.showOnboarding) || (user.showOnboarding && user.isHistorySelectionFromHeader)) {
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
