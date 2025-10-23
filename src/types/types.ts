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
    newBalance: number;
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

export interface ForceProgress {
    messagesUntilGift: number;
    totalMessagesForGift: number;
    currentProgress: number;
    messageCount: number;
}

export interface ApiHistoryResponse {
    history: ApiHistoryItem[];
    forceProgress: ForceProgress;
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