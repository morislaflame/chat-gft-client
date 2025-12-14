// src/http/dailyRewardAPI.ts
import { $authHost } from "./index";
import type { DailyRewardCheckResponse } from "@/types/types";

export interface DailyReward {
  id: number;
  day: number;
  reward: number;
  rewardType: 'energy' | 'tokens';
  secondReward: number;
  secondRewardType: 'energy' | 'tokens' | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const checkDailyReward = async (): Promise<DailyRewardCheckResponse> => {
  const { data } = await $authHost.get("api/dailyReward/check");
  return data;
};

export const claimDailyReward = async () => {
  const { data } = await $authHost.post("api/dailyReward/claim");
  return data;
};

export const getAllDailyRewards = async (): Promise<DailyReward[]> => {
  const { data } = await $authHost.get("api/dailyReward/get");
  return data;
};
