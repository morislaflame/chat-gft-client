import { $authHost } from "./index";
import type { ApiMessageResponse, ApiHistoryItem } from '@/types/types';

export const sendMessage = async (message: string): Promise<ApiMessageResponse> => {
    const { data } = await $authHost.post('api/message/', { message });
    return data;
};

export const getChatHistory = async (): Promise<ApiHistoryItem[]> => {
    const { data } = await $authHost.get('api/message/history');
    return data.history || [];
};