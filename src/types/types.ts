export interface Bonus {
    amount?: number;
    type?: string;
    [key: string]: any;
}

export interface UserInfo {
    id: number;
    username: string;
    telegramId: number;
    balance: number;
    energy: number;
    language: 'en' | 'ru';
    onboardingCompleted?: boolean;
    firstName?: string;
    lastName?: string;
    refCode?: string;
    referralCount?: number;
    lastBonuses?: Bonus[];
}

export interface Product {
    id: number;
    name: string;
    energy: number;
    starsPrice: number;
  }

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isTyping?: boolean;
}

export interface ApiMessageResponse {
    userId: number;
    message: string;
    response: string;
    messageCount: number;
    isCongratulation: boolean;
    messagesUntilCongratulation: number;
    newEnergy: number;
    newBalance?: number;
    suggestions?: string[];
    isRelevant?: boolean;
    progress?: {
        current: number;
        untilReward: number;
        level: number;
    };
    timestamp: string;
}

export interface ApiHistoryItem {
    id: number;
    userId: number;
    messageText: string;
    responseText: string;
    isCongratulation: boolean;
    createdAt: string;
}

export interface ProgressData {
    current: number;
    level: number;
    untilReward: number;
    lastProgressAt?: string | null;
}

export interface ForceProgress {
    messagesUntilGift: number;
    totalMessagesForGift: number;
    currentProgress: number;
    messageCount: number;
}

export interface ApiHistoryResponse {
    history: ApiHistoryItem[];
    forceProgress?: ForceProgress;
    progress?: ProgressData;
    hasMore?: boolean;
    nextCursor?: number | null;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    reward: number;
    type: 'daily' | 'subscribe' | 'join';
    url?: string;
    completed: boolean;
    icon: string;
}

export interface Reward {
    id: string;
    name: string;
    image: string;
    slug: string;
    type: 'saber' | 'armor' | 'other';
}

export interface Referral {
    id: string;
    username: string;
    joinedAt: Date;
    reward: number;
}

export interface StarsPackage {
    id: string;
    stars: number;
    price: number;
    bonus?: number;
    popular?: boolean;
}

export type TaskType = 'DAILY' | 'ONE_TIME' | 'SPECIAL';

export type RewardType = 'energy';

export interface UserTaskInfo {
    progress: number;
    completed: boolean;
    completedAt: string | null;
  }

  export interface TaskUser extends UserInfo {
    user_task?: UserTaskInfo;
  }


  export interface Task {
    id: number;
    type: TaskType;
    reward: number;
    rewardType: RewardType;
    description: string;
    targetCount: number;
    code: string;
    metadata: Record<string, string>;
    // Если задачи получены с join-данными, то сюда попадёт массив пользователей с информацией о выполнении задания
    users?: TaskUser[];
    userProgress?: UserTaskProgress;
  }
  
  export interface UserTaskProgress {
    progress: number;
    isCompletedForCurrent: boolean;
    
    
  }
  
  export interface TasksResponse {
    success: boolean;
    message: string;
    completed: boolean;
    reward?: {
      amount: number;
      type: RewardType;
    };
  }