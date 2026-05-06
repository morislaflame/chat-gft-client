import { createContext } from "react";
import type UserStore from "@/store/UserStore";
import type ChatStore from "@/store/ChatStore";
import type QuestStore from "@/store/QuestStore";
import type ShopStore from "@/store/ShopStore";
import type ProductStore from "@/store/ProductStore";
import type RewardStore from "@/store/RewardStore";
import type CaseStore from "@/store/CaseStore";
import type DailyRewardStore from "@/store/DailyRewardStore";
import type AgentStore from "@/store/AgentStore";

export interface IStoreContext {
  user: UserStore;
  chat: ChatStore;
  quest: QuestStore;
  shop: ShopStore;
  product: ProductStore;
  reward: RewardStore;
  cases: CaseStore;
  dailyReward: DailyRewardStore;
  agent: AgentStore;
}

export const Context = createContext<IStoreContext | null>(null);
