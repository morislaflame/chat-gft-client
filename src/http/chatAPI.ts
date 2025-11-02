import { $authHost } from "./index";
import type { ApiMessageResponse, ApiHistoryResponse } from '@/types/types';

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