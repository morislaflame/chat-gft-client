import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import Button from '../CoreComponents/Button';
import AgentVideoModal from '../modals/AgentVideoModal';
import MissionVideoModal from '../modals/MissionVideoModal';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import ChatMessages from './chat/ChatMessages';
import MissionProgress from './chat/MissionProgress';

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
        // Проверяем, нужно ли загружать историю (ChatStore сам проверит, не загружена ли она уже)
        chat.loadChatHistory();
    }, [chat, user.user?.selectedHistoryName]);

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
        chat.markMissionHasMessagesByOrder(orderIndex);
        const missionVideo = chat.getMissionVideoByOrderIndex(orderIndex);
        
        if (missionVideo) {
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
        <div className="h-full relative flex flex-col overflow-x-hidden w-full">
            <div 
                ref={chatContainerRef} 
                className="flex-1 px-4 w-full overflow-y-auto hide-scrollbar ios-scroll overflow-x-hidden relative"
                style={backgroundUrl ? {
                    backgroundImage: `linear-gradient(rgba(18, 24, 38, 0.93), rgba(18, 24, 38, 0.63)), url(${backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed'
                } : {}}
            >
                <ChatMessages
                    onStartMission={handleStartMission}
                    onSelectSuggestion={handleSelectSuggestion}
                    messageEndRef={messagesEndRef}
                />
            </div>

            <div className="absolute bottom-0 right-0 w-full p-4 flex flex-col gap-3">
                <MissionProgress />
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('greeting')}
                        className="flex-1 backdrop-blur-sm rounded-full border border-primary-700 px-3 py-2 text-sm focus:outline-none focus:border-secondary-500"
                    />
                    <Button
                        type="submit"
                        variant="secondary"
                        size="md"
                        icon="fas fa-paper-plane"
                        className="px-4 py-2"
                    />
                </form>
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
