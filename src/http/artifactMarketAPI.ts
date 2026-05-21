import { $authHost } from './index';

export interface ArtifactMarketTradeResponse {
    success: boolean;
    newBalance: number;
    ownedQty: number;
    artifactId: number;
    artifactCode: string;
}

export const buyArtifact = async (
    artifactId: number,
    historyName: string,
): Promise<ArtifactMarketTradeResponse> => {
    const { data } = await $authHost.post('api/artifact-market/buy', {
        artifactId,
        historyName,
    });
    return data;
};

export const sellArtifact = async (
    artifactId: number,
    historyName: string,
): Promise<ArtifactMarketTradeResponse> => {
    const { data } = await $authHost.post('api/artifact-market/sell', {
        artifactId,
        historyName,
    });
    return data;
};
