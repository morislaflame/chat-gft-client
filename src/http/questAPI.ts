import { $authHost } from "./index";
import type { Quest } from '@/types/types';

export const getQuests = async (): Promise<Quest[]> => {
    const { data } = await $authHost.get('api/quest/status');
    return data;
};

export const completeQuest = async (questId: string): Promise<void> => {
    await $authHost.post('api/quest/verify', { questId });
};