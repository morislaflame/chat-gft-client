import { $authHost } from './index';

export interface Reward {
  id: number;
  name: string;
  price: number;
  tonPrice?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mediaFile?: {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string;
    entityType: string;
    entityId: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  purchasePrice: number;
  purchaseDate: string;
  reward: Reward;
}

export interface PurchaseResponse {
  message: string;
  userReward: UserReward;
  newBalance: number;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  userRewardId: number;
  status: 'pending' | 'completed' | 'rejected';
  completedAt?: string;
  completedBy?: number;
  createdAt: string;
  updatedAt: string;
  userReward: UserReward;
}

export const rewardAPI = {
  // Получить доступные награды для покупки
  getAvailableRewards: async (): Promise<Reward[]> => {
    const { data } = await $authHost.get('/api/reward/available');
    return data;
  },

  // Купить награду
  purchaseReward: async (rewardId: number): Promise<PurchaseResponse> => {
    const { data } = await $authHost.post(`/api/reward/purchase/${rewardId}`);
    return data;
  },

  // Получить купленные награды пользователя
  getMyPurchases: async (): Promise<UserReward[]> => {
    const { data } = await $authHost.get('/api/reward/my-purchases');
    return data;
  },

  // Создать запрос на вывод награды
  createWithdrawalRequest: async (userRewardId: number): Promise<WithdrawalRequest> => {
    const { data } = await $authHost.post('/api/withdrawal/create', { userRewardId });
    return data;
  },

  // Получить запросы на вывод пользователя
  getMyWithdrawalRequests: async (): Promise<WithdrawalRequest[]> => {
    const { data } = await $authHost.get('/api/withdrawal/my-requests');
    return data;
  },
};
