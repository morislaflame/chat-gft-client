import { $authHost } from "./index";
import type { ApiMessageResponse, ApiStatusResponse, MediaFile } from '@/types/types';

export interface ApiHistoryResponse {
    history: Array<{
        id: number;
        userId: number;
        messageText: string;
        responseText: string;
        createdAt: string;
        isCongratulation?: boolean;
    }>;
    progress: {
        current: number;
        level: number;
        lastProgressAt: string | null;
    };
    hasMore: boolean;
    nextCursor: number | null;
    video?: MediaFile | null;
}

export const sendMessage = async (message: string): Promise<ApiMessageResponse> => {
    const { data } = await $authHost.post('api/message/', { message });
    return data;
};

export const getChatHistory = async (limit?: number, cursor?: number | null): Promise<ApiHistoryResponse> => {
    const params: { limit?: number; cursor?: number } = {};
    if (limit !== undefined) params.limit = limit;
    if (cursor !== undefined && cursor !== null) params.cursor = cursor;
    
    const { data } = await $authHost.get('api/message/history', { params });
    return data;
};

export const getStatus = async (): Promise<ApiStatusResponse> => {
    const { data } = await $authHost.get('api/message/status');
    return data;
};