import { $authHost } from "./index";
import type { MediaFile } from '@/types/types';

export interface Agent {
    id: number;
    historyName: string;
    displayName?: string | null;
    displayNameEn?: string | null;
    description?: string | null;
    descriptionEn?: string | null;
    orderIndex: number;
    createdAt: string;
    video?: MediaFile | null;
    avatar?: MediaFile | null;
    preview?: MediaFile | null;
}

export const getPublicAgents = async (): Promise<Agent[]> => {
    const { data } = await $authHost.get('api/agent/public/all');
    return data;
};

