export const getOnboardingTexts = (language: 'en' | 'ru') => {
    const texts = {
        en: {
            welcome: "Welcome to the Adventure",
            joinAdventure: "Join Adventure",
            selectHistory: "Choose Your Story",
            select: "Select",
            loading: "Loading...",
            noHistories: "No histories available"
        },
        ru: {
            welcome: "Добро пожаловать в Приключение",
            joinAdventure: "Начать Приключение",
            selectHistory: "Выберите Историю",
            select: "Выбрать",
            loading: "Загрузка...",
            noHistories: "Истории недоступны"
        }
    };

    return texts[language];
};

export const getHistoryDisplayName = (historyName: string, language: 'en' | 'ru'): string => {
    const historyDisplayNames: Record<string, { en: string; ru: string }> = {
        starwars: { en: 'Star Wars', ru: 'Звёздные Войны' },
    };

    const displayName = historyDisplayNames[historyName];
    if (displayName) {
        return displayName[language];
    }
    return historyName.charAt(0).toUpperCase() + historyName.slice(1);
};

