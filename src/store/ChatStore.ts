import { makeAutoObservable } from "mobx";
import { sendMessage as apiSendMessage, getChatHistory } from "@/http/chatAPI";
import type { Message, ApiMessageResponse, ApiHistoryItem, ProgressData } from "@/types/types";
import type UserStore from "@/store/UserStore";

export default class ChatStore {
    _messages: Message[] = [];
    _isTyping = false;
    _forceProgress = 0;
    _forceProgressData: ProgressData | null = null;
    _suggestions: string[] = [];
    _loading = false;
    _error = '';
    _userStore: UserStore | null = null;

    constructor(userStore?: UserStore) {
        makeAutoObservable(this);
        this._userStore = userStore || null;
    }

    setUserStore(userStore: UserStore) {
        this._userStore = userStore;
    }

    setMessages(messages: Message[]) {
        this._messages = messages;
    }

    addMessage(message: Message) {
        this._messages.push(message);
    }

    setIsTyping(isTyping: boolean) {
        this._isTyping = isTyping;
    }

    setForceProgress(progress: number) {
        this._forceProgress = progress;
    }

    setForceProgressData(data: ProgressData | null) {
        this._forceProgressData = data;
        if (data) {
            // Вычисляем процент прогресса (от 0 до 100)
            this._forceProgress = (data.current / 10) * 100;
        }
    }

    setSuggestions(suggestions: string[]) {
        this._suggestions = suggestions;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async sendMessage(messageText: string, onEnergyUpdate?: (newEnergy: number) => void) {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            isUser: true,
            timestamp: new Date()
        };

        this.addMessage(userMessage);
        this.setIsTyping(true);
        this.setError('');

        try {
            const response: ApiMessageResponse = await apiSendMessage(messageText);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response || '',
                isUser: false,
                timestamp: new Date()
            };
            this.addMessage(aiMessage);
            
            // Обновляем энергию и баланс пользователя из ответа сервера
            if (response.newEnergy !== undefined) {
                if (this._userStore) {
                    this._userStore.setEnergy(response.newEnergy);
                }
                // Поддерживаем старый API через колбэк для обратной совместимости
                if (onEnergyUpdate) {
                    onEnergyUpdate(response.newEnergy);
                }
            }
            
            // Обновляем баланс пользователя из ответа сервера
            if (response.newBalance !== undefined && this._userStore) {
                this._userStore.setBalance(response.newBalance);
            }
            
            // Обновляем прогресс из ответа
            if (response.progress) {
                this.setForceProgressData({
                    current: response.progress.current,
                    level: response.progress.level,
                    untilReward: response.progress.untilReward,
                });
            }
            
            // Обновляем подсказки из ответа
            if (response.suggestions && response.suggestions.length > 0) {
                this.setSuggestions(response.suggestions);
            } else {
                // Если подсказок нет, очищаем их
                this.setSuggestions([]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Проверяем, если это ошибка недостаточного баланса
            const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
            if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('Insufficient energy')) {
                this.setError('Insufficient energy. Please purchase more stars.');
            } else {
                this.setError('Error: Unable to send message. Please try again.');
            }
        } finally {
            this.setIsTyping(false);
        }
    }

    async loadChatHistory() {
        this.setLoading(true);
        this.setError('');

        try {
            const response = await getChatHistory();
            const historyData = response.history;
            const progressData = response.progress;
            
            // Преобразуем данные из API в формат Message[]
            // Каждый элемент истории содержит и сообщение пользователя, и ответ AI
            const messages: Message[] = [];
            
            historyData.forEach((item: ApiHistoryItem, index: number) => {
                // Добавляем сообщение пользователя
                if (item.messageText) {
                    messages.push({
                        id: `${item.id}-user-${index}`,
                        text: item.messageText,
                        isUser: true,
                        timestamp: new Date(item.createdAt || Date.now())
                    });
                }
                
                // Добавляем ответ AI
                if (item.responseText) {
                    messages.push({
                        id: `${item.id}-ai-${index}`,
                        text: item.responseText,
                        isUser: false,
                        timestamp: new Date(item.createdAt || Date.now())
                    });
                }
            });
            
            
            this.setMessages(messages);
            
            // Устанавливаем прогресс из ответа
            if (progressData) {
                this.setForceProgressData(progressData);
            } else {
                this.setForceProgressData(null);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.setError('Error loading chat history');
        } finally {
            this.setLoading(false);
        }
    }

    clearMessages() {
        this.setMessages([]);
        this.setForceProgress(0);
        this.setSuggestions([]);
    }

    get messages() {
        return this._messages;
    }

    get isTyping() {
        return this._isTyping;
    }

    get forceProgress() {
        return this._forceProgress;
    }

    get forceProgressData() {
        return this._forceProgressData;
    }

    get suggestions() {
        return this._suggestions;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
