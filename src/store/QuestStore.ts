import { makeAutoObservable, runInAction } from "mobx";
import { 
    getMyTasks, 
    completeTask, 
    checkChannelSubscription, 
    checkReferralUsersTask, 
    checkChatBoostTask 
} from "@/http/questAPI";
import type { Task } from "@/types/types";
import { getTaskHandler } from "@/utils/taskHandlers";
import { getStore } from "./StoreProvider";

// Получаем доступ к телеграм объекту
const tg = window.Telegram?.WebApp;

export default class QuestStore {
    _tasks: Task[] = [];
    _loading = false;
    _error = '';
    _taskLoadingStates: Map<number, boolean> = new Map();
    _completedTask: Task | null = null;
    _questsLoaded = false; // Флаг для отслеживания загрузки квестов

    constructor() {
        makeAutoObservable(this);
    }

    setTasks(tasks: Task[]) {
        this._tasks = tasks;
    }

    updateTask(taskId: number, updates: Partial<Task>) {
        this._tasks = this._tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        );
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    setTaskLoading(taskId: number, loading: boolean) {
        if (loading) {
            this._taskLoadingStates.set(taskId, true);
        } else {
            this._taskLoadingStates.delete(taskId);
        }
    }

    isTaskLoading(taskId: number): boolean {
        return this._taskLoadingStates.has(taskId);
    }

    // Получение списка заданий с информацией о прогрессе для текущего пользователя
    async loadQuests(forceReload = false) {
        // Проверяем, не загружены ли уже квесты
        if (!forceReload && this._questsLoaded && this._tasks.length > 0 && !this._loading) {
            // Квесты уже загружены, пропускаем загрузку
            return;
        }

        try {
            this.setLoading(true);
            this.setError('');
            const data = await getMyTasks();
            runInAction(() => {
                this.setTasks(data);
                this._questsLoaded = true; // Отмечаем, что квесты загружены
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.setError('Error loading tasks');
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    // Обновленный метод для выполнения задания с учетом типа
    async handleTaskAction(task: Task, userRefCode?: string) {
        try {
            this.setTaskLoading(task.id, true);
            const taskHandler = getTaskHandler(task);
            const result = await taskHandler(task, this, userRefCode);
            
            // Если задача была успешно выполнена, обновляем данные задачи
            if (result.success) {
                // Сохраняем старое состояние задачи
                const wasCompletedBefore = task.userProgress?.isCompletedForCurrent || false;
                
                // Обновляем конкретную задачу в списке
                await this.updateTaskProgress(task.id);
                
                // Проверяем, была ли задача завершена после обновления
                const updatedTask = this._tasks.find(t => t.id === task.id);
                const isCompletedNow = updatedTask?.userProgress?.isCompletedForCurrent || false;
                
                // Показываем модалку только если задача была только что завершена
                if (!wasCompletedBefore && isCompletedNow && updatedTask) {
                    runInAction(() => {
                        this._completedTask = updatedTask;
                    });
                }
            }
            
            // Возвращаем результат обработки, включая возможное перенаправление
            return result;
        } catch (error) {
            console.error("Error handling task:", error);
            return { success: false, message: "Error handling task" };
        } finally {
            runInAction(() => this.setTaskLoading(task.id, false));
        }
    }

    clearCompletedTask() {
        this._completedTask = null;
    }

    get completedTask() {
        return this._completedTask;
    }

    // Метод для обновления прогресса конкретной задачи
    async updateTaskProgress(taskId: number) {
        try {
            // Загружаем квесты с forceReload для получения актуальных данных
            const data = await getMyTasks();
            const updatedTask = data.find(task => task.id === taskId);
            if (updatedTask) {
                runInAction(() => {
                    this.updateTask(taskId, updatedTask);
                    // Обновляем весь список задач для синхронизации
                    this.setTasks(data);
                });
            }
            // Обновляем баланс пользователя после выполнения задачи
            getStore().user.fetchMyInfo();
        } catch (error) {
            console.error('Error updating task progress:', error);
        }
    }

    // Метод для выполнения задания
    async completeTask(taskId: number) {
        const result = await completeTask(taskId);
        return result;
    }

    // Проверка подписки на Telegram канал
    async checkChannelSubscription(taskId: number) {
        try {
            this.setTaskLoading(taskId, true);
            const result = await checkChannelSubscription(taskId);
            return result;
        } catch (error) {
            console.error("Error checking channel subscription:", error);
            throw error;
        } finally {
            runInAction(() => this.setTaskLoading(taskId, false));
        }
    }

    async checkReferralUsersTask(taskId: number) {
        try {
            this.setTaskLoading(taskId, true);
            const result = await checkReferralUsersTask(taskId);
            return result;
        } catch (error) {
            console.error("Error checking referral users task:", error);
            throw error;
        } finally {
            runInAction(() => this.setTaskLoading(taskId, false));
        }
    }

    async checkChatBoostTask(taskId: number) {
        try {
            this.setTaskLoading(taskId, true);
            const result = await checkChatBoostTask(taskId); 
            return result;
        } catch (error) {
            console.error("Error checking chat boost task:", error);
            throw error;
        } finally {
            runInAction(() => this.setTaskLoading(taskId, false));
        }
    }

    // Метод для шаринга истории в Telegram
    async shareTaskToStory(task: Task, userRefCode?: string) {
        try {
            // Проверяем наличие метода shareToStory в объекте Telegram
            if (!tg || typeof tg.shareToStory !== 'function') {
                console.error("Telegram shareToStory method is not available");
                return { success: false, message: "The shareToStory function is not available" };
            }
            
            // Получаем параметры шаринга из metadata задания, если они есть
            const mediaUrl = task.metadata?.mediaUrl || 'https://example.com/placeholder.jpg';
            const shareText = task.metadata?.shareText || 'Check out my achievements!';
            const widgetName = task.metadata?.widgetName || 'Open app';
            let widgetUrl = task.metadata?.widgetUrl || '';
            
            // Добавляем реферальный код, если он есть
            if (userRefCode) {
                // Проверяем, содержит ли URL уже параметры
                if (widgetUrl.includes('?')) {
                    widgetUrl = `${widgetUrl}&ref=${userRefCode}`;
                } else {
                    widgetUrl = `${widgetUrl}?ref=${userRefCode}`;
                }
            }
            
            // Логируем вызов функции для отладки
            console.log("Calling shareToStory with parameters:", {
                mediaUrl,
                shareText,
                widgetName,
                widgetUrl
            });
            
            // Вызываем функцию shareToStory
            tg.shareToStory(mediaUrl, {
                text: shareText,
                widget_link: {
                    url: widgetUrl,
                    name: widgetName
                }
            });
            
            // Отмечаем задание как выполненное на сервере
            await this.completeTask(task.id);
            
            return { success: true, message: "Story published successfully" };
            
        } catch (error) {
            console.error("Error during story sharing:", error);
            return { success: false, message: "Error during story sharing" };
        }
    }

    getQuestsByType(type: 'DAILY' | 'ONE_TIME' | 'SPECIAL') {
        return this._tasks.filter(task => task.type === type);
    }

    getCompletedQuests() {
        return this._tasks.filter(task => task.userProgress?.isCompletedForCurrent);
    }

    getPendingQuests() {
        return this._tasks.filter(task => !task.userProgress?.isCompletedForCurrent);
    }

    get quests() {
        return this._tasks;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
