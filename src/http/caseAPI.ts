import { $authHost } from './index';
import type { Reward } from './rewardAPI';

export type CaseItemType = 'reward' | 'gems' | 'energy';

export interface CaseItem {
  id: number;
  caseId?: number;
  type: CaseItemType;
  rewardId?: number | null;
  amount?: number | null;
  weight: number;
  reward?: Pick<Reward, 'id' | 'name' | 'description' | 'isActive'> & {
    onlyCase?: boolean;
    price?: number;
  };
}

export interface CaseBox {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  mediaFile?: Reward['mediaFile'];
  items?: CaseItem[];
}

export interface UserCase {
  id: number;
  userId: number;
  caseId: number;
  isOpened: boolean;
  resultType: CaseItemType | null;
  resultRewardId: number | null;
  createdAt?: string;
  updatedAt?: string;
  case?: Pick<CaseBox, 'id' | 'name' | 'description' | 'price' | 'image' | 'isActive'>;
}

export interface PurchaseCaseResponse {
  message: string;
  userCase: UserCase;
  newBalance: number;
}

export type OpenCaseResult =
  | { type: 'reward'; reward: NonNullable<CaseItem['reward']>; userRewardId: number }
  | { type: 'gems'; amount: number }
  | { type: 'energy'; amount: number };

export interface OpenCaseResponse {
  message: string;
  result: OpenCaseResult;
  balance: number;
  energy: number;
}

export const caseAPI = {
  getActiveCases: async (): Promise<CaseBox[]> => {
    const { data } = await $authHost.get('/api/case/active');
    return data;
  },

  purchaseCase: async (caseId: number): Promise<PurchaseCaseResponse> => {
    const { data } = await $authHost.post(`/api/case/purchase/${caseId}`);
    return data;
  },

  getMyUnopenedCases: async (): Promise<UserCase[]> => {
    const { data } = await $authHost.get('/api/case/my/unopened');
    return data;
  },

  openCase: async (userCaseId: number): Promise<OpenCaseResponse> => {
    const { data } = await $authHost.post(`/api/case/open/${userCaseId}`);
    return data;
  },
};

