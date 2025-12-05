import { makeAutoObservable, runInAction } from "mobx";
import { getPublicAgents, type Agent } from "@/http/agentAPI";
import { setSelectedHistoryName } from "@/http/userAPI";
import type UserStore from "@/store/UserStore";
import type ChatStore from "@/store/ChatStore";

export default class AgentStore {
    _agents: Agent[] = [];
    _loading = false;
    _saving = false;
    _error = '';
    _userStore: UserStore | null = null;
    _chatStore: ChatStore | null = null;

    constructor(userStore?: UserStore, chatStore?: ChatStore) {
        makeAutoObservable(this);
        this._userStore = userStore || null;
        this._chatStore = chatStore || null;
    }

    setUserStore(userStore: UserStore) {
        this._userStore = userStore;
    }

    setChatStore(chatStore: ChatStore) {
        this._chatStore = chatStore;
    }

    setAgents(agents: Agent[]) {
        this._agents = agents;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setSaving(saving: boolean) {
        this._saving = saving;
    }

    setError(error: string) {
        this._error = error;
    }

    async fetchPublicAgents() {
        this.setLoading(true);
        this.setError('');
        try {
            const agents = await getPublicAgents();
            // Сортируем агентов по orderIndex
            const sortedAgents = [...agents].sort((a, b) => {
                if (a.orderIndex !== b.orderIndex) {
                    return a.orderIndex - b.orderIndex;
                }
                // Если orderIndex одинаковый, сортируем по дате создания
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            runInAction(() => {
                this.setAgents(sortedAgents);
            });
        } catch (error) {
            console.error("Error fetching public agents:", error);
            runInAction(() => {
                this.setError('Failed to load histories');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async selectHistory(historyName: string) {
        if (this._saving) return;
        
        this.setSaving(true);
        this.setError('');
        try {
            const response = await setSelectedHistoryName(historyName);
            // Обновляем selectedHistoryName в UserStore напрямую из ответа API
            if (this._userStore && response.selectedHistoryName) {
                runInAction(() => {
                    this._userStore!.setSelectedHistoryName(response.selectedHistoryName);
                });
            }
            // Загружаем историю чата для новой выбранной истории
            if (this._chatStore) {
                await this._chatStore.loadChatHistory();
            }
        } catch (error) {
            console.error("Error selecting history:", error);
            runInAction(() => {
                this.setError('Failed to change history');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setSaving(false);
            });
        }
    }

    getAgentByHistoryName(historyName: string): Agent | undefined {
        return this._agents.find(agent => agent.historyName === historyName);
    }

    get agents() {
        return this._agents;
    }

    get loading() {
        return this._loading;
    }

    get saving() {
        return this._saving;
    }

    get error() {
        return this._error;
    }
}

