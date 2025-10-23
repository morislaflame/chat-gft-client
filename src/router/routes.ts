// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import QuestsPage from '@/pages/QuestsPage';
import FriendsPage from '@/pages/FriendsPage';
import RewardsPage from '@/pages/RewardsPage';
import StorePage from '@/pages/StorePage';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';

interface Route {
  path: string;
  Component: ComponentType;
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
  { path: QUESTS_ROUTE, Component: QuestsPage },
  { path: FRIENDS_ROUTE, Component: FriendsPage },
  { path: REWARDS_ROUTE, Component: RewardsPage },
  { path: STORE_ROUTE, Component: StorePage },
];

export const privateRoutes: Route[] = [
  // Для авторизованных пользователей - позже добавим личный кабинет и т.д.
];
