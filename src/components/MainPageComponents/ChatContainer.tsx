import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import FormattedText from './FormattedText';
import Button from '../CoreComponents/Button';
import AgentVideoModal from '../modals/AgentVideoModal';
import MissionVideoModal from '../modals/MissionVideoModal';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [inputValue, setInputValue] = useState('');
    const [isMissionExpanded, setIsMissionExpanded] = useState(false);
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

    const handleSendMessage = async (message: string) => {
        const response = await chat.sendMessage(message);
        // Проверяем, завершена ли миссия
        if (response && response.missionCompleted && response.mission) {
            setLastMissionCompleted({
                mission: response.mission,
                stage: response.stage || chat.currentStage
            });
        }
    };

    const handleStartClick = () => {
        hapticImpact('soft');
        // Получаем видео для текущей миссии (orderIndex = currentStage, так как оба начинаются с 1)
        const missionOrderIndex = chat.currentStage;
        const missionVideo = chat.getMissionVideoByOrderIndex(missionOrderIndex);
        
        if (missionVideo) {
            setCurrentMissionVideo({
                video: missionVideo,
                mission: chat.mission
            });
            setShowMissionVideoModal(true);
        } else {
            // Если видео нет, просто отправляем сообщение
            console.log('No mission video found, sending start message directly');
            handleSendMessage("старт");
        }
    };

    const handleStartNewMissionClick = () => {
        hapticImpact('soft');
        // Получаем видео для новой миссии (orderIndex = lastMissionCompleted.stage, так как оба начинаются с 1)
        if (lastMissionCompleted) {
            const missionOrderIndex = lastMissionCompleted.stage;
            const missionVideo = chat.getMissionVideoByOrderIndex(missionOrderIndex);
            
            if (missionVideo) {
                setCurrentMissionVideo({
                    video: missionVideo,
                    mission: lastMissionCompleted.mission
                });
                setShowMissionVideoModal(true);
            } else {
                // Если видео нет, просто отправляем сообщение
                console.log('No mission video found for new mission, sending start message directly');
                handleSendMessage("старт");
                setLastMissionCompleted(null);
            }
        }
    };

    const handleMissionVideoClose = () => {
        hapticNotification('success');
        setShowMissionVideoModal(false);
        // После закрытия видео отправляем сообщение "старт"
        if (currentMissionVideo) {
            handleSendMessage("старт");
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
        if (inputValue.trim()) {
            hapticImpact('soft');
            handleSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleSelectSuggestion = (text: string) => {
        hapticImpact('soft');
        handleSendMessage(text.trim());
    };

    // Показываем лоадинг пока загружается история чата
    if (chat.loading) {
        return <LoadingIndicator />;
    }

    // Вычисляем процент прогресса на основе текущего этапа
    // Этап 1 = 0%, этап 2 = 33.33%, этап 3 = 66.66%
    const progressPercent = chat.forceProgress;

    const isMobile = document.body.classList.contains('telegram-mobile');
    const backgroundUrl = chat.background?.url;
    const avatarUrl = chat.avatar?.url;

    return (
        <div className="h-full relative flex flex-col overflow-x-hidden w-full">
            {/* AI Introduction */}
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
            <div className="flex justify-center mb-6">
                <div className="mt-4 bg-primary-800 rounded-xl px-4 py-3 inline-block max-w-md w-full"
                style={{ marginTop: isMobile ? '156px' : '56px' }}>
                    
                    {/* Mission Info */}
                    {chat.mission && (
                        <div className="">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-md font-semibold text-amber-400">
                                    {t('stage')} {chat.currentStage}
                                </span>
                            </div>
                            <div className="text-sm text-gray-300">
                                <span className="font-medium text-gray-200">{t('mission')}:</span> {chat.mission}
                            </div>
                        </div>
                    )}
                    
                    {/* Start Button - показываем только если нет сообщений */}
                    {chat.messages.length === 0 && (
                        <div className="mt-4">
                            <Button
                                onClick={handleStartClick}
                                variant="secondary"
                                size="md"
                                className="w-full"
                                icon="fas fa-play"
                            >
                                {t('start')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Messages Container */}
            <div className="space-y-6">
                {Array.isArray(chat.messages) && chat.messages.map((message, index) => {
                    const isLastAIMessage = !message.isUser && index === chat.messages.length - 1;
                    const showSuggestions = isLastAIMessage && chat.suggestions && chat.suggestions.length > 0 && !chat.isTyping;
                    
                    return (
                        <div key={message.id} className="message-container flex items-start mb-6">
                            {!message.isUser && (
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2 overflow-hidden p-1">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fas fa-mask text-xs"></i>
                                    )}
                                </div>
                            )}
                            <div className={`flex-1 ${message.isUser ? 'flex justify-end' : ''}`}>
                                <div className={`rounded-xl px-4 py-3 ${
                                    message.isUser 
                                        ? 'bg-secondary-500 max-w-xs' 
                                        : 'bg-primary-800 rounded-tl-none'
                                }`}>
                                    <div className="text-sm">
                                        {message.isUser ? (
                                            <span className="whitespace-pre-wrap">{message.text}</span>
                                        ) : (
                                            <>
                                            <FormattedText text={message.text} />
                                            <AnimatePresence>
                                                {showSuggestions && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="mt-3 grid grid-cols-2 gap-2"
                                                    >
                                                        {chat.suggestions.map((suggestion, suggestionIndex) => (
                                                            <motion.button
                                                                key={suggestionIndex}
                                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                                className="bg-primary-700 hover:bg-primary-600 rounded-lg px-2 py-1.5 text-xs text-center transition-colors border border-primary-600 hover:border-red-500 text-white"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: suggestionIndex * 0.05 }}
                                                            >
                                                                {suggestion}
                                                            </motion.button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                        )}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {chat.isTyping && (
                    <div className="message-container flex items-start mb-6">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fas fa-mask text-xs"></i>
                            )}
                        </div>
                        <div className="bg-primary-800 rounded-xl rounded-tl-none px-4 py-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <AnimatePresence>
                {lastMissionCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="bg-primary-800 rounded-xl px-4 py-3 inline-block max-w-md w-full">
                            {/* Mission Info */}
                            <div className="">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-md font-semibold text-amber-400">
                                        {t('stage')} {lastMissionCompleted.stage}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300">
                                    <span className="font-medium text-gray-200">{t('mission')}:</span> {lastMissionCompleted.mission}
                                </div>
                            </div>
                            
                            {/* Start Button */}
                            <div className="mt-4">
                                <Button
                                    onClick={handleStartNewMissionClick}
                                    variant="secondary"
                                    size="md"
                                    className="w-full"
                                    icon="fas fa-play"
                                >
                                    {t('start')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
                <div ref={messagesEndRef} className='mb-[128px]'/>
            </div>

            {/* New Mission Block - показываем после завершения миссии */}
            

            </div>

            {/* Message Input */}
            <div className="absolute bottom-0 right-0 w-full p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex justify-end text-xs mb-2">
                                {/* <span className='backdrop-blur-sm rounded-full p-2'>{t('mission_progress')}</span> */}
                                <div className="flex items-center gap-2 cursor-pointer backdrop-blur-sm rounded-full p-2"
                                onClick={() => {
                                    hapticImpact('soft');
                                    setIsMissionExpanded(!isMissionExpanded);
                                }}
                                >
                                    <span className="text-amber-400 font-medium flex items-center">
                                        <i className="fas fa-gift mr-1"></i>
                                        {t('stage')} {chat.currentStage}
                                    </span>
                                    {chat.mission && (
                                        <button
                                            
                                            className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                                            aria-label="Toggle mission"
                                        >
                                            <i className={`fas ${isMissionExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 h-3 bg-primary-700 rounded-full overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 persuasion-bar" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                                {/* <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">{t('mission_progress')}</span>
                                </div> */}
                            </div>
                            {/* Current Mission - Collapsible */}
                            <AnimatePresence>
                                {chat.mission && isMissionExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 bg-primary-800 p-2 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-gray-100">{t('mission')}:</span>
                                                <span className="flex-1 text-xs text-gray-400">{chat.mission}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
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
