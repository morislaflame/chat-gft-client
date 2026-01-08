import { makeAutoObservable } from "mobx";
import { sendMessage as apiSendMessage, getChatHistory, getStatus } from "@/http/chatAPI";
import type { Message, ApiMessageResponse, ApiHistoryItem, StageRewardData, MediaFile, Mission } from "@/types/types";
import type UserStore from "@/store/UserStore";
import { trackEvent } from "@/utils/analytics";

export default class ChatStore {
    _messages: Message[] = [];
    _isTyping = false;
    _forceProgress = 0;
    _currentStage = 1;
    _mission: string | null = null;
    _suggestions: string[] = [];
    _loading = false;
    _error = '';
    _userStore: UserStore | null = null;
    _stageReward: StageRewardData | null = null;
    _insufficientEnergy = false;
    _video: MediaFile | null = null;
    _avatar: MediaFile | null = null;
    _background: MediaFile | null = null;
    _missions: Mission[] = [];
    _loadedHistoryName: string | null = null; // Отслеживаем для какой истории загружены данные
    private readonly SUGGESTIONS_STORAGE_KEY = 'chat_suggestions';

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

    markMissionHasMessagesByOrder(orderIndex: number) {
        const mission = this._missions.find((m) => m.orderIndex === orderIndex);
        if (!mission) return;
        const targetMissionId = mission.id;
        this._messages = this._messages.map((m) => {
            if (m.isMissionCard && m.missionId === targetMissionId && !m.missionHasMessages) {
                return { ...m, missionHasMessages: true };
            }
            return m;
        });
    }

    private appendMissionCardIfNeeded(mission: Mission) {
        const existing = this._messages.some(
            (m) => m.isMissionCard && m.missionId === mission.id
        );
        if (existing) return;

        this._messages.push({
            id: `mission-${mission.id}-${Date.now()}`,
            text: '',
            isUser: false,
            timestamp: new Date(),
            isMissionCard: true,
            mission: {
                id: mission.id,
                title: mission.title,
                description: mission.description,
                orderIndex: mission.orderIndex,
            },
            missionId: mission.id,
            missionHasMessages: false,
        });
    }

    setIsTyping(isTyping: boolean) {
        this._isTyping = isTyping;
    }

    setForceProgress(progress: number) {
        this._forceProgress = progress;
    }

    setCurrentStage(stage: number) {
        this._currentStage = stage;
        // Вычисляем процент прогресса на основе этапа
        // Этап 1 = 0%, этап 2 = 33.33%, этап 3 = 66.66%
        this._forceProgress = ((stage - 1) / 3) * 100;
    }

    setMission(mission: string | null) {
        this._mission = mission;
    }

    setStageReward(reward: StageRewardData | null) {
        this._stageReward = reward;
    }

    closeStageReward() {
        if (this._stageReward) {
            this._stageReward = { ...this._stageReward, isOpen: false };
        }
    }

    setInsufficientEnergy(value: boolean) {
        this._insufficientEnergy = value;
    }

    closeInsufficientEnergy() {
        this._insufficientEnergy = false;
    }

    setVideo(video: MediaFile | null) {
        this._video = video;
    }

    setAvatar(avatar: MediaFile | null) {
        this._avatar = avatar;
    }

    setBackground(background: MediaFile | null) {
        this._background = background;
    }

    setMissions(missions: Mission[]) {
        this._missions = missions;
    }

    getMissionVideoByOrderIndex(orderIndex: number): MediaFile | null {
        const mission = this._missions.find(m => m.orderIndex === orderIndex);
        return mission?.video || null;
    }

