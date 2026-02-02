// src/http/dailyRewardAPI.ts
import { $authHost } from "./index";
import type { DailyRewardCheckResponse } from "@/types/types";

export interface DailyReward {
  id: number;
  day: number;
  reward: number;
  rewardType: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  rewardCase?: {
    id: number;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    price: number;
    isActive: boolean;
    image?: string | null;
    mediaFile?: { id: number; url: string; mimeType: string } | null;
  } | null;
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
