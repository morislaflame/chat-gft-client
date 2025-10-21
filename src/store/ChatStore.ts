import { makeAutoObservable } from "mobx";
import { sendMessage as apiSendMessage, getChatHistory } from "@/http/chatAPI";
import type { Message, ApiMessageResponse, ApiHistoryItem } from "@/types/types";

export default class ChatStore {
    _messages: Message[] = [];
    _isTyping = false;
    _forceProgress = 0;
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
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

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async sendMessage(messageText: string) {
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
            this.setForceProgress(Math.min(this._forceProgress + 10, 100));
        } catch (error) {
            console.error('Error sending message:', error);
            this.setError('Error: Unable to send message. Please try again.');
        } finally {
            this.setIsTyping(false);
        }
    }

    async loadChatHistory() {
        this.setLoading(true);
        this.setError('');

        try {
            const historyData: ApiHistoryItem[] = await getChatHistory();
            // Преобразуем данные из API в формат Message[]
            const messages: Message[] = historyData.map((item: ApiHistoryItem) => ({
                id: item.id?.toString() || Date.now().toString(),
                text: item.responseText || item.messageText || '',
                isUser: item.messageText ? true : false,
                timestamp: new Date(item.createdAt || Date.now())
            }));
            this.setMessages(messages);
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

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
