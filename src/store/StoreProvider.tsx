import { useState, useEffect, type ReactNode } from "react";
import LoadingIndicator from "../components/CoreComponents/LoadingIndicator";
import { Context } from "@/store/context";
import { registerStoreInstance } from "@/store/storeSingleton";
import UserStore from "@/store/UserStore";
import ChatStore from "@/store/ChatStore";
import QuestStore from "@/store/QuestStore";
import ShopStore from "@/store/ShopStore";
import ProductStore from "@/store/ProductStore";
import RewardStore from "@/store/RewardStore";
import CaseStore from "@/store/CaseStore";
import DailyRewardStore from "@/store/DailyRewardStore";
import AgentStore from "@/store/AgentStore";

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
    cases: CaseStore;
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
        { default: CaseStore },
        { default: DailyRewardStore },
        { default: AgentStore },
      ] = await Promise.all([
        import("@/store/UserStore"),
        import("@/store/ChatStore"),
        import("@/store/QuestStore"),
        import("@/store/ShopStore"),
        import("@/store/ProductStore"),
        import("@/store/RewardStore"),
        import("@/store/CaseStore"),
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
        cases: new CaseStore(),
        dailyReward: new DailyRewardStore(),
        agent: new AgentStore(),
      });
    };

    loadStores();
  }, []);

  useEffect(() => {
    if (!stores) return;
    stores.chat.setUserStore(stores.user);
    stores.chat.setCaseStore(stores.cases);
    stores.user.setChatStore(stores.chat);
    stores.dailyReward.setUserStore(stores.user);
    stores.agent.setUserStore(stores.user);
    stores.agent.setChatStore(stores.chat);
    stores.cases.setUserStore(stores.user);
    stores.cases.setRewardStore(stores.reward);
  }, [stores]);

  // Регистрируем синглтон один раз — раньше это делалось прямо в теле компонента,
  // и при каждом ререндере stores «перерегистрировались», что приводило к
  // лишним обращениям и потенциально удерживало старые ссылки.
  useEffect(() => {
    if (stores) {
      registerStoreInstance(stores);
    }
  }, [stores]);

  if (!stores) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
