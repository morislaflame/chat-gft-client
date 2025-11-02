import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from './LoadingIndicator';
import Suggestions from './Suggestions';
import SuggestionButton from './SuggestionButton';
import FormattedText from './FormattedText';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const [inputValue, setInputValue] = useState('');
    const [suggestionsExpanded, setSuggestionsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load chat history when component mounts
        chat.loadChatHistory();
    }, [chat]);

    const introTexts = {
        en: "I am Darth Vader, your AI assistant. Ask me anything about the Force, the Empire, or the galaxy far, far away.",
        ru: "Я Дарт Вейдер, ваш ИИ-помощник. Спрашивайте меня о Силе, Империи или галактике далеко-далеко отсюда."
    };

    const handleSendMessage = async (message: string) => {
        await chat.sendMessage(message);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages, chat.isTyping]);

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

    // Вычисляем процент прогресса
    const progressPercent = chat.forceProgressData 
        ? (chat.forceProgressData.current / 10) * 100 
        : 0;

    return (
        <div className="h-full flex flex-col overflow-x-hidden max-w-full">
            {/* AI Introduction */}
            <div className="flex-1 p-4 overflow-y-auto hide-scrollbar ios-scroll overflow-x-hidden">
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
            <div ref={chatContainerRef} className="space-y-6">
                {Array.isArray(chat.messages) && chat.messages.map((message) => (
                    <div key={message.id} className="message-container flex items-start mb-6">
                        {!message.isUser && (
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2">
                                <i className="fas fa-mask text-xs"></i>
                            </div>
                        )}
                        <div className={`rounded-xl px-4 py-3 ${
                            message.isUser 
                                ? 'bg-secondary-500 ml-auto max-w-xs' 
                                : 'bg-primary-800 rounded-tl-none'
                        }`}>
                            <div className="text-sm">
                                {message.isUser ? (
                                    <span className="whitespace-pre-wrap">{message.text}</span>
                                ) : (
                                    <FormattedText text={message.text} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

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
            <div className="bg-primary-900 border-t border-primary-700 p-4 pb-6 flex flex-col gap-2">
                <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 ">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Force Progress</span>
                            <span className="text-amber-400 font-medium flex items-center">
                                <i className="fas fa-gift mr-1"></i>
                                {chat.forceProgressData 
                                    ? `${chat.forceProgressData.untilReward} until reward`
                                    : 'Gift at 100%'}
                            </span>
                        </div>
                    <div className="flex-1 h-3 bg-primary-700 rounded-full overflow-hidden relative">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 persuasion-bar" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    </div>
                    {/* Кнопка Suggestions справа от прогрессбара */}
                    <AnimatePresence>
                        {chat.suggestions && chat.suggestions.length > 0 && (
                            <SuggestionButton 
                                onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
                                suggestionsCount={chat.suggestions.length}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
                    <div className="mb-2 w-full overflow-x-hidden">
                        <Suggestions 
                            suggestions={chat.suggestions} 
                            onSelectSuggestion={handleSelectSuggestion}
                            isExpanded={suggestionsExpanded}
                            onToggle={() => setSuggestionsExpanded(!suggestionsExpanded)}
                        />
                    </div>
                
                <form onSubmit={handleSubmit} className="flex space-x-2 ">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-primary-800 border border-primary-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary-500"
                    />
                    <button
                        type="submit"
                        className="bg-secondary-500 hover:bg-secondary-400 text-white px-4 py-2 rounded-lg transition"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    );
});

export default ChatContainer;
