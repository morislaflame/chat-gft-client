
export const MAIN_ROUTE = '/';
export const QUESTS_ROUTE = '/quests';
export const FRIENDS_ROUTE = '/friends';
export const REWARDS_ROUTE = '/rewards';
/** Вкладка «Профиль» (ранее магазин) */
export const PROFILE_ROUTE = '/profile';
/** Шаблон детальной страницы коллекции сюжета */
export const PROFILE_STORY_ROUTE = '/profile/story/:historyName';

/** URL страницы коллекции для `historyName` (подходит для encodeURIComponent во фрагменте пути). */
export function buildProfileStoryPath(historyName: string): string {
    return `${PROFILE_ROUTE}/story/${encodeURIComponent(historyName)}`;
}

/** @deprecated используйте PROFILE_ROUTE */
export const STORE_ROUTE = PROFILE_ROUTE;
export const CASE_ROUTE = '/cases/:id';