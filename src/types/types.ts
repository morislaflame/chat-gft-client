export interface Bonus {
    id?: number;
    amount?: number;
    reason?: string; // 'deposit', 'gift', 'invite', 'purchase'
    bonusType?: 'energy' | 'balance'; // Тип бонуса: энергия или баланс
    createdAt?: string;
    sourceUserId?: number;
    referrerUserId?: number;
    sourceUser?: {
        id: number;
        telegramId: number;
        username?: string;
        firstName?: string;
        lastName?: string;
    };
    [key: string]: unknown;
}

export interface UserArtifact {
    code: string;
    name?: string;
    quantity: number;
}

export interface UserInfo {
    id: number;
    username: string;
    /** URL аватара Telegram (если отдаёт бэкенд) */
    avatarUrl?: string | null;
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
    /** Сохранённая на сервере выбранная миссия чата (missions.id) */
    selectedChatMissionId?: number | null;
    /** Артефакты в инвентаре для выбранной истории: для проверки USE на фронте */
    artifacts?: UserArtifact[];
}

/** Элемент каталога артефактов на странице профиля */
export interface ProfileInventoryArtifact {
    id: number;
    code: string;
    name: string;
    nameEn: string | null;
    level: number;
    /** HELPER | KEY | WEAPON | ARMOR | TRINKET — для градиента карточки */
    boostType?: string;
    description?: string | null;
    descriptionEn?: string | null;
    media: { id: number; url: string; mimeType: string } | null;
    /** Цена покупки за 1 шт. (gems). null = нельзя купить */
    buyPrice?: number | null;
    /** Цена продажи за 1 шт. (gems). null = нельзя продать */
    sellPrice?: number | null;
}

export interface ProfileInventoryCompanion {
    id: number;
    code: string;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    media?: { id: number; url: string; mimeType: string } | null;
    owned: boolean;
}

export interface ProfileInventoryStory {
    historyName: string;
    displayName: string | null;
    displayNameEn: string | null;
    artifacts: ProfileInventoryArtifact[];
    /** Компаньон истории (отдельно от артефактов) */
    companion?: ProfileInventoryCompanion | null;
    /** code → количество в инвентаре для данной истории */
    owned: Record<string, number>;
    /** code → сколько раз артефакт был найден (история; не влияет на UI гейта) */
    found: Record<string, number>;
    /** Открытые уровни миссий (1 всегда) */
    unlockedLevels: number[];
}

export interface ProfileInventoryResponse {
    stories: ProfileInventoryStory[];
}

export interface Product {
    id: number;
    name: string;
    energy: number;
    starsPrice: number;
  }

/** Ошибка чата: отдельный UI (повтор / перезагрузка). */
export type ChatMessageErrorKind = 'llm_format' | 'reload_app';

export interface ChatRetryPayload {
    messageText: string;
    suggestionId: string | null;
    payGemsForSuggestionId: string | null;
    beginReplay?: boolean;
}

export interface ChatSuggestion {
    id: string;
    text: string;
    kind: 'core' | 'detour' | 'neutral' | 'side' | 'quit';
    payable?: boolean;
    artifact_action?: boolean;
    artifact_code?: string;
    /** RECEIVE = получить, USE = применить, NONE = без действия с артефактом. Для USE: disable если нет артефакта */
    artifact_action_type?: 'RECEIVE' | 'USE' | 'NONE';
    artifact_amount?: number;
    /** Превью артефакта с бэкенда (обогащение по artifact_code) */
    artifact_media?: { id: number; url: string; mimeType: string } | null;
}

/** Данные для POST /api/message/error-report (репорт после сбоя чата). */
export interface ClientErrorReportPayload {
    clientMessage: string;
    httpStatus: number | null;
    serverMessage: string | null;
    serverCode: string | null;
    suggestionId: string | null;
    payGemsForSuggestionId: string | null;
    historyName: string;
    missionId: number | null;
    beginReplay: boolean;
    /** Доп. контекст (код axios, причина и т.д.). */
    clientMeta?: Record<string, unknown>;
}

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isTyping?: boolean;
    isMissionCard?: boolean;
    mission?: {
        id: number;
        title: string;
        titleEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        orderIndex: number;
    };
    missionId?: number | null;
    missionHasMessages?: boolean;
    isCongratulation?: boolean;
    chatErrorKind?: ChatMessageErrorKind;
    chatRetryPayload?: ChatRetryPayload;
    /** Контекст для отправки репорта (блок «перезагрузка»). */
    errorReportContext?: ClientErrorReportPayload;
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
    suggestions?: ChatSuggestion[];
    suggestionsFormatError?: boolean;
    /** Актуальный инвентарь артефактов после ответа (для обновления UserStore) */
    artifacts?: Array<{ code: string; quantity: number }>;
    missionCompleted?: boolean;
    /** Нет начисления наград (перепрохождение завершённой миссии) */
    rewardsSuppressed?: boolean;
    lastLlmReply?: string;
    nextMission?: {
        id: number;
        title: string;
        titleEn?: string | null;
        orderIndex: number;
    } | null;
    artifactsGate?: {
        completedLevel: number;
        openLevel: number;
        canOpen: boolean;
    } | null;
    stage?: number;
    completedStage?: number; // Номер завершенного этапа
    stageReward?: {
        stageNumber: number;
        rewardAmount: number | null;
        rewardCaseId?: number | null;
        rewardCase?: {
            id: number;
            name: string;
            nameEn?: string | null;
            description?: string | null;
            descriptionEn?: string | null;
            mediaFile?: { id: number; url: string; mimeType: string } | null;
        } | null;
    } | null;
    // If mission completion granted a case, backend returns created UserCase record(s)
    userCase?: {
        id: number;
        userId: number;
        caseId: number;
        isOpened: boolean;
        resultType?: 'reward' | 'gems' | 'energy' | null;
        resultRewardId?: number | null;
        createdAt?: string;
        updatedAt?: string;
    } | null;
    userCases?: Array<{
        id: number;
        userId: number;
        caseId: number;
        isOpened: boolean;
        resultType?: 'reward' | 'gems' | 'energy' | null;
        resultRewardId?: number | null;
        createdAt?: string;
        updatedAt?: string;
    }>;
    mission?: string;
    /** Текущий основной шаг миссии (beat) после ответа LLM — для UI целей */
    mainStep?: number | null;
    /** Reward for completing key beats in mission 1 or 2 */
    stepReward?: {
        stepNumber: number;
        rewardGems: number;
        newBalance: number;
    } | null;
    artifactAction?: {
        id: number;
        action: 'RECEIVE' | 'USE';
        artifact_code: string;
        artifact_name?: string | null;
        amount: number;
        enabled: boolean;
        available_quantity?: number | null;
        missing_reason?: string | null;
        ui_label?: string | null;
        /** С бэкенда при RECEIVE — для модалки «получен артефакт» */
        artifact_description?: string | null;
        artifact_description_en?: string | null;
        media?: { id: number; url: string; mimeType: string } | null;
    } | null;
    /** Выданный компаньон за первую миссию (если есть) */
    companion?: Omit<CompanionData, 'isOpen'> | null;
    /** @deprecated use companion */
    companionArtifact?: Omit<CompanionData, 'isOpen'> | null;
    /** Случайный артефакт level 1 за первую миссию (если есть) */
    firstMissionArtifact?: Omit<FirstMissionArtifactData, 'isOpen'> | null;
    timestamp: string;
}

