// src/http/dailyRewardAPI.ts
import { $authHost } from "./index";
import type { DailyRewardCheckResponse } from "@/types/types";

export const checkDailyReward = async (): Promise<DailyRewardCheckResponse> => {
  const { data } = await $authHost.get("api/dailyReward/check");
  return data;
};

export const claimDailyReward = async () => {
  const { data } = await $authHost.post("api/dailyReward/claim");
  return data;
};
