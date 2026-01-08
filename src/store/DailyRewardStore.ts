// src/store/DailyRewardStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import {
  checkDailyReward,
  claimDailyReward,
  getAllDailyRewards,
  type DailyReward,
} from "@/http/dailyRewardAPI";
import type { DailyRewardCheckResponse, DailyRewardClaimResponse } from "@/types/types";
import type UserStore from "@/store/UserStore";
import { trackEvent } from "@/utils/analytics";

export default class DailyRewardStore {
  // Поля, которые приходят при check
  private _available = false;
  private _dailyRewardDay = 0;
  private _lastDailyRewardClaimAt: string | null = null;
  private _nextDay = 1;
  private _rewardInfo: {
    day: number;
    reward: number;
    rewardType: 'energy' | 'tokens';
    secondReward?: number | null;
    secondRewardType?: 'energy' | 'tokens' | null;
    description: string;
  } | null = null;

  private _allRewards: DailyReward[] = [];
  private _loading = false;
  private _userStore: UserStore | null = null;
  private _rewardsLoaded = false; // Флаг для отслеживания загрузки всех наград
  private _rewardChecked = false; // Флаг для отслеживания проверки награды

  constructor(userStore?: UserStore) {
    makeAutoObservable(this);
    this._userStore = userStore || null;
  }

  setUserStore(userStore: UserStore) {
    this._userStore = userStore;
  }

  // Загрузить все ежедневные награды
  async fetchAllRewards(forceReload = false) {
    // Проверяем, не загружены ли уже награды
    if (!forceReload && this._rewardsLoaded && this._allRewards.length > 0) {
      // Награды уже загружены, пропускаем загрузку
      return;
    }

    try {
      const rewards = await getAllDailyRewards();
      runInAction(() => {
        this._allRewards = rewards;
        this._rewardsLoaded = true; // Отмечаем, что награды загружены
      });
    } catch (error) {
      console.error("Error fetching all daily rewards:", error);
    }
  }

  // Проверка ежедневной награды
  async checkDailyReward(forceReload = false) {
    if (!forceReload && this._rewardChecked && !this._loading) {
      return;
    }

    this._loading = true;
    try {
      const data: DailyRewardCheckResponse = await checkDailyReward();
      runInAction(() => {
        this._available = data.available;
        this._dailyRewardDay = data.dailyRewardDay;
        this._lastDailyRewardClaimAt = data.lastDailyRewardClaimAt;
        this._nextDay = data.nextDay;
        this._rewardInfo = data.rewardInfo; // может быть null
        this._rewardChecked = true; // Отмечаем, что награда проверена
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
        // Сбрасываем флаг проверки, чтобы можно было проверить снова после получения награды
        this._rewardChecked = false;
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

      trackEvent("daily_reward_claim", {
        day: data.reward.day,
        reward: data.reward.reward,
        reward_type: data.reward.rewardType,
        second_reward: data.reward.secondReward ?? 0,
        second_reward_type: data.reward.secondRewardType ?? null,
      });

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
