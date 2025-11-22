export interface Bonus {
    id?: number;
    amount?: number;
    reason?: string; // 'deposit', 'gift', 'invite', 'purchase'
    createdAt?: string;
    sourceUserId?: number;
    referrerUserId?: number;
    [key: string]: unknown;
}

export interface UserInfo {
    id: number;
    username: string;
    telegramId: number;
    balance: number;
    energy: number;
    language: 'en' | 'ru';
    onboardingCompleted?: boolean;
    onboardingSeen?: boolean; // Поле с бэкенда для отслеживания просмотра онбординга
    firstName?: string;
    lastName?: string;
    refCode?: string;
    referralCount?: number;
    referrals?: Referral[];
    lastBonuses?: Bonus[];
    selectedHistoryName?: string; // Выбранная история пользователя (по умолчанию "starwars")
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
    missionCompleted?: boolean;
    stage?: number;
    completedStage?: number; // Номер завершенного этапа
    mission?: string;
    progressPercent?: number; // Процент прогресса по миссии (0-100)
    timestamp: string;
}

export interface ApiStatusResponse {
    stage: number;
    mission: string | null;
    status: string;
    progressPercent?: number | null; // Процент прогресса по миссии (0-100)
}

export interface ApiHistoryItem {
    id: number;
    userId: number;
    messageText: string;
    responseText: string;
    isCongratulation?: boolean;
    createdAt: string;
}

export interface ProgressData {
    current: number;
    level: number;
    untilReward: number;
    lastProgressAt?: string | null;
}

export interface StageRewardData {
    stageNumber: number;
    rewardAmount: number;
    isOpen: boolean;
}

export interface ForceProgress {
    messagesUntilGift: number;
    totalMessagesForGift: number;
    currentProgress: number;
    messageCount: number;
}

export interface MediaFile {
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    url: string;
    entityType: string;
    entityId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiHistoryResponse {
    history: ApiHistoryItem[];
    forceProgress?: ForceProgress;
    progress?: ProgressData;
    hasMore?: boolean;
    nextCursor?: number | null;
    video?: MediaFile | null;
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
    id: number;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    joinedAt: string;
    createdAt: string;
}

export interface StarsPackage {
    id: string;
    stars: number;
    price: number;
    bonus?: number;
    popular?: boolean;
}

export type TaskType = 'DAILY' | 'ONE_TIME' | 'SPECIAL';

export type RewardType = 'energy' | 'tokens';

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

  
export interface DailyRewardCheckResponse {
    available: boolean;
    dailyRewardDay: number;
    lastDailyRewardClaimAt: string | null;
    nextDay: number;
    rewardInfo: {
      day: number;
      reward: number;
      rewardType: RewardType;
      description: string;
    } | null;
  }

  export interface DailyRewardClaimResponse {
    message: string;
    reward: {
      id: number;
      day: number;
      reward: number;
      rewardType: RewardType;
      description: string;
    };
    user: {
      dailyRewardDay: number;
      lastDailyRewardClaimAt: string;
      balance: number;
      energy: number;
    };
  }