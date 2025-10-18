# Middleware система

## Описание

Мощная система промежуточного ПО для обработки навигации, аутентификации, авторизации и других задач. Поддерживает три типа middleware: роут-специфичные, глобальные и хуки before/after.

## Регистрация middleware

### Базовая регистрация

```javascript
import { registerMiddleware } from 'svelte-router-v5';

// Регистрируем middleware функцию
registerMiddleware('auth', async (context) => {
  // Проверяем аутентификацию
  const token = localStorage.getItem('auth_token');

  if (!token) {
    // Перенаправляем на страницу входа
    context.navigate('/login');
    return false; // Блокируем навигацию
  }

  // Разрешаем навигацию
  return true;
});
```

### Глобальные middleware

```javascript
import { registerGlobalMiddleware } from 'svelte-router-v5';

// Регистрируем глобальный middleware для всех роутов
registerGlobalMiddleware('before', async (context) => {
  console.log(`Навигация с ${context.from} на ${context.to}`);
  return true;
});

registerGlobalMiddleware('after', async (context) => {
  console.log(`Навигация завершена на ${context.to}`);
  return true;
});

registerGlobalMiddleware('error', async (error, context) => {
  console.error('Ошибка навигации:', error);
  // Можно отправить в систему мониторинга
  return true;
});
```

## Использование в роутах

### В конкретном роуте

```javascript
export const routes = {
  '/': Home,

  '/profile': {
    component: Profile,
    middleware: ['auth', 'profile-access']
  },

  '/admin': {
    component: Admin,
    middleware: ['auth', 'admin'],
    beforeEnter: async (context) => {
      console.log('Вход в админ панель');
      return true;
    },
    afterEnter: async (context) => {
      console.log('Выход из админ панели');
      return true;
    }
  }
};
```

### В группах роутов

```javascript
export const routes = {
  '/': Home,

  group: {
    prefix: '/admin',
    middleware: ['auth', 'admin'], // Общий middleware для группы
    routes: {
      '/': AdminDashboard,
      '/users': AdminUsers,
      '/settings': {
        component: AdminSettings,
        middleware: ['audit'] // Дополнительный middleware
      }
    }
  }
};
```

## Контекст middleware

Каждый middleware получает объект context с информацией о навигации:

```javascript
{
  from: '/previous-page',     // Предыдущий путь
  to: '/current-page',       // Текущий путь
  params: {id: '123'},       // Параметры роута
  query: {tab: 'profile'},   // Query параметры
  props: {userData: {...}},  // Дополнительные props
  navigate: function,        // Функция для навигации
  route: '/current-page'     // Текущий паттерн роута
}
```

## Примеры middleware

### Аутентификация

```javascript
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    context.navigate('/login');
    return false;
  }

  // Добавляем пользователя в контекст для других middleware
  context.user = user;
  return true;
});
```

### Проверка прав доступа

```javascript
registerMiddleware('admin', async (context) => {
  if (!context.user) {
    context.navigate('/login');
    return false;
  }

  if (context.user.role !== 'admin') {
    context.navigate('/unauthorized');
    return false;
  }

  return true;
});
```

### Логирование

```javascript
registerMiddleware('logger', async (context) => {
  console.log(`Навигация: ${context.from} -> ${context.to}`, {
    params: context.params,
    query: context.query,
    user: context.user?.id
  });

  // Отправка в аналитику
  if (typeof analytics !== 'undefined') {
    analytics.track('page_view', {
      from: context.from,
      to: context.to,
      userId: context.user?.id
    });
  }

  return true;
});
```

### API вызовы

```javascript
registerMiddleware('api-data', async (context) => {
  if (context.to.startsWith('/dashboard')) {
    try {
      // Загружаем данные для дашборда
      const dashboardData = await fetchDashboardData();
      context.props.dashboardData = dashboardData;
      return true;
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      context.navigate('/error');
      return false;
    }
  }

  return true;
});
```

### A/B тестирование

```javascript
registerMiddleware('ab-test', async (context) => {
  const userId = context.user?.id || 'anonymous';

  // Определяем вариант теста для пользователя
  const variant = getABTestVariant('new-feature', userId);

  if (variant === 'B' && context.to === '/dashboard') {
    context.navigate('/dashboard-v2');
    return false;
  }

  return true;
});
```

## Глобальные хуки

### beforeEnter в роутах

```javascript
export const routes = {
  '/checkout': {
    component: Checkout,
    beforeEnter: async (context) => {
      // Проверяем корзину перед переходом к оплате
      const cart = getCartFromStorage();

      if (cart.items.length === 0) {
        alert('Корзина пуста!');
        return false;
      }

      return true;
    }
  }
};
```

### afterEnter в роутах

```javascript
export const routes = {
  '/payment-success': {
    component: PaymentSuccess,
    afterEnter: async (context) => {
      // Очищаем корзину после успешной оплаты
      clearCart();

      // Отправляем событие в аналитику
      analytics.track('purchase_completed', {
        orderId: context.params.orderId,
        amount: context.props.amount
      });

      return true;
    }
  }
};
```

## Обработка ошибок

```javascript
// Глобальный обработчик ошибок
registerGlobalMiddleware('error', async (error, context) => {
  console.error('Ошибка роутера:', error);

  // Отправка в систему мониторинга
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(error, {
      contexts: {
        router: {
          from: context.from,
          to: context.to,
          params: context.params
        }
      }
    });
  }

  // Перенаправление на страницу ошибки
  context.navigate('/error');
  return false;
});
```

## Лучшие практики

1. **Именование** - Используйте описательные имена middleware
2. **Асинхронность** - Все middleware могут быть асинхронными
3. **Контекст** - Передавайте данные через context.props
4. **Ошибки** - Обрабатывайте ошибки в middleware
5. **Производительность** - Не делайте тяжелые операции в middleware

## Связанные функции

- [`registerMiddleware`](register-middleware.md) - Регистрация middleware
- [`registerGlobalMiddleware`](register-global-middleware.md) - Регистрация глобальных middleware
