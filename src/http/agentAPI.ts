import { $authHost } from "./index";

export interface Agent {
    id: number;
    historyName: string;
    description?: string | null;
    createdAt: string;
}

export const getPublicAgents = async (): Promise<Agent[]> => {
    const { data } = await $authHost.get('api/agent/public/all');
    return data;
};

