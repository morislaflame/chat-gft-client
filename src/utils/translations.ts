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
    shareToStory: {
      ru: 'Поделиться в истории',
      en: 'Share to story'
    },
    shareLinkWithFriends: {
      ru: 'Поделитесь этой ссылкой с друзьями, чтобы получать награды!',
      en: 'Share this link with friends to earn rewards!'
    },
    referralBonuses: {
      ru: 'Реферальные бонусы',
      en: 'Referral bonuses'
    },
    referralRewardDependsOnPackage: {
      ru: 'Награда зависит от пакета, который купит друг',
      en: 'The reward depends on the package your friend buys'
    },
    referralMaxPerFriend: {
      ru: 'Максимум за одного друга:',
      en: 'Maximum per friend:'
    },
    from: {
      ru: 'От',
      en: 'From'
    },
    noBonusesYet: {
      ru: 'Пока нет бонусов',
      en: 'No bonuses yet'
    },
    noBonusesYetReferralDesc: {
      ru: 'Пока нет бонусов. Пригласи друга и попроси его выбрать пакет — награда придёт сюда.',
      en: 'No bonuses yet. Invite a friend and ask them to choose a package — the reward will appear here.'
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
    check: {
        ru: 'Проверить',
        en: 'Check'
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
    buyFor: {
        ru: 'Купить за',
        en: 'Buy for'
    },
    buy: {
        ru: 'Купить',
        en: 'Buy'
    },
    quantity: {
        ru: 'Количество',
        en: 'Quantity'
    },
    total: {
        ru: 'Итого',
        en: 'Total'
    },
    caseContents: {
        ru: 'Содержимое бокса',
        en: 'Box contents'
    },
    insufficientBalance: {
        ru: 'Недостаточно гемов',
        en: 'Insufficient gems'
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
    allRewards: {
        ru: 'Все награды',
        en: 'All rewards'
    },
    available: {
        ru: 'Доступные',
        en: 'Available'
    },
    myPurchases: {
        ru: 'Мои покупки',
        en: 'My Purchases'
    },
    myRewards: {
        ru: 'Мои награды',
        en: 'My Rewards'
    },
    boxes: {
        ru: 'Боксы',
        en: 'Boxes'
    },
    myBoxes: {
        ru: 'Мои боксы',
        en: 'My boxes'
    },
    goToRewards: {
        ru: 'Перейти в награды',
        en: 'Go to rewards'
    },
    gemsInfoTitle: {
        ru: 'Что такое Gems',
        en: 'What are Gems'
    },
    gemsInfoP1: {
        ru: 'Gems — награда за прохождение истории',
        en: 'Gems are a reward for progressing through the story'
    },
    gemsInfoP2: {
        ru: 'Получай за миссии, квесты и друзей',
        en: 'Earn them from missions, quests, and friends'
    },
    gemsInfoP3: {
        ru: 'Трать в «Луте» на подарки и уникальные NFT',
        en: 'Spend them in “Loot” on gifts and unique NFTs'
    },
    energyInfoTitle: {
        ru: 'Зачем нужна энергия',
        en: 'What energy is for'
    },
    energyInfoP1: {
        ru: 'Энергия — это действия в игре',
        en: 'Energy powers your in-game actions'
    },
    energyInfoP2: {
        ru: 'Без энергии сюжет на паузе',
        en: 'Without energy, the story is paused'
    },
    energyInfoP3: {
        ru: 'Получай ее за квесты, друзей или покупку',
        en: 'Get it from quests, friends, or purchases'
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
        ru: 'Повторить',
        en: 'Retry'
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
        ru: 'Миссия пройдена!',
        en: 'Mission Completed!'
    },
    stageCompletedMissionPrefix: {
        ru: 'Вы завершили миссию',
        en: 'You have completed mission'
    },
    stageRewardGemsHint: {
        ru: 'Gems тратятся в “Луте” — на подарки и коробки с шансом NFT',
        en: 'Gems are spent in “Rewards” — on gifts and boxes with a chance for an NFT'
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
        ru: 'У вас недостаточно энергии для отправки сообщения. Вы можете приобрести ее в шопе, чтобы продолжить общение.',
        en: "You don't have enough energy to send a message. Purchase more energy in the store to continue chatting."
    },
    insufficientEnergyTasksNote: {
        ru: 'или получите бесплатную энергию за выполнение заданий',
        en: 'or get free energy by completing quests'
    },
    goToQuests: {
        ru: 'Перейти к заданиям',
        en: 'Go to quests'
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
    withdrawalSuccessTitle: {
        ru: 'Запрос создан',
        en: 'Request created'
    },
    withdrawalSuccessDesc: {
        ru: 'Мы обработаем ваш запрос и уведомим о статусе.',
        en: 'We will process your request and notify you of the status.'
    },
    withdrawalErrorTitle: {
        ru: 'Не удалось создать запрос',
        en: 'Failed to create request'
    },
    withdrawalErrorDesc: {
        ru: 'Попробуйте позже или обратитесь в поддержку.',
        en: 'Please try again later or contact support.'
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
    saving: {
        ru: 'Сохранение...',
        en: 'Saving...'
    },
    editReferralCode: {
        ru: 'Изменить реферальный код',
        en: 'Edit referral code'
    },
    referralCodeRules: {
        ru: 'От 3 до 8 символов. Допустимы только A-Z (без O, I) и цифры 2-9.',
        en: '3 to 8 characters. Allowed: A-Z (excluding O, I) and digits 2-9.'
    },
    referralCodeInvalid: {
        ru: 'Некорректный код',
        en: 'Invalid code'
    },
    referralCodeUpdateFailed: {
        ru: 'Не удалось обновить реферальный код',
        en: 'Failed to update referral code'
    },
    changeReferralCodeTitle: {
        ru: 'Сменить реферальный код?',
        en: 'Change referral code?'
    },
    changeReferralCodeDesc: {
        ru: 'За смену будет списано ',
        en: 'Changing will cost '
    },
    cost: {
        ru: 'Стоимость',
        en: 'Cost'
    },
    // DailyRewardProgress
    dailyRewards: {
        ru: 'Ежедневные награды',
        en: 'Daily rewards'
    },
    dailyRewardsDesc: {
        ru: 'Заходите каждый день и получайте награды',
        en: 'Come every day and get rewards'
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
    open: {
        ru: 'Открыть',
        en: 'Open'
    },
    opening: {
        ru: 'Открываем...',
        en: 'Opening...'
    },
    youWon: {
        ru: 'Вы выиграли:',
        en: 'You won:'
    },
    congratulations: {
        ru: 'Поздравляем!',
        en: 'Congratulations!'
    },
    caseNotAvailable: {
        ru: 'У вас нет этого бокса. Сначала купите его.',
        en: 'You do not have this box. Purchase it first.'
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
        ru: 'Приветствую,',
        en: 'Welcome,'
    },
    welcomeDescription: {
        ru: 'Это AI-игра, в которой ты становишься героем',
        en: 'This is an AI game where you become the hero'
    },
    welcomeDescription2: {
        ru: 'И переписываешь историю по-своему',
        en: 'And rewrite the story your way'
    },
    wanderer: {
        ru: 'Странник',
        en: 'Wanderer'
    },
    gameExplanationTitle: {
        ru: 'Приключения ведут к подаркам',
        en: 'Adventures lead to gifts'
    },
    gameExplanation1: {
        ru: 'Проходи миссии и продвигайся по сюжету',
        en: 'Complete missions and progress through the story'
    },
    gameExplanation2: {
        ru: 'За миссии получай Gems',
        en: 'Earn Gems from missions'
    },
    gameExplanation3: {
        ru: 'Обменивай Gems на подарки',
        en: 'Exchange Gems for gifts'
    },
    gameExplanation4: {
        ru: 'Энергию дают активные друзья и квесты',
        en: 'Active friends and quests give energy'
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
    },
    lookWhatIWon: {
        ru: 'Смотри, что я выиграл!',
        en: 'Look what I won!'
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
