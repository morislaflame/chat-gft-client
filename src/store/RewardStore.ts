import { makeAutoObservable } from 'mobx';
import { rewardAPI, type Reward, type UserReward, type WithdrawalRequest } from '@/http/rewardAPI';
import { trackEvent } from '@/utils/analytics';

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
  _rewardsLoaded = false; // Флаг для отслеживания загрузки доступных наград
  _purchasesLoaded = false; // Флаг для отслеживания загрузки покупок
  _withdrawalsLoaded = false; // Флаг для отслеживания загрузки запросов на вывод

  constructor() {
    makeAutoObservable(this);
  }

  // Загрузить доступные награды
  async fetchAvailableRewards(forceReload = false) {
    // Проверяем, не загружены ли уже награды
    if (!forceReload && this._rewardsLoaded && this.availableRewards.length > 0 && !this.loading) {
      // Награды уже загружены, пропускаем загрузку
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      this.availableRewards = await rewardAPI.getAvailableRewards();
      this._rewardsLoaded = true; // Отмечаем, что награды загружены
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
  async fetchMyPurchases(forceReload = false) {
    // Проверяем, не загружены ли уже покупки
    if (!forceReload && this._purchasesLoaded && !this.loading) {
      // Покупки уже загружены, пропускаем загрузку
      return;
    }

    this.error = null;
    try {
      this.myPurchases = await rewardAPI.getMyPurchases();
      this._purchasesLoaded = true; // Отмечаем, что покупки загружены
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
      trackEvent('reward_purchase_attempt', { reward_id: rewardId });
      // Вызываем API для покупки награды
      const purchaseResponse = await rewardAPI.purchaseReward(rewardId);

      // Находим купленную награду (из ответа или из списка доступных)
      const purchasedReward = purchaseResponse.userReward?.reward
        || this.availableRewards.find(r => r.id === rewardId)
        || null;
      if (purchasedReward) {
        this.purchasedReward = purchasedReward;
        this.purchasePrice = purchaseResponse.userReward?.purchasePrice || purchasedReward.price;
        trackEvent('reward_purchase', {
          reward_id: rewardId,
          price: this.purchasePrice,
          currency: 'GEMS',
        });
      }

      // Мгновенно обновляем список купленных наград локально
      if (purchaseResponse.userReward) {
        const userRewardEntry: UserReward = {
          ...purchaseResponse.userReward,
          reward: purchaseResponse.userReward.reward || purchasedReward!,
        };
        const existingIndex = this.myPurchases.findIndex((p) => p.id === userRewardEntry.id);
        if (existingIndex >= 0) {
          this.myPurchases[existingIndex] = userRewardEntry;
        } else {
          this.myPurchases = [userRewardEntry, ...this.myPurchases];
        }
        this._purchasesLoaded = true;
      } else {
        // Fallback: обновляем покупки, если объект не пришёл
        await this.fetchMyPurchases(true);
      }
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to purchase reward';
      this.error = errorMessage || 'Failed to purchase reward';
      console.error('Error purchasing reward:', error);
      trackEvent('reward_purchase_failed', { reward_id: rewardId, reason: this.error || 'unknown' });
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
  async fetchWithdrawalRequests(forceReload = false) {
    // Проверяем, не загружены ли уже запросы на вывод
    if (!forceReload && this._withdrawalsLoaded && !this.loading) {
      // Запросы уже загружены, пропускаем загрузку
      return;
    }

    try {
      this.withdrawalRequests = await rewardAPI.getMyWithdrawalRequests();
      this._withdrawalsLoaded = true; // Отмечаем, что запросы загружены
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
      trackEvent('withdrawal_request_create_attempt', { user_reward_id: userRewardId });
      const response = await rewardAPI.createWithdrawalRequest(userRewardId);

      // Мгновенно обновляем список запросов, чтобы статус ушёл в pending
      const existingIndex = this.withdrawalRequests.findIndex((r) => r.id === response.id);
      if (existingIndex >= 0) {
        this.withdrawalRequests[existingIndex] = response;
      } else {
        this.withdrawalRequests = [response, ...this.withdrawalRequests];
      }
      this._withdrawalsLoaded = true;

      // Фоново обновляем запросы для консистентности
      void this.fetchWithdrawalRequests(true);
      trackEvent('withdrawal_request_created', { user_reward_id: userRewardId, request_id: response.id });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to create withdrawal request';
      this.error = errorMessage || 'Failed to create withdrawal request';
      console.error('Error creating withdrawal request:', error);
      trackEvent('withdrawal_request_create_failed', { user_reward_id: userRewardId, reason: this.error || 'unknown' });
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
    this._rewardsLoaded = false;
    this._purchasesLoaded = false;
    this._withdrawalsLoaded = false;
  }
}

export default RewardStore;
