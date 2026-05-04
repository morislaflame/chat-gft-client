// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import QuestsPage from '@/pages/QuestsPage';
import FriendsPage from '@/pages/FriendsPage';
import RewardsPage from '@/pages/RewardsPage';
import ProfilePage from '@/pages/ProfilePage';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE, CASE_ROUTE, PROFILE_STORY_ROUTE } from '@/utils/consts';
import CasePage from '@/pages/CasePage';
import ProfileStoryPage from '@/pages/ProfileStoryPage';

interface Route {
  path: string;
  Component: ComponentType;
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
  { path: QUESTS_ROUTE, Component: QuestsPage },
  { path: FRIENDS_ROUTE, Component: FriendsPage },
  { path: REWARDS_ROUTE, Component: RewardsPage },
  { path: PROFILE_STORY_ROUTE, Component: ProfileStoryPage },
  { path: STORE_ROUTE, Component: ProfilePage },
  { path: CASE_ROUTE, Component: CasePage },
];

export const privateRoutes: Route[] = [
  // Для авторизованных пользователей - позже добавим личный кабинет и т.д.
];
