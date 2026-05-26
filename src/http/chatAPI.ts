import { $authHost } from "./index";
import type {
    ApiMessageResponse,
    ApiStatusResponse,
    ClientErrorReportPayload,
    MediaFile,
} from '@/types/types';

export interface ApiHistoryResponse {
    history: Array<{
        id: number;
        role: 'user' | 'assistant';
        content: string;
        createdAt: string;
        missionId?: number | null;
        isCongratulation?: boolean;
    }>;
    hasMore?: boolean;
    nextCursor?: number | null;
    /** Подсказки для последнего сообщения (с сервера, при перезагрузке) */
    lastSuggestions?: ApiMessageResponse['suggestions'];
    /** main_step последнего ответа LLM — для восстановления прогрессбара при реплее */
    lastMainStep?: number | null;
    video?: MediaFile | null;
    avatar?: MediaFile | null;
    background?: MediaFile | null;
}

export const sendMessage = async (
    message: string,
    suggestionId?: string | null,
    payGemsForSuggestionId?: string | null,
    missionId?: number | null,
    beginReplay?: boolean,
): Promise<ApiMessageResponse> => {
    const body: Record<string, unknown> = {
        message,
        suggestionId: suggestionId ?? null,
        payGemsForSuggestionId: payGemsForSuggestionId ?? null,
    };
    if (missionId != null && Number.isFinite(missionId)) {
        body.missionId = missionId;
    }
    if (beginReplay) {
        body.beginReplay = true;
    }
    const { data } = await $authHost.post('api/message/', body);
    return data;
};

export const getChatHistory = async (
    limit?: number,
    cursor?: number | null,
    missionId?: number | null,
): Promise<ApiHistoryResponse> => {
    const params: { limit?: number; cursor?: number; missionId?: number } = {};
    if (limit !== undefined) params.limit = limit;
    if (cursor !== undefined && cursor !== null) params.cursor = cursor;
    if (missionId != null && Number.isFinite(missionId)) {
        params.missionId = missionId;
    }

    const { data } = await $authHost.get('api/message/history', { params });
    return data;
};

export const getStatus = async (): Promise<ApiStatusResponse> => {
    const { data } = await $authHost.get('api/message/status');
    return data;
};

export const submitClientErrorReport = async (
    payload: ClientErrorReportPayload & { clientMeta?: Record<string, unknown> },
): Promise<{ ok: boolean; id: string; llmTraceId: string | null }> => {
    const { data } = await $authHost.post('api/message/error-report', {
        clientMessage: payload.clientMessage,
        historyName: payload.historyName,
        missionId: payload.missionId,
        httpStatus: payload.httpStatus,
        serverMessage: payload.serverMessage,
        serverCode: payload.serverCode,
        suggestionId: payload.suggestionId,
        payGemsForSuggestionId: payload.payGemsForSuggestionId,
        beginReplay: payload.beginReplay,
        clientMeta: payload.clientMeta ?? undefined,
    });
    return data;
};