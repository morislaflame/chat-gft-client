import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import Button from '@/components/ui/button';
import AgentVideoModal from '../modals/AgentVideoModal';
import MissionVideoModal from '../modals/MissionVideoModal';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';
import ChatMessages from './chat/ChatMessages';
import GemsCaseProgress from './chat/GemsCaseProgress';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [inputValue, setInputValue] = useState('');
    // state for mission expansion is now managed inside MissionProgress
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showMissionVideoModal, setShowMissionVideoModal] = useState(false);
    const [currentMissionVideo, setCurrentMissionVideo] = useState<{ video: MediaFile; mission: string | null } | null>(null);
    const [lastMissionCompleted, setLastMissionCompleted] = useState<{ mission: string; stage: number } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const hasScrolledToBottomRef = useRef(false);

    // Загружаем историю только при монтировании или при изменении выбранной истории
    useEffect(() => {
        chat.loadChatHistory();
    }, [chat, user.user?.selectedHistoryName]);

    // Когда гем прилетает в хедер — обновляем баланс (temp) и запускаем анимацию прогресс-бара
    useEffect(() => {
        const onGemsLand = () => chat.onGemsLanded();
        document.addEventListener('gems-button-land', onGemsLand);
        return () => document.removeEventListener('gems-button-land', onGemsLand);
    }, [chat]);

    const handleSendMessage = async (message: string): Promise<boolean> => {
        if (user.energy <= 0) {
            chat.setInsufficientEnergy(true);
            return false;
        }

        const response = await chat.sendMessage(message);
        // Проверяем, завершена ли миссия
        if (response && response.missionCompleted && response.mission) {
            setLastMissionCompleted({
                mission: response.mission,
                stage: response.stage || chat.currentStage
            });
        }
        return true;
    };

    const handleStartMission = (orderIndex: number) => {
        hapticImpact('soft');
        const storyId = user.user?.selectedHistoryName || 'unknown';
        const mission = chat.missions.find((m) => m.orderIndex === orderIndex) || null;
        const missionId = mission?.id ?? null;

        trackEvent('mission_start_click', { order_index: orderIndex, mission_id: missionId, story_id: storyId });
        trackEvent('mission_start', { story_id: storyId, mission_id: missionId });
        if (missionId !== null) {
            chat.setMissionStart(missionId);
        }
        chat.markMissionHasMessagesByOrder(orderIndex);
        const missionVideo = chat.getMissionVideoByOrderIndex(orderIndex);
        
        if (missionVideo) {
            trackEvent('mission_video_open', { order_index: orderIndex, mission_id: missionId, story_id: storyId });
            setCurrentMissionVideo({
                video: missionVideo,
                mission: chat.mission
            });
            setShowMissionVideoModal(true);
        } else {
            console.log('No mission video found, sending start message directly');
            void handleSendMessage("старт");
        }
    };

    const handleMissionVideoClose = () => {
        hapticNotification('success');
        trackEvent('mission_video_close', { video_id: currentMissionVideo?.video?.id ?? null });
        setShowMissionVideoModal(false);
        // После закрытия видео отправляем сообщение "старт"
        if (currentMissionVideo) {
            void handleSendMessage("старт");
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        handleSendMessage(trimmed).then((sent) => {
            if (sent) {
                hapticImpact('soft');
                setInputValue('');
            }
        });
    };

    const handleSelectSuggestion = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        trackEvent('chat_suggestion_click', { length: trimmed.length });
        handleSendMessage(trimmed).then((sent) => {
            if (sent) {
                hapticImpact('soft');
            }
        });
    };

    // Показываем лоадинг пока загружается история чата
    if (chat.loading) {
        return <LoadingIndicator />;
    }

    
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
                className="flex-1 flex flex-col min-h-0 w-full overflow-y-auto hide-scrollbar ios-scroll overflow-x-hidden relative z-10"
            >
                <div className="flex-1 px-4 pb-[150px]">
                    <ChatMessages
                        onStartMission={handleStartMission}
                        onSelectSuggestion={handleSelectSuggestion}
                        messageEndRef={messagesEndRef}
                    />
                    <div className="w-full p-4 pt-0 flex flex-col gap-3 -mt-2 fixed bottom-22 left-0 right-0 z-20">
                        <GemsCaseProgress />
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={t('greeting')}
                                className="flex-1 backdrop-blur-sm btn-default-silver-border-transparent rounded-full border border-primary-600 px-3 py-2 text-sm focus:outline-none focus:border-secondary-500"
                            />
                            <Button
                                type="submit"
                                variant="gradient"
                                size="icon"
                                icon="fas fa-paper-plane"
                                className="shrink-0 h-10 w-10"
                            />
                        </form>
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
        </div>
    );
});

export default ChatContainer;
