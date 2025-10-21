import { makeAutoObservable } from "mobx";
import { getQuests, completeQuest } from "@/http/questAPI";
import type { Quest } from "@/types/types";

export default class QuestStore {
    _quests: Quest[] = [];
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setQuests(quests: Quest[]) {
        this._quests = quests;
    }

    updateQuest(questId: string, updates: Partial<Quest>) {
        this._quests = this._quests.map(quest => 
            quest.id === questId ? { ...quest, ...updates } : quest
        );
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async loadQuests() {
        this.setLoading(true);
        this.setError('');

        try {
            const quests = await getQuests();
            this.setQuests(quests);
        } catch (error) {
            console.error('Error loading quests:', error);
            this.setError('Error loading quests');
        } finally {
            this.setLoading(false);
        }
    }

    async completeQuest(questId: string) {
        try {
            await completeQuest(questId);
            this.updateQuest(questId, { completed: true });
        } catch (error) {
            console.error('Error completing quest:', error);
            this.setError('Error completing quest. Please try again.');
        }
    }

    getQuestsByType(type: 'daily' | 'subscribe' | 'join') {
        return this._quests.filter(quest => quest.type === type);
    }

    getCompletedQuests() {
        return this._quests.filter(quest => quest.completed);
    }

    getPendingQuests() {
        return this._quests.filter(quest => !quest.completed);
    }

    get quests() {
        return this._quests;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
