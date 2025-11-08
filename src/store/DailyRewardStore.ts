// src/store/DailyRewardStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import {
  checkDailyReward,
  claimDailyReward,
  getAllDailyRewards,
  type DailyReward,
} from "@/http/dailyRewardAPI";
import type { DailyRewardCheckResponse, DailyRewardClaimResponse, RewardType } from "@/types/types";
import type UserStore from "@/store/UserStore";

export default class DailyRewardStore {
  // Поля, которые приходят при check
  private _available = false;
  private _dailyRewardDay = 0;
  private _lastDailyRewardClaimAt: string | null = null;
  private _nextDay = 1;
  private _rewardInfo: {
    day: number;
    reward: number;
    rewardType: RewardType;
    description: string;
  } | null = null;

  private _allRewards: DailyReward[] = [];
  private _loading = false;
  private _userStore: UserStore | null = null;

  constructor(userStore?: UserStore) {
    makeAutoObservable(this);
    this._userStore = userStore || null;
  }

  setUserStore(userStore: UserStore) {
    this._userStore = userStore;
  }

  // Загрузить все ежедневные награды
  async fetchAllRewards() {
    try {
      const rewards = await getAllDailyRewards();
      runInAction(() => {
        this._allRewards = rewards;
      });
    } catch (error) {
      console.error("Error fetching all daily rewards:", error);
    }
  }

  // Проверка ежедневной награды
  async checkDailyReward() {
    this._loading = true;
    try {
      const data: DailyRewardCheckResponse = await checkDailyReward();
      runInAction(() => {
        this._available = data.available;
        this._dailyRewardDay = data.dailyRewardDay;
        this._lastDailyRewardClaimAt = data.lastDailyRewardClaimAt;
        this._nextDay = data.nextDay;
        this._rewardInfo = data.rewardInfo; // может быть null
      });
    } catch (error) {
      console.error("Error checking daily reward:", error);
    } finally {
      runInAction(() => {
        this._loading = false;
      });
    }
  }

  // Получение ежедневной награды
  async claimDailyReward() {
    this._loading = true;
    try {
      const data: DailyRewardClaimResponse = await claimDailyReward();
      runInAction(() => {
        // Раз награда получена, флаг делаем false
        this._available = false;
        // Можно сразу обновить данные (dailyRewardDay) на те, что пришли в ответе:
        this._dailyRewardDay = data.user.dailyRewardDay;
        this._lastDailyRewardClaimAt = data.user.lastDailyRewardClaimAt;
        // rewardInfo уже не актуален, так как награду только что забрали
        this._rewardInfo = null;
      });

      // Обновляем баланс и энергию пользователя из ответа сервера
      if (this._userStore) {
        if (data.user.balance !== undefined) {
          this._userStore.setBalance(data.user.balance);
        }
        if (data.user.energy !== undefined) {
          this._userStore.setEnergy(data.user.energy);
        }
      }

      return data;
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      throw error;
    } finally {
      runInAction(() => {
        this._loading = false;
      });
    }
  }

  // Геттеры
  get available() {
    return this._available;
  }
  get dailyRewardDay() {
    return this._dailyRewardDay;
  }
  get lastDailyRewardClaimAt() {
    return this._lastDailyRewardClaimAt;
  }
  get nextDay() {
    return this._nextDay;
  }
  get rewardInfo() {
    return this._rewardInfo;
  }
  get loading() {
    return this._loading;
  }
  get allRewards() {
    return this._allRewards;
  }
}
