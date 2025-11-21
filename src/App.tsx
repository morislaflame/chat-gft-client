import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import Header from './components/CoreComponents/Header';
import DailyRewardModal from "./components/modals/DailyRewardModal";
import StageRewardModal from "./components/modals/StageRewardModal";
import InsufficientEnergyModal from "./components/modals/InsufficientEnergyModal";
import Onboarding from './components/modals/Onboarding';

const AppRouter = lazy(() => import("@/router/AppRouter"));

const App = observer(() => {
  const { user, dailyReward } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
      setHeaderColor('#191919');
      setBackgroundColor('#191919');
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

  // Проверяем onboardingSeen после загрузки данных пользователя
  useEffect(() => {
    if (user.user?.onboardingSeen === false) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user.user?.onboardingSeen]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoadingIndicator />
      </div>
    );
}


  return (
      <BrowserRouter>
        <div>
        <Header/>
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen w-screen">
                <LoadingIndicator />
              </div>
            }>
              <AppRouter />
            </Suspense>
            <DailyRewardModal />
            <StageRewardModal />
            <InsufficientEnergyModal />
            {showOnboarding && (
              <Onboarding onComplete={handleOnboardingComplete} />
            )}
        </div>
      </BrowserRouter>
  )
});

export default App;
