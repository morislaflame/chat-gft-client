import type { Task } from "@/types/types";

type TranslationType = {
    [key: string]: {
      ru: string;
      en: string;
    }
  };
  
  export const translations: TranslationType = {
    balance: {
      ru: 'Баланс',
      en: 'Balance'
    },
    // ChatContainer
    greeting: {
      ru: 'Свой вариант истории',
      en: 'Your version of the story'
    },
    mission: {
      ru: 'Миссия',
      en: 'Mission'
    },
    stage: {
      ru: 'Этап',
      en: 'Stage'
    },
    start: {
      ru: 'Начать',
      en: 'Start'
    },
    // FriendsContainer
    referralProgram: {
      ru: 'Реферальная программа',
      en: 'Referral Program'
    },
    inviteFriendsEarnRewards: {
      ru: 'Приглашайте друзей и получайте награды',
      en: 'Invite friends and earn rewards'
    },
    yourReferralCode: {
      ru: 'Ваш реферальный код:',
      en: 'Your referral code:'
    },
    copyLink: {
      ru: 'Скопировать ссылку',
      en: 'Copy Link'
    },
    copied: {
      ru: 'Скопировано!',
      en: 'Copied!'
    },
    share: {
      ru: 'Поделиться',
      en: 'Share'
    },
    shareLinkWithFriends: {
      ru: 'Поделитесь этой ссылкой с друзьями, чтобы получать награды!',
      en: 'Share this link with friends to earn rewards!'
    },
    referralBonuses: {
      ru: 'Реферальные бонусы',
      en: 'Referral bonuses'
    },
    from: {
      ru: 'От',
      en: 'From'
    },
    noBonusesYet: {
      ru: 'Пока нет бонусов',
      en: 'No bonuses yet'
    },
    userDataUnavailable: {
      ru: 'Данные пользователя недоступны',
      en: 'User Data Unavailable'
    },
    userDataUnavailableDesc: {
      ru: 'Данные пользователя в данный момент недоступны. Пожалуйста, попробуйте позже.',
      en: 'User data is currently unavailable. Please try again later.'
    },
    refresh: {
      ru: 'Обновить',
      en: 'Refresh'
    },
    // Header
    language: {
      ru: 'Язык',
      en: 'Language'
    },
    mission_progress: {
        ru: 'Прогресс миссии',
        en: 'Mission Progress'
    },
    // QuestsContainer
    noTasksAvailable: {
        ru: 'Нет доступных заданий',
        en: 'No Tasks Available'
    },
    noTasksAvailableDesc: {
        ru: 'В данный момент нет доступных заданий. Загляните позже для новых испытаний!',
        en: 'There are no tasks available at the moment. Check back later for new challenges!'
    },
    noTasksYet: {
        ru: 'Пока нет заданий',
        en: 'No Tasks Yet'
    },
    noTasksYetDesc: {
        ru: 'У вас пока нет заданий. Заполните профиль или подождите появления новых заданий!',
        en: "You don't have any tasks yet. Complete your profile or wait for new tasks to appear!"
    },
    reward: {
        ru: 'Награда',
        en: 'Reward'
    },
    progress: {
        ru: 'Прогресс',
        en: 'Progress'
    },
    loading: {
        ru: 'Загрузка...',
        en: 'Loading...'
    },
    completed: {
        ru: 'Завершено',
        en: 'Completed'
    },
    complete: {
        ru: 'Выполнить',
        en: 'Complete'
    },
    // StoreContainer
    storeUnavailable: {
        ru: 'Магазин недоступен',
        en: 'Store Unavailable'
    },
    storeUnavailableDesc: {
        ru: 'Магазин в данный момент недоступен. Пожалуйста, попробуйте позже.',
        en: 'The store is currently unavailable. Please try again later.'
    },
    storeComingSoon: {
        ru: 'Магазин скоро откроется',
        en: 'Store Coming Soon'
    },
    storeComingSoonDesc: {
        ru: 'Магазин в данный момент пуст. Новые товары появятся скоро!',
        en: 'The store is currently empty. New products will be available soon!'
    },
    energy: {
        ru: 'Энергия',
        en: 'Energy'
    },
    // TaskCompletionModal
    taskCompleted: {
        ru: 'Задача выполнена!',
        en: 'Task Completed!'
    },
    taskRewardReceived: {
        ru: 'Вы получили:',
        en: 'You received:'
    },
    gems: {
        ru: 'Гемы',
        en: 'Gems'
    },
    great: {
        ru: 'Отлично!',
        en: 'Great!'
    },
    // RewardsContainer
    rewards: {
        ru: 'Награды',
        en: 'Rewards'
    },
    available: {
        ru: 'Доступные',
        en: 'Available'
    },
    myPurchases: {
        ru: 'Мои покупки',
        en: 'My Purchases'
    },
    noRewardsAvailable: {
        ru: 'Нет доступных наград',
        en: 'No Rewards Available'
    },
    noRewardsAvailableDesc: {
        ru: 'В данный момент нет доступных наград для покупки.',
        en: 'There are no rewards available for purchase at the moment.'
    },
    noPurchasesYet: {
        ru: 'Пока нет покупок',
        en: 'No Purchases Yet'
    },
    noPurchasesYetDesc: {
        ru: 'Вы еще не покупали награды. Посмотрите доступные награды!',
        en: "You haven't purchased any rewards yet. Check out the available rewards!"
    },
    withdrawn: {
        ru: 'Выведен',
        en: 'Withdrawn'
    },
    pending: {
        ru: 'Ожидает',
        en: 'Pending'
    },
    sending: {
        ru: 'Отправка...',
        en: 'Sending...'
    },
    retryRequest: {
        ru: 'Повторить запрос',
        en: 'Retry Request'
    },
    withdraw: {
        ru: 'Вывести',
        en: 'Withdraw'
    },
    purchasing: {
        ru: 'Покупка...',
        en: 'Purchasing...'
    },
    yourBalance: {
        ru: 'Ваш баланс:',
        en: 'Your Balance:'
    },
    // AgentVideoModal
    skip: {
        ru: 'Пропустить',
        en: 'Skip'
    },
    // HistorySelectionModal
    selectHistory: {
        ru: 'Выбрать историю',
        en: 'Select History'
    },
    selectHistoryDesc: {
        ru: 'Выберите историю, в которой хотите участвовать',
        en: 'Choose the story you want to participate in'
    },
    current: {
        ru: 'Текущая',
        en: 'Current'
    },
    errorLoadingHistories: {
        ru: 'Ошибка загрузки историй',
        en: 'Error loading histories'
    },
    retry: {
        ru: 'Повторить',
        en: 'Retry'
    },
    close: {
        ru: 'Закрыть',
        en: 'Close'
    },
    // StageRewardModal
    stageCompleted: {
        ru: 'Этап пройден!',
        en: 'Stage Completed!'
    },
    youHaveCompleted: {
        ru: 'Вы завершили',
        en: 'You have completed'
    },
    firstStage: {
        ru: 'Первый этап',
        en: 'First Stage'
    },
    secondStage: {
        ru: 'Второй этап',
        en: 'Second Stage'
    },
    thirdStage: {
        ru: 'Третий этап',
        en: 'Third Stage'
    },
    continue: {
        ru: 'Продолжить',
        en: 'Continue'
    },
    // InsufficientEnergyModal
    insufficientEnergy: {
        ru: 'Недостаточно энергии',
        en: 'Insufficient Energy'
    },
    insufficientEnergyDesc: {
        ru: 'У вас недостаточно энергии для отправки сообщения. Купите больше звезд, чтобы продолжить общение.',
        en: "You don't have enough energy to send a message. Purchase more stars to continue chatting."
    },
    goToStore: {
        ru: 'Перейти в магазин',
        en: 'Go to Store'
    },
    cancel: {
        ru: 'Отмена',
        en: 'Cancel'
    },
    // RewardPurchaseModal
    purchaseSuccessful: {
        ru: 'Покупка успешна!',
        en: 'Purchase Successful!'
    },
    // DailyRewardDayModal
    day: {
        ru: 'День',
        en: 'Day'
    },
    rewardReceived: {
        ru: 'Награда получена',
        en: 'Reward Received'
    },
    gotIt: {
        ru: 'Понятно',
        en: 'Got It'
    },
    // WithdrawalModal
    withdrawalRequest: {
        ru: 'Запрос на вывод приза',
        en: 'Withdrawal Request'
    },
    purchasedFor: {
        ru: 'Куплено за',
        en: 'Purchased for'
    },
    withdrawalInfo: {
        ru: 'После подтверждения ваш запрос будет отправлен администратору. Вы получите уведомление, когда приз будет выдан.',
        en: 'After confirmation, your request will be sent to the administrator. You will receive a notification when the prize is issued.'
    },
    confirm: {
        ru: 'Подтвердить',
        en: 'Confirm'
    },
    // DailyRewardModal
    dailyReward: {
        ru: 'Ежедневная награда',
        en: 'Daily Reward'
    },
    dayOf7: {
        ru: 'День {day} из 7',
        en: 'Day {day} of 7'
    },
    // progress: {
    //     ru: 'Прогресс',
    //     en: 'Progress'
    // },
    days: {
        ru: 'дней',
        en: 'days'
    },
    claiming: {
        ru: 'Получение...',
        en: 'Claiming...'
    },
    claimReward: {
        ru: 'Получить награду',
        en: 'Claim Reward'
    },
    // Onboarding
    welcomeToAdventure: {
        ru: 'Добро пожаловать в Приключение',
        en: 'Welcome to the Adventure'
    },
    joinAdventure: {
        ru: 'Начать Приключение',
        en: 'Join Adventure'
    },
    chooseYourStory: {
        ru: 'Выберите Историю',
        en: 'Choose Your Story'
    },
    // selectHistory: {
    //     ru: 'Выберите историю',
    //     en: 'Select History'
    // },
    select: {
        ru: 'Выбрать',
        en: 'Select'
    },
    noHistoriesAvailable: {
        ru: 'Истории недоступны',
        en: 'No histories available'
    },
    startYourAdventure: {
        ru: 'Начните свое приключение в этой удивительной истории!',
        en: 'Start your adventure in this amazing story!'
    },
    // WelcomeScreen
    welcome: {
        ru: 'Добро пожаловать,',
        en: 'Welcome,'
    },
    welcomeDescription: {
        ru: 'Ты стоишь на пороге новой истории. Каждая твоя реплика меняет судьбу.',
        en: 'You stand on the threshold of a new story. Every word you say changes destiny.'
    },
    wanderer: {
        ru: 'Странник',
        en: 'Wanderer'
    },
    // Navigation
    chat: {
        ru: 'Чат',
        en: 'Chat'
    },
    quests: {
        ru: 'Квесты',
        en: 'Quests'
    },
    friends: {
        ru: 'Друзья',
        en: 'Friends'
    },
    store: {
        ru: 'Магазин',
        en: 'Store'
    },
    loot: {
        ru: 'Лут',
        en: 'Rewards'
    },
    join: {
        ru: 'Присоединяйся — пиши свою историю ✍️✨ и собирай NFT-награды 🎁💎',
        en: 'Join — write your story ✍️✨ and collect NFT rewards 🎁💎'
    }
  };
  
  export const translate = (key: string, language: 'ru' | 'en'): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return translations[key][language];
  };



