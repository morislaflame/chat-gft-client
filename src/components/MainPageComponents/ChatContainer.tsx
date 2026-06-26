import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import AgentVideoModal from '../modals/AgentVideoModal';
import MissionVideoModal from '../modals/MissionVideoModal';
import ArtifactUseConfirmModal from '../modals/ArtifactUseConfirmModal';
import ArtifactUnavailableModal, {
    type ArtifactUnavailableContext,
} from '../modals/ArtifactUnavailableModal';
import ArtifactsExplainerModal from '../modals/ArtifactsExplainerModal';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';
import ChatMessages from './chat/ChatMessages';
import MissionStepGoalBar from './chat/MissionStepGoalBar';
import MissionDynamicProgress from './chat/MissionDynamicProgress';
import SomethingWentWrongPage from '../CoreComponents/SomethingWentWrongPage';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { language } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showMissionVideoModal, setShowMissionVideoModal] = useState(false);
    const [currentMissionVideo, setCurrentMissionVideo] = useState<{
        video: MediaFile;
        mission: string | null;
        beginReplay?: boolean;
    } | null>(null);
    const [lastMissionCompleted, setLastMissionCompleted] = useState<{ mission: string; stage: number } | null>(null);
    const [artifactUsePending, setArtifactUsePending] = useState<{
        text: string;
        suggestionId: string | null;
        payGemsForSuggestionId: string | null;
    } | null>(null);
    const [artifactUnavailableContext, setArtifactUnavailableContext] =
        useState<ArtifactUnavailableContext | null>(null);
    const [artifactsExplainerOpen, setArtifactsExplainerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const hasScrolledToBottomRef = useRef(false);

    // Загружаем историю при смене выбранной истории (смена миссии — через loadChatHistory в store)
    useEffect(() => {
        chat.loadChatHistory();
    }, [chat, user.user?.selectedHistoryName]);

    const handleSendMessage = async (
        message: string,
        suggestionId?: string | null,
        payGemsForSuggestionId?: string | null,
        beginReplay?: boolean,
    ): Promise<boolean> => {
        if (user.energy <= 0) {
            chat.setInsufficientEnergy(true);
            return false;
        }

        const response = await chat.sendMessage(
            message,
            undefined,
            suggestionId ?? null,
            payGemsForSuggestionId ?? null,
            beginReplay ? { beginReplay: true } : undefined,
        );
        // Проверяем, завершена ли миссия
        if (response && response.missionCompleted && response.mission) {
            setLastMissionCompleted({
                mission: response.mission,
                stage: response.stage || chat.currentStage
            });
        }
        return true;
    };

    const handleStartMission = (missionId: number) => {
        hapticImpact('soft');
        const storyId = user.user?.selectedHistoryName || 'unknown';
        const mission = chat.missions.find((m) => m.id === missionId) || null;
        const progress = chat.missionProgressFor(missionId);
        const beginReplay = progress?.status === 'completed';
        const orderIndex = mission?.orderIndex ?? null;

        trackEvent('mission_start_click', {
            order_index: orderIndex,
            mission_id: missionId,
            story_id: storyId,
        });
        trackEvent('mission_start', { story_id: storyId, mission_id: missionId });
        if (!chat.canSelectMission(missionId)) {
            return;
        }
        chat.primeMissionThread(missionId);
        chat.setMissionStart(missionId);

        chat.markMissionHasMessagesByMissionId(missionId);
        const missionVideo = chat.getMissionVideoByMissionId(missionId);
        
        if (missionVideo) {
            trackEvent('mission_video_open', { order_index: orderIndex, mission_id: missionId, story_id: storyId });
            setCurrentMissionVideo({
                video: missionVideo,
                mission: chat.mission,
                beginReplay,
            });
            setShowMissionVideoModal(true);
        } else {
            void handleSendMessage(language === 'en' ? 'start' : 'старт', null, null, beginReplay);
        }
    };

    const handleMissionVideoClose = () => {
        hapticNotification('success');
        trackEvent('mission_video_close', { video_id: currentMissionVideo?.video?.id ?? null });
        setShowMissionVideoModal(false);
        if (currentMissionVideo) {
            void handleSendMessage(
                language === 'en' ? 'start' : 'старт',
                null,
                null,
                currentMissionVideo.beginReplay === true,
            );
            setCurrentMissionVideo(null);
        }
        // Очищаем lastMissionCompleted после показа видео новой миссии
        if (lastMissionCompleted) {
            setLastMissionCompleted(null);
        }
    };

    const scrollToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages, chat.isTyping]);

    useEffect(() => {
        if (!chat.loading && chat.messages.length > 0 && !hasScrolledToBottomRef.current) {
                scrollToBottom();
                hasScrolledToBottomRef.current = true;
        }
    }, [chat.loading, chat.messages.length]);

    const handleSelectSuggestion = (
        text: string,
        suggestionId?: string | null,
        payGemsForSuggestionId?: string | null,
    ) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const sid = suggestionId ?? '';
        const meta = chat.suggestions?.find((m) => m.id === sid);
        if (
            meta?.artifact_action === true &&
            meta?.artifact_action_type === 'USE'
        ) {
            setArtifactUsePending({
                text: trimmed,
                suggestionId: sid || null,
                payGemsForSuggestionId: payGemsForSuggestionId ?? null,
            });
            return;
        }

        trackEvent('chat_suggestion_click', {
            length: trimmed.length,
            payGems: !!payGemsForSuggestionId,
        });
        handleSendMessage(
            trimmed,
            suggestionId ?? null,
            payGemsForSuggestionId ?? null,
        ).then((sent) => {
            if (sent) {
                hapticImpact('soft');
            }
        });
    };

    // Полноэкранный лоадер только при первичной загрузке пустой истории.
    // После отправки «старт» (isTyping / сообщения в чате) остаётся TypingIndicator в ленте.
    const showInitialHistoryLoader =
        chat.loading && chat.messages.length === 0 && !chat.isTyping;

    if (showInitialHistoryLoader) {
        return <LoadingIndicator />;
    }

    if (chat.historyLoadFailed) {
        return (
            <SomethingWentWrongPage
                onRetry={() => {
                    chat.clearHistoryLoadError();
                    void chat.loadChatHistory(true);
                }}
            />
        );
    }

    /** Реальные сообщения треда (не синтетическая карточка миссии); локальные user/ai могут без missionId */
    const hasMissionChatMessages = chat.messages.some((m) => !m.isMissionCard);

    const backgroundUrl = chat.background?.url;

    return (
        <div className="h-[100vh] relative flex flex-col overflow-x-hidden w-full fixed">
            {/* Fixed background layer behind everything */}
            {backgroundUrl && (
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(18, 24, 38, 0.93), rgba(18, 24, 38, 0.63)), url(${backgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                    aria-hidden
                />
            )}

            {/* Content: messages + bottom block, with navbar offset */}
            <div
                ref={chatContainerRef}
                className="flex-1 flex flex-col min-h-0 h-full w-full overflow-y-auto hide-scrollbar ios-scroll overflow-x-hidden relative z-10"
            >
                <div className="flex-1 px-4 pb-[164px]">
                    <ChatMessages
                        onStartMission={handleStartMission}
                        onOpenArtifactsExplainer={() => {
                            hapticImpact('soft');
                            setArtifactsExplainerOpen(true);
                        }}
                        onArtifactDisabledClick={(context) => {
                            hapticImpact('soft');
                            setArtifactUnavailableContext(context);
                        }}
                        onSelectSuggestion={handleSelectSuggestion}
                        onRetryLlmFormat={(payload) => {
                            hapticImpact('soft');
                            chat.retryAfterLlmFormatError(payload);
                        }}
                        onReloadApp={() => {
                            window.location.reload();
                        }}
                        onSubmitErrorReport={(payload) => chat.submitClientErrorReport(payload)}
                        messageEndRef={messagesEndRef}
                    />
                    <div className="w-full p-4 pt-0 flex flex-col gap-3 -mt-2 fixed bottom-22 left-0 right-0 z-20">
                        {hasMissionChatMessages ? (
                            <>
                                <MissionStepGoalBar
                                    onGoalBarClick={() => {
                                        hapticImpact('soft');
                                        setArtifactsExplainerOpen(true);
                                    }}
                                />
                                <MissionDynamicProgress />
                            </>
                        ) : null}
                        {/* <GemsCaseProgress /> */}
                    </div>
                </div>
            </div>

            {/* Agent Video Modal */}
            <AgentVideoModal
                isOpen={showVideoModal}
                video={chat.video}
                onClose={() => {
                    hapticNotification('success');
                    setShowVideoModal(false);
                }}
            />

            {/* Mission Video Modal */}
            <MissionVideoModal
                isOpen={showMissionVideoModal}
                video={currentMissionVideo?.video || null}
                onClose={handleMissionVideoClose}
            />

            <ArtifactUseConfirmModal
                isOpen={artifactUsePending != null}
                willPayGems={Boolean(artifactUsePending?.payGemsForSuggestionId)}
                onClose={() => setArtifactUsePending(null)}
                onConfirm={() => {
                    const p = artifactUsePending;
                    setArtifactUsePending(null);
                    if (!p) return;
                    trackEvent('chat_suggestion_click', {
                        length: p.text.length,
                        payGems: !!p.payGemsForSuggestionId,
                        artifact_use_confirmed: true,
                    });
                    void handleSendMessage(
                        p.text,
                        p.suggestionId,
                        p.payGemsForSuggestionId,
                    ).then((sent) => {
                        if (sent) {
                            hapticImpact('soft');
                        }
                    });
                }}
            />

            <ArtifactUnavailableModal
                isOpen={artifactUnavailableContext != null}
                context={artifactUnavailableContext}
                onClose={() => setArtifactUnavailableContext(null)}
            />

            <ArtifactsExplainerModal
                isOpen={artifactsExplainerOpen}
                onClose={() => setArtifactsExplainerOpen(false)}
            />
        </div>
    );
});

export default ChatContainer;
