// Пример использования svelte-router-v5 с TypeScript

import { createNavigation, LinkTo, getRoutParams, type Routes, type RouteParams } from 'svelte-router-v5';
import type { ComponentType } from 'svelte';

// Импорт компонентов
import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/User.svelte';
import NotFound from './pages/NotFound.svelte';

// Типизированные маршруты
const routes: Routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User,
  '/user/:id/delete/:postId': User,
  '*': NotFound,
};

// Создание навигации с типизацией
const currentComponent = createNavigation(routes);

// Пример использования в компоненте
export function MyComponent() {
  // Типизированные параметры
  const { id: userId, tab, theme }: RouteParams & { tab?: string; theme?: string } = $getRoutParams;
  
  return {
    userId,
    tab,
    theme
  };
}

// Пример использования LinkTo с типизацией
export const navigationLinks = [
  {
    route: '/',
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/about',
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/:id',
    params: { id: '123' } as RouteParams,
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  },
  {
    route: '/user/:id',
    params: { id: '456' } as RouteParams,
    queryParams: { tab: 'profile', theme: 'dark' },
    className: 'text-blue-600 hover:text-blue-800 font-medium'
  }
];

// Экспорт для использования
export { currentComponent, routes };