type TaskTranslations = {
  [key: string]: {
    ru: string;
    en: string;
  };
};

// Переводы для различных кодов заданий
export const taskTranslations: TaskTranslations = {
  // Подписки на телеграм-каналы
  TELEGRAM_SUB: {
    ru: "Присоединиться к каналу",
    en: "Join channel"
  },
  
  // Шаринг истории
  STORY_SHARE: {
    ru: "Поделиться историей в Telegram",
    en: "Share story on Telegram"
  },
  // Реферальная программа
  REFERRAL_BONUS: {
    ru: "Получайте награду за каждого приглашенного друга",
    en: "Get a reward for every referred friend"
  }
};

// Функция для получения локализованного текста задания
export const getTaskText = (task: Task, language: 'ru' | 'en'): string => {
  const { code, metadata, description } = task;
  
  // Если нет кода, возвращаем оригинальное описание
  if (!code || !taskTranslations[code]) {
    return description;
  }
  
  // Базовый текст из словаря переводов
  const text = taskTranslations[code][language];
  
  // Специальная обработка для разных типов заданий
  if (code === 'TELEGRAM_SUB' && metadata?.channelUsername) {
    // Удаляем @ из имени канала, если он присутствует
    const channelName = metadata.channelUsername.replace(/^@/, '');
    
    // Формируем текст с именем канала
    return language === 'ru' 
      ? `Присоединиться к каналу @${channelName}` 
      : `Join @${channelName} channel`;
  }
  
  return text;
};