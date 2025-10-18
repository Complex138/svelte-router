// Пример использования системы layout'ов

import { registerLayout } from '../src/index.js';
import AppLayout from './layouts/AppLayout.svelte';
import AdminLayout from './layouts/AdminLayout.svelte';
import UserLayout from './layouts/UserLayout.svelte';

// Регистрируем layout'ы
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);
registerLayout('user', UserLayout);

// Пример конфигурации роутов с layout'ами
export const routes = {
  // Глобальный layout для всего приложения
  defaultLayout: 'app',
  
  // Публичные роуты (используют глобальный layout 'app')
  '/': {
    component: () => import('./pages/Home.svelte')
  },
  
  '/about': {
    component: () => import('./pages/About.svelte')
  },
  
  // Админ роуты (переопределяют layout на 'admin')
  '/admin': {
    component: () => import('./pages/admin/Dashboard.svelte'),
    layout: 'admin'
  },
  
  '/admin/users': {
    component: () => import('./pages/admin/Users.svelte'),
    layout: 'admin'
  },
  
  // Группа пользовательских роутов (layout для всей группы)
  group: {
    prefix: '/user',
    layout: 'user',  // Слой для всей группы
    middleware: ['auth'],
    routes: {
      '/': {
        component: () => import('./pages/user/Dashboard.svelte')
        // Использует слой группы 'user'
      },
      
      '/profile': {
        component: () => import('./pages/user/Profile.svelte')
        // Использует слой группы 'user'
      },
      
      '/settings': {
        component: () => import('./pages/user/Settings.svelte')
        // Использует слой группы 'user'
      }
    }
  },
  
  // Роут без layout (переопределяет на null)
  '/login': {
    component: () => import('./pages/Login.svelte'),
    layout: null  // Без layout
  }
};

// Пример использования в App.svelte
/*
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<RouterView currentComponent={$currentComponent} />
*/
