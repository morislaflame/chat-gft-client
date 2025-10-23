import type { Task } from "@/types/types";
import { FRIENDS_ROUTE } from "./consts";
import TaskStore from "@/store/QuestStore";

// Интерфейс для ошибки с возможными полями
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Тип для результата обработчика задания
export interface TaskHandlerResult {
  success: boolean;
  redirect?: string; // Опциональное поле для перенаправления
  message?: string; // Добавляем поле для сообщения
}

// Тип для функции-обработчика задания
export type TaskHandler = (task: Task, store: TaskStore, userRefCode?: string) => Promise<TaskHandlerResult>;

// Получаем доступ к телеграм объекту
const tg = window.Telegram?.WebApp;

// Обработчик для обычных заданий (стандартное выполнение)
const defaultTaskHandler: TaskHandler = async (task: Task, store) => {
  try {
    await store.completeTask(task.id);
    return { success: true, message: "Task completed successfully" };
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, message: "Error completing task" };
  }
};


// Обработчик для проверки подписки на Telegram канал
const telegramSubscriptionHandler: TaskHandler = async (task: Task, store) => {
  try {
    const result = await store.checkChannelSubscription(task.id);
    
    // Логируем ответ для диагностики
    console.log("Telegram subscription check response:", result);
    
    // Убедимся, что сообщение существует
    const message = result.message || (result.success 
        ? "Subscription confirmed"
        : "Error checking subscription");
    
    if (result.success) {
      return { success: true, message };
    } else {
      // Если пользователь не подписан на канал, перенаправляем его
      if (task.metadata?.channelUsername) {
        // Получаем имя канала и удаляем символ @, если он там есть
        const channelName = task.metadata.channelUsername.replace(/^@/, '');
        
        // Формируем корректный URL канала
        const channelUrl = `https://t.me/${channelName}`;
        console.log("channelUrl", channelUrl);
        
        // Логируем для отладки
        console.log("Redirecting to channel:", channelUrl);
        
        // Используем метод openTelegramLink для открытия канала
        if (tg && typeof tg.openTelegramLink === 'function') {
          tg.openTelegramLink(channelUrl);
        } else {
          // Если метод недоступен, пробуем открыть ссылку обычным способом
          window.open(channelUrl, '_blank');
        }
      }
      
      return { success: false, message };
    }
  } catch (error) {
    console.error("Error checking channel subscription:", error);
    return { success: false, message: "Error checking channel subscription" };
  }
};

// Обработчик для реферальной программы - просто перенаправляет на страницу партнеров
const referralBonusHandler: TaskHandler = async () => {
  
  // Возвращаем успех и указываем, куда перенаправить пользователя
  return { 
    success: true, 
    redirect: FRIENDS_ROUTE,
    message: "Redirecting to partners page"
  };
};

// Обработчик для шаринга истории в Telegram
const storyShareHandler: TaskHandler = async (task: Task, store, userRefCode) => {
  try {
    // Используем метод из store для шаринга истории
    const result = await store.shareTaskToStory(task, userRefCode);
    
    if (result.success) {
      return { success: true, message: "Story published successfully" };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error("Error during story sharing:", error);
    return { success: false, message: "Error during story sharing" };
  }
};

// Обработчик для задачи по приглашению рефералов
const referralUsersTaskHandler: TaskHandler = async (task: Task, store) => {
  try {
    // Вызываем новый метод из стора (который вызовет API)
    const result = await store.checkReferralUsersTask(task.id);
    
    const message = result.message || (result.success 
        ? "Referral task completed successfully!" 
        : "Failed to complete referral task.");
    
    if (result.success) {
      return { success: true, message };
    } else {
      return { success: false, message: result.message || "Could not verify referral task." };
    }
  } catch (error: unknown) {
    console.error("Error checking referral users task:", error);
    const apiError = error as ApiError;
    const errorMessage = apiError?.response?.data?.message || "Error checking referral users task";
    return { success: false, message: errorMessage };
  }
};

const chatBoostTaskHandler: TaskHandler = async (task: Task, store) => {
  try {
    const result = await store.checkChatBoostTask(task.id); // Вызываем новый метод стора
    
    const message = result.message || (result.success 
        ? "Chat boost confirmed, thank you!" 
        : "Failed to confirm chat boost.");
    
    if (result.success) {
      return { success: true, message };
    } else {
      // Если пользователь не забустил канал и есть ссылка для буста, открываем ее
      if (task.metadata?.boostLink && tg && typeof tg.openTelegramLink === 'function') {
        console.log("Opening boost link:", task.metadata.boostLink);
        tg.openTelegramLink(task.metadata.boostLink);
      } else if (task.metadata?.boostLink) {
        // Фоллбэк, если tg.openTelegramLink недоступен
        console.log("Opening boost link via window.open:", task.metadata.boostLink);
        window.open(task.metadata.boostLink, '_blank');
      }
      return { success: false, message: result.message || "Could not verify chat boost." };
    }
  } catch (error: unknown) {
    console.error("Error handling chat boost task:", error);
    const apiError = error as ApiError;
    const errorMessage = apiError?.response?.data?.message || apiError?.message || "Error handling chat boost task";
    return { success: false, message: errorMessage };
  }
};

// Определяем обработчики по типу задания (коду)
export const getTaskHandler = (task: Task): TaskHandler => {
  // Если у задания есть код, выбираем соответствующий обработчик
  if (task.code) {
    switch (task.code) {
      case "TELEGRAM_SUB":
        return telegramSubscriptionHandler;
      case "REFERRAL_BONUS":
        return referralBonusHandler;
      case "STORY_SHARE":
        return storyShareHandler;
      case "REF_USERS":
        return referralUsersTaskHandler;
      case "CHAT_BOOST":
        return chatBoostTaskHandler;
      // Здесь можно добавить другие типы заданий
      default:
        return defaultTaskHandler;
    }
  }
  
  // По умолчанию используем стандартный обработчик
  return defaultTaskHandler;
};