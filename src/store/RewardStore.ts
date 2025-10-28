import { makeAutoObservable } from 'mobx';
import { rewardAPI, type Reward, type UserReward } from '@/http/rewardAPI';

class RewardStore {
  availableRewards: Reward[] = [];
  myPurchases: UserReward[] = [];
  loading = false;
  error: string | null = null;
  purchasingRewards = new Set<number>();

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузить доступные награды
  async fetchAvailableRewards() {
    this.loading = true;
    this.error = null;
    try {
      this.availableRewards = await rewardAPI.getAvailableRewards();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to load rewards';
      this.error = errorMessage || 'Failed to load rewards';
      console.error('Error fetching available rewards:', error);
    } finally {
      this.loading = false;
    }
  }

  // Загрузить купленные награды
  async fetchMyPurchases() {
    this.loading = true;
    this.error = null;
    try {
      this.myPurchases = await rewardAPI.getMyPurchases();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to load purchases';
      this.error = errorMessage || 'Failed to load purchases';
      console.error('Error fetching my purchases:', error);
    } finally {
      this.loading = false;
    }
  }

  // Купить награду
  async purchaseReward(rewardId: number): Promise<boolean> {
    this.purchasingRewards.add(rewardId);
    this.error = null;
    
    try {
      await rewardAPI.purchaseReward(rewardId);
      
      // Обновляем список купленных наград
      await this.fetchMyPurchases();
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to purchase reward';
      this.error = errorMessage || 'Failed to purchase reward';
      console.error('Error purchasing reward:', error);
      return false;
    } finally {
      this.purchasingRewards.delete(rewardId);
    }
  }

  // Проверить, загружается ли покупка награды
  isRewardPurchasing(rewardId: number): boolean {
    return this.purchasingRewards.has(rewardId);
  }

  // Очистить ошибки
  clearError() {
    this.error = null;
  }

  // Сбросить состояние
  reset() {
    this.availableRewards = [];
    this.myPurchases = [];
    this.loading = false;
    this.error = null;
    this.purchasingRewards.clear();
  }
}

export default RewardStore;
