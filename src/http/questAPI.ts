import { $authHost } from "./index";
import type { Task } from '@/types/types';

// Получение списка заданий с данными о прогрессе для текущего пользователя
export const getMyTasks = async (): Promise<Task[]> => {
    const { data } = await $authHost.get('api/quest/my-tasks');
    return data;
};

// Отметить выполнение задания (увеличение прогресса/завершение)
export const completeTask = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/complete', { taskId });
    return data;
};

// Проверка подписки на канал - передаем taskId вместо кода
export const checkChannelSubscription = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-subscription', { taskId });
    return data;
};

// Проверка выполнения задачи по приглашению рефералов
export const checkReferralUsersTask = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-referrals', { taskId });
    return data; // Ожидаем, что вернется { success: boolean, message: string, userTask: UserTaskProgress }
};

export const checkChatBoostTask = async (taskId: number) => {
    const { data } = await $authHost.post('api/quest/check-boost', { taskId });
    return data;
};