import React, { useState, useRef, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';

const ChatContainer: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load chat history when component mounts
        chat.loadChatHistory();
    }, [chat]);

    const introTexts = {
        en: "I am Darth Vader, your AI assistant. Ask me anything about the Force, the Empire, or the galaxy far, far away.",
        ru: "Я Дарт Вейдер, ваш ИИ-помощник. Спрашивайте меня о Силе, Империи или галактике далеко-далеко отсюда."
    };

    const handleSendMessage = async (message: string) => {
        // Check balance first
        if (user.balance < 1) {
            alert('Insufficient balance. Please purchase more stars.');
            return;
        }

        // Deduct stars
        const deductResult = await user.deductBalance(1);
        if (!deductResult.success) {
            alert('Error processing payment. Please try again.');
            return;
        }

        // Send message using chat store
        await chat.sendMessage(message);
    };
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="pt-24 px-4 overflow-y-auto chat-scrollbar h-screen overflow-x-hidden">
            {/* AI Introduction */}
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
                            <div className="text-sm">{message.text}</div>
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
            <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-xs mb-1">
                    <span>Force Progress</span>
                    <span className="text-amber-400 font-medium flex items-center">
                        <i className="fas fa-gift mr-1"></i>
                        Gift at 100%
                    </span>
                </div>
                <div className="w-full h-3 bg-primary-700 rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 persuasion-bar" 
                        style={{ width: `${chat.forceProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Message Input */}
            <div className="fixed bottom-0 left-0 right-0 bg-primary-900 border-t border-primary-700 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
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
