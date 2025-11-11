import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import FormattedText from './FormattedText';
import Button from '../CoreComponents/Button';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const [inputValue, setInputValue] = useState('');
    const [isMissionExpanded, setIsMissionExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const hasScrolledToBottomRef = useRef(false);

    useEffect(() => {
        // Load chat history when component mounts
        chat.loadChatHistory();
        // Also load status independently to ensure it's loaded even if history is empty
        chat.loadStatus();
    }, [chat]);

    const introTexts = {
        en: "I am Darth Vader, your AI assistant. Ask me anything about the Force, the Empire, or the galaxy far, far away.",
        ru: "Я Дарт Вейдер, ваш ИИ-помощник. Спрашивайте меня о Силе, Империи или галактике далеко-далеко отсюда."
    };

    const handleSendMessage = async (message: string) => {
        await chat.sendMessage(message);
    };

    const scrollToBottom = (instant = false) => {
        // Используем контейнер сообщений для более надежного скролла
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        // Также используем messagesEndRef как fallback
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages, chat.isTyping]);

    // Скроллим вниз сразу после загрузки истории (instant scroll для первой загрузки)
    useEffect(() => {
        if (!chat.loading && chat.messages.length > 0 && !hasScrolledToBottomRef.current) {
            // Небольшая задержка, чтобы DOM успел обновиться
            setTimeout(() => {
                scrollToBottom(true); // Instant scroll для первой загрузки
                hasScrolledToBottomRef.current = true;
            }, 100);
        }
    }, [chat.loading, chat.messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            handleSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleSelectSuggestion = (text: string) => {
        setInputValue(text);
        // Фокусируемся на инпут после выбора подсказки
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
            input.focus();
        }
    };

    // Показываем лоадинг пока загружается история чата
    if (chat.loading) {
        return <LoadingIndicator />;
    }

    // Вычисляем процент прогресса на основе текущего этапа
    // Этап 1 = 0%, этап 2 = 33.33%, этап 3 = 66.66%
    const progressPercent = chat.forceProgress;

    return (
        <div className="h-full flex flex-col overflow-x-hidden max-w-full">
            {/* AI Introduction */}
            <div ref={chatContainerRef} className="flex-1 px-4 overflow-y-auto hide-scrollbar ios-scroll overflow-x-hidden">
            <div className="flex justify-center mb-6">
                <div className="bg-primary-800 rounded-xl px-4 py-3 inline-block max-w-md">
                    <div className="flex items-center mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2">
                            <img src="/images/dart.png" alt="Darth Vader" className="w-6 h-6 rounded-full" />
                        </div>
                        <div className="text-sm font-semibold text-red-400">Darth Vader</div>
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">{introTexts[user.user?.language || 'en']}</span>
                    </div>
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
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2">
                                    <i className="fas fa-mask text-xs"></i>
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
                                
                                {/* Подсказки под сообщением от AI */}
                                
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {chat.isTyping && (
                    <div className="message-container flex items-start mb-6">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2">
                            <i className="fas fa-mask text-xs"></i>
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
                <div ref={messagesEndRef} />
            </div>

            {/* Force Progress */}
            
            </div>

            {/* Message Input */}
            <div className="bg-primary-900 border-t border-primary-700 p-4 pb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-2">
                                <span>Force Progress</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400 font-medium flex items-center">
                                        <i className="fas fa-gift mr-1"></i>
                                        Stage {chat.currentStage}
                                    </span>
                                    {chat.mission && (
                                        <button
                                            onClick={() => setIsMissionExpanded(!isMissionExpanded)}
                                            className="text-amber-400 hover:text-amber-300 transition-colors"
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
                                        <div className="mt-4 border-t border-primary-700 pt-3">
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs text-gray-100">Миссия:</span>
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
                        placeholder="Type your message..."
                        className="flex-1 bg-primary-800 border border-primary-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary-500"
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
        </div>
    );
});

export default ChatContainer;
