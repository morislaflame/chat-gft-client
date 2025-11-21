import { createContext, useState, useEffect, type ReactNode } from "react";
import LoadingIndicator from "../components/CoreComponents/LoadingIndicator";
import UserStore from "@/store/UserStore";
import ChatStore from "@/store/ChatStore";
import QuestStore from "@/store/QuestStore";
import ShopStore from "@/store/ShopStore";
import ProductStore from "@/store/ProductStore";
import RewardStore from "@/store/RewardStore";
import DailyRewardStore from "@/store/DailyRewardStore";
import AgentStore from "@/store/AgentStore";
// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
  chat: ChatStore;
  quest: QuestStore;
  shop: ShopStore;
  product: ProductStore;
  reward: RewardStore;
  dailyReward: DailyRewardStore;
  agent: AgentStore;
}

let storeInstance: IStoreContext | null = null;

// Функция для получения экземпляра хранилища
export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
    chat: ChatStore;
    quest: QuestStore;
    shop: ShopStore;
    product: ProductStore;
    reward: RewardStore;
    dailyReward: DailyRewardStore;
    agent: AgentStore;
    } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
        { default: ChatStore },
        { default: QuestStore },
        { default: ShopStore },
        { default: ProductStore },
        { default: RewardStore },
        { default: DailyRewardStore },
        { default: AgentStore },
      ] = await Promise.all([
        import("@/store/UserStore"),
        import("@/store/ChatStore"),
        import("@/store/QuestStore"),
        import("@/store/ShopStore"),
        import("@/store/ProductStore"),
        import("@/store/RewardStore"),
        import("@/store/DailyRewardStore"),
        import("@/store/AgentStore"),
      ]);

      setStores({
        user: new UserStore(),
        chat: new ChatStore(),
        quest: new QuestStore(),
        shop: new ShopStore(),
        product: new ProductStore(),
        reward: new RewardStore(),
        dailyReward: new DailyRewardStore(),
        agent: new AgentStore(),
      });
    };

    loadStores();
  }, []);

  useEffect(() => {
    // После создания stores, устанавливаем UserStore в ChatStore и DailyRewardStore
    // и ChatStore в AgentStore для загрузки истории после выбора
    if (stores) {
      stores.chat.setUserStore(stores.user);
      stores.dailyReward.setUserStore(stores.user);
      stores.agent.setUserStore(stores.user);
      stores.agent.setChatStore(stores.chat);
    }
  }, [stores]);

  if (!stores) {
    return <div className="flex items-center justify-center h-screen w-screen">
      <LoadingIndicator />
    </div>; // Use custom loading indicator
  }

  // Сохраняем экземпляр хранилища для доступа из других модулей
  storeInstance = stores;

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