    setSuggestions(suggestions: string[]) {
        this._suggestions = suggestions;
        // Сохраняем suggestions в localStorage
        if (suggestions && suggestions.length > 0) {
            try {
                localStorage.setItem(this.SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
            } catch (error) {
                console.error('Failed to save suggestions to localStorage:', error);
            }
        } else {
            // Очищаем localStorage если suggestions пустые
            try {
                localStorage.removeItem(this.SUGGESTIONS_STORAGE_KEY);
            } catch (error) {
                console.error('Failed to remove suggestions from localStorage:', error);
            }
        }
    }

    private loadSuggestionsFromStorage(): string[] {
        try {
            const stored = localStorage.getItem(this.SUGGESTIONS_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load suggestions from localStorage:', error);
        }
        return [];
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
        
        // Очищаем suggestions при отправке нового сообщения
        this.setSuggestions([]);

        // Сохраняем баланс до отправки сообщения для вычисления награды
        const previousBalance = this._userStore?.user?.balance || 0;

        try {
            trackEvent('chat_message_send', {
                length: messageText.length,
                is_start: messageText.trim().toLowerCase() === 'старт' ? true : false,
                selected_history: this._userStore?.user?.selectedHistoryName || 'unknown',
            });
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
            
            // Обновляем прогресс из ответа
            if (response.stage !== undefined) {
                this.setCurrentStage(response.stage);
            }
            
            // Обновляем процент прогресса из ответа (если есть), иначе используется вычисление на основе этапа
            if (response.progressPercent !== undefined && response.progressPercent !== null) {
                this.setForceProgress(response.progressPercent);
            }
            
            if (response.mission !== undefined) {
                this.setMission(response.mission);
            }
            
            // Обновляем баланс пользователя из ответа сервера ПОСЛЕ обновления прогресса
            // чтобы правильно вычислить награду
            if (response.newBalance !== undefined && this._userStore) {
                // Если миссия завершена (missionCompleted), вычисляем сумму награды
                if (response.missionCompleted) {
                    const rewardAmount = response.newBalance - previousBalance;
                    
                    // Используем completedStage из ответа (если есть), иначе вычисляем предыдущий этап
                    const stageNumber = response.completedStage || (response.stage ? (response.stage === 1 ? 3 : response.stage - 1) : 1);
                    
                    this.setStageReward({
                        stageNumber: stageNumber,
                        rewardAmount: rewardAmount,
                        isOpen: true
                    });

                    trackEvent('mission_completed', {
                        stage: stageNumber,
                        reward_amount: rewardAmount,
                        selected_history: this._userStore?.user?.selectedHistoryName || 'unknown',
                    });
                }
                
                this._userStore.setBalance(response.newBalance);
            }

            // Если миссия завершена — добавляем карточку следующей миссии (если она есть и ещё не показана)
            if (response.missionCompleted && this._missions.length > 0) {
                const completedOrder = response.completedStage || (response.stage ? response.stage - 1 : 0);
                const nextOrder = completedOrder + 1;
                const nextMission = this._missions.find((m) => m.orderIndex === nextOrder);
                if (nextMission) {
                    this.appendMissionCardIfNeeded(nextMission);
                }
            }
            
            // Обновляем подсказки из ответа
            if (response.suggestions && response.suggestions.length > 0) {
                this.setSuggestions(response.suggestions);
            } else {
                // Если подсказок нет, очищаем их
                this.setSuggestions([]);
            }
            
            // Возвращаем response для использования в компонентах
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            // Проверяем, если это ошибка недостаточного баланса
            const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
            if (axiosError.response?.status === 400 && axiosError.response?.data?.message?.includes('Insufficient energy')) {
                this.setError('Insufficient energy. Please purchase more stars.');
                this.setInsufficientEnergy(true);
                trackEvent('chat_message_send_failed', { reason: 'insufficient_energy' });
            } else {
                this.setError('Error: Unable to send message. Please try again.');
                trackEvent('chat_message_send_failed', { reason: 'unknown' });
            }
            return null;
        } finally {
            this.setIsTyping(false);
        }
    }

    async loadChatHistory(forceReload = false) {
        const currentHistoryName = this._userStore?.user?.selectedHistoryName || null;
        if (!forceReload && currentHistoryName === this._loadedHistoryName && this._messages.length > 0 && !this._loading) {
            return;
        }

        this.setLoading(true);
        this.setError('');

        try {
            // Грузим историю и статус параллельно
            const [historyResponse, statusData] = await Promise.all([
                getChatHistory(),
                getStatus(),
            ]);
            const historyData = historyResponse.history ?? [];

            this.setCurrentStage(statusData.stage);
            if (statusData.progressPercent !== undefined && statusData.progressPercent !== null) {
                this.setForceProgress(statusData.progressPercent);
            }
            this.setMission(statusData.mission);
            if (statusData.missions) {
                this.setMissions(statusData.missions);
            }

            const missions = (statusData.missions || []).slice().sort((a, b) => a.orderIndex - b.orderIndex);
            const missionsMap = new Map<number, Mission>();
            missions.forEach((m) => missionsMap.set(m.id, m));

            // Разбиваем сообщения по missionId (историю сортируем по времени ASC)
            const missionMessages = new Map<number, ApiHistoryItem[]>();
            const orderedHistory = historyData.slice().sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            // Определяем минимальный orderIndex миссий, по которым есть сообщения в текущей порции истории
            let minOrderWithMessages: number | null = null;
            orderedHistory.forEach((item) => {
                const mid = item.missionId ?? null;
                if (mid !== null && missionsMap.has(mid)) {
                    const mOrder = missionsMap.get(mid)!.orderIndex;
                    if (minOrderWithMessages === null || mOrder < minOrderWithMessages) {
                        minOrderWithMessages = mOrder;
                    }
                    if (!missionMessages.has(mid)) missionMessages.set(mid, []);
                    missionMessages.get(mid)!.push(item);
                }
            });

            const messages: Message[] = [];

            // Добавляем миссии по порядку, показываем следующую только если предыдущая завершена или уже есть её сообщения
            let prevMissionCompleted = false;

            missions.forEach((mission, idx) => {
                const msgs = missionMessages.get(mission.id) || [];
                const hasMessages = msgs.length > 0;
                const lastMsg = hasMessages ? msgs[msgs.length - 1] : null;
                const missionCompleted = !!(lastMsg && lastMsg.isCongratulation);

                // Правила отображения:
                // - первая миссия всегда
                // - иначе, если есть сообщения по миссии (значит пользователь дошёл)
                // - или если предыдущая завершена
                // Если истории нет совсем — показываем первую миссию
                const noMessagesAtAll = orderedHistory.length === 0;

                // Если сообщения есть только для более поздних миссий (из-за пагинации),
                // не показываем карточки старых миссий без сообщений.
                const isBeforeFirstLoaded =
                    minOrderWithMessages !== null && mission.orderIndex < minOrderWithMessages;

                const canShow =
                    (noMessagesAtAll && idx === 0) || // свежий пользователь
                    hasMessages ||
                    prevMissionCompleted ||
                    (!isBeforeFirstLoaded && idx === 0);

                if (!canShow) {
                    prevMissionCompleted = missionCompleted;
                    return;
                }

                // Карточка миссии
                messages.push({
                    id: `mission-${mission.id}`,
                    text: '',
                    isUser: false,
                    timestamp: new Date(msgs[0]?.createdAt || Date.now()),
                    isMissionCard: true,
                    mission: {
                        id: mission.id,
                        title: mission.title,
                        description: mission.description,
                        orderIndex: mission.orderIndex,
                    },
                    missionId: mission.id,
                    missionHasMessages: hasMessages,
                });

                // Сообщения по миссии
                msgs.forEach((item) => {
                    messages.push({
                        id: `${item.id}`,
                        text: item.content,
                        isUser: item.role === 'user',
                        timestamp: new Date(item.createdAt || Date.now()),
                        missionId: item.missionId ?? null,
                        isCongratulation: item.isCongratulation ?? false,
                    });
                });

                prevMissionCompleted = missionCompleted;
            });


            this.setMessages(messages);

            // Медиа агента
            if (historyResponse.video !== undefined) {
                this.setVideo(historyResponse.video);
            }
            if (historyResponse.avatar !== undefined) {
                this.setAvatar(historyResponse.avatar);
            }
            if (historyResponse.background !== undefined) {
                this.setBackground(historyResponse.background);
            }

            // Восстанавливаем suggestions из localStorage для последнего сообщения бота
            const lastBotMessage = messages.filter(m => !m.isUser).pop();
            if (lastBotMessage) {
                const savedSuggestions = this.loadSuggestionsFromStorage();
                if (savedSuggestions.length > 0) {
                    this.setSuggestions(savedSuggestions);
                }
            }

            this._loadedHistoryName = currentHistoryName;
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.setError('Error loading chat history');
        } finally {
            this.setLoading(false);
        }
    }

    async loadStatus() {
        try {
            const statusData = await getStatus();
            this.setCurrentStage(statusData.stage);
            // Обновляем процент прогресса из ответа (если есть), иначе используется вычисление на основе этапа
            if (statusData.progressPercent !== undefined && statusData.progressPercent !== null) {
                this.setForceProgress(statusData.progressPercent);
            }
            this.setMission(statusData.mission);
            // Сохраняем миссии с видео
            if (statusData.missions) {
                this.setMissions(statusData.missions);
            }
        } catch (error) {
            console.error('Error loading status:', error);
            // Устанавливаем дефолтные значения при ошибке
            this.setCurrentStage(1);
            this.setMission(null);
        }
    }

    clearMessages() {
        this.setMessages([]);
        this.setForceProgress(0);
        this.setCurrentStage(1);
        this.setMission(null);
        this.setSuggestions([]);
        this._loadedHistoryName = null; // Сбрасываем отслеживание загруженной истории
        // Очищаем suggestions из localStorage при очистке сообщений
        try {
            localStorage.removeItem(this.SUGGESTIONS_STORAGE_KEY);
        } catch (error) {
            console.error('Failed to remove suggestions from localStorage:', error);
        }
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

    get currentStage() {
        return this._currentStage;
    }

    get mission() {
        return this._mission;
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

    get stageReward() {
        return this._stageReward;
    }

    get insufficientEnergy() {
        return this._insufficientEnergy;
    }

    get video() {
        return this._video;
    }

    get avatar() {
        return this._avatar;
    }

    get background() {
        return this._background;
    }

    get missions() {
        return this._missions;
    }
}