export interface MissionProgress {
    missionId: number;
    orderIndex: number;
    status: 'locked' | 'in_progress' | 'completed' | 'replay_in_progress';
    mainStep?: number | null;
    mainStepsTotal?: number | null;
    beatsCompleted: number;
    artifactsFound: number;
    artifactsTotal: number;
}

/** Цели ключевых шагов для UI (индекс = main_step / beat из LLM, с 1) */
export interface MissionUiStepGoals {
    version?: number;
    steps: Array<{ index: number; text: string }>;
}

export interface Mission {
    id: number;
    agentId: number;
    title: string;
    titleEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    orderIndex: number;
    /** Уровень миссии — к какому уровню принадлежит миссия (совпадает с уровнем артефактов) */
    level?: number;
    video?: MediaFile | null;
    /** С бэкенда (getStatus): цели шагов для нижней плашки в чате */
    uiStepGoals?: MissionUiStepGoals | null;
    progress?: MissionProgress | null;
}

export interface ApiStatusResponse {
    stage: number;
    mission: string | null;
    status: string;
    mainStep?: number | null;
    mainStepsTotal?: number | null;
    agentId?: number | null;
    missions?: Mission[];
    missionsProgress?: MissionProgress[];
    /** С сервера: последняя сохранённая миссия чата */
    selectedChatMissionId?: number | null;
    /** Открытые уровни миссий для текущей истории (1 всегда) */
    unlockedLevels?: number[];
    /** След. закрытый уровень, готовый к открытию (без списка его миссий) */
    pendingOpenStoryLevel?: number | null;
}

export interface ApiHistoryItem {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    missionId?: number | null;
    isCongratulation?: boolean;
}

export interface StageRewardData {
    stageNumber: number;
    rewardAmount: number | null;
    rewardCaseId?: number | null;
    rewardCase?: {
        id: number;
        name: string;
        nameEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        mediaFile?: { id: number; url: string; mimeType: string } | null;
    } | null;
    isOpen: boolean;
    lastLlmReply?: string | null;
    nextMission?: {
        id: number;
        title: string;
        titleEn?: string | null;
        orderIndex: number;
    } | null;
    artifactsGate?: {
        completedLevel: number;
        openLevel: number;
        canOpen: boolean;
    } | null;
}

export interface StepRewardData {
    stepNumber: number;
    rewardGems: number;
    isOpen: boolean;
}

export interface CompanionData {
    id: number;
    code: string;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    media?: { id: number; url: string; mimeType: string } | null;
    isOpen: boolean;
}

/** @deprecated use CompanionData */
export type CompanionArtifactData = CompanionData;

export interface FirstMissionArtifactData {
    id: number;
    code: string;
    name: string;
    nameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    boostType?: string;
    ownedQty: number;
    media?: { id: number; url: string; mimeType: string } | null;
    isOpen: boolean;
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
    hasMore?: boolean;
    nextCursor?: number | null;
    lastSuggestions?: ApiMessageResponse['suggestions'];
    lastMainStep?: number | null;
    video?: MediaFile | null;
    avatar?: MediaFile | null;
    background?: MediaFile | null;
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
      rewardCaseId?: number | null;
      rewardCase?: {
        id: number;
        name: string;
        nameEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        mediaFile?: { id: number; url: string; mimeType: string } | null;
      } | null;
      secondReward?: number | null;
      secondRewardType?: RewardType | null;
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
      rewardCaseId?: number | null;
      rewardCase?: {
        id: number;
        name: string;
        nameEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        mediaFile?: { id: number; url: string; mimeType: string } | null;
      } | null;
      secondReward?: number | null;
      secondRewardType?: RewardType | null;
      description: string;
    };
    userCases?: Array<{
      id: number;
      userId: number;
      caseId: number;
      isOpened: boolean;
    }>;
    user: {
      dailyRewardDay: number;
      lastDailyRewardClaimAt: string;
      balance: number;
      energy: number;
    };
  }