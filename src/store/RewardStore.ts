import { makeAutoObservable } from 'mobx';
import { rewardAPI, type Reward, type UserReward, type WithdrawalRequest } from '@/http/rewardAPI';

class RewardStore {
  availableRewards: Reward[] = [];
  myPurchases: UserReward[] = [];
  withdrawalRequests: WithdrawalRequest[] = [];
  loading = false;
  error: string | null = null;
  purchasingRewards = new Set<number>();
  creatingWithdrawal = new Set<number>();
  purchasedReward: Reward | null = null;
  purchasePrice: number | null = null;

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
    this.error = null;
    try {
      this.myPurchases = await rewardAPI.getMyPurchases();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to load purchases';
      this.error = errorMessage || 'Failed to load purchases';
      console.error('Error fetching my purchases:', error);
    } 
  }

  // Купить награду
  async purchaseReward(rewardId: number): Promise<boolean> {
    this.purchasingRewards.add(rewardId);
    this.error = null;
    
    try {
      // Вызываем API для покупки награды
      const purchaseResponse = await rewardAPI.purchaseReward(rewardId);
      
      // Находим купленную награду
      const purchasedReward = this.availableRewards.find(r => r.id === rewardId);
      if (purchasedReward) {
        this.purchasedReward = purchasedReward;
        this.purchasePrice = purchaseResponse.userReward.purchasePrice || purchasedReward.price;
      }
      
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

  clearPurchasedReward() {
    this.purchasedReward = null;
    this.purchasePrice = null;
  }

  // Проверить, загружается ли покупка награды
  isRewardPurchasing(rewardId: number): boolean {
    return this.purchasingRewards.has(rewardId);
  }

  // Загрузить запросы на вывод
  async fetchWithdrawalRequests() {
    try {
      this.withdrawalRequests = await rewardAPI.getMyWithdrawalRequests();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to load withdrawal requests';
      this.error = errorMessage || 'Failed to load withdrawal requests';
      console.error('Error fetching withdrawal requests:', error);
    }
  }

  // Создать запрос на вывод
  async createWithdrawalRequest(userRewardId: number): Promise<boolean> {
    this.creatingWithdrawal.add(userRewardId);
    this.error = null;
    
    try {
      await rewardAPI.createWithdrawalRequest(userRewardId);
      // Обновляем список запросов
      await this.fetchWithdrawalRequests();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to create withdrawal request';
      this.error = errorMessage || 'Failed to create withdrawal request';
      console.error('Error creating withdrawal request:', error);
      return false;
    } finally {
      this.creatingWithdrawal.delete(userRewardId);
    }
  }

  // Проверить, создается ли запрос на вывод
  isCreatingWithdrawal(userRewardId: number): boolean {
    return this.creatingWithdrawal.has(userRewardId);
  }

  // Получить статус вывода для конкретной награды
  getWithdrawalStatus(userRewardId: number): 'pending' | 'completed' | 'rejected' | null {
    const request = this.withdrawalRequests.find(req => req.userRewardId === userRewardId);
    return request ? request.status : null;
  }

  // Проверить, можно ли создать запрос на вывод (нет активных запросов)
  canWithdraw(userRewardId: number): boolean {
    const request = this.withdrawalRequests.find(req => req.userRewardId === userRewardId);
    if (!request) return true;
    // Можно создать новый запрос только если предыдущий был отклонен
    return request.status === 'rejected';
  }

  // Очистить ошибки
  clearError() {
    this.error = null;
  }

  // Сбросить состояние
  reset() {
    this.availableRewards = [];
    this.myPurchases = [];
    this.withdrawalRequests = [];
    this.loading = false;
    this.error = null;
    this.purchasingRewards.clear();
    this.creatingWithdrawal.clear();
  }
}

export default RewardStore;
