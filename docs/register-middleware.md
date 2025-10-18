# registerMiddleware - Регистрация middleware

## Описание

Функция для регистрации middleware функций в системе роутера. Middleware позволяют выполнять код перед/после навигации.

## Синтаксис

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware(name, middlewareFunction);
```

## Параметры

- `name` (String) - Уникальное имя middleware (обязательный)
- `middlewareFunction` (Function) - Функция middleware (обязательный)

## Структура middleware функции

```javascript
async function middlewareFunction(context) {
  // context содержит информацию о навигации
  console.log('Навигация:', context.from, '->', context.to);

  // Можно заблокировать навигацию
  if (someCondition) {
    return false;
  }

  // Можно добавить данные в контекст
  context.props.userData = await fetchUserData();

  // Разрешаем навигацию
  return true;
}
```

## Контекст middleware

Объект context содержит:

```javascript
{
  from: '/previous-page',     // Предыдущий путь
  to: '/current-page',       // Текущий путь
  params: {id: '123'},       // Параметры роута
  query: {tab: 'profile'},   // Query параметры
  props: {},                 // Дополнительные props
  navigate: function,        // Функция для навигации
  route: '/current-page'     // Текущий паттерн роута
}
```

## Примеры использования

### Аутентификация

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    // Перенаправляем на страницу входа
    context.navigate('/login');
    return false; // Блокируем навигацию
  }

  // Загружаем данные пользователя
  try {
    const user = await fetchUserProfile(token);
    context.props.user = user;
    return true;
  } catch (error) {
    console.error('Failed to load user:', error);
    context.navigate('/login');
    return false;
  }
});
```

### Логирование

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('logger', async (context) => {
  console.log(`Навигация: ${context.from} -> ${context.to}`, {
    params: context.params,
    query: context.query,
    timestamp: Date.now()
  });

  // Отправка в аналитику
  if (typeof analytics !== 'undefined') {
    analytics.track('page_view', {
      from: context.from,
      to: context.to,
      params: context.params
    });
  }

  return true;
});
```

### Проверка прав доступа

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('admin', async (context) => {
  const user = context.props.user;

  if (!user) {
    context.navigate('/login');
    return false;
  }

  if (user.role !== 'admin') {
    context.navigate('/unauthorized');
    return false;
  }

  return true;
});
```

### Загрузка данных

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('data-loader', async (context) => {
  // Загружаем данные только для определенных роутов
  if (context.to.startsWith('/dashboard')) {
    try {
      const dashboardData = await fetchDashboardData();
      context.props.dashboardData = dashboardData;
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      context.props.error = 'Failed to load dashboard';
    }
  }

  return true;
});
```

### Валидация параметров

```javascript
import { registerMiddleware } from 'svelte-router-v5';

registerMiddleware('validate-params', async (context) => {
  const { id } = context.params;

  if (!id || !/^\d+$/.test(id)) {
    context.navigate('/error');
    return false;
  }

  // Валидация завершена успешно
  return true;
});
```

### Использование в роутах

```javascript
// routes.js
import { registerMiddleware } from 'svelte-router-v5';

// Регистрируем middleware
registerMiddleware('auth', authMiddleware);
registerMiddleware('admin', adminMiddleware);
registerMiddleware('logger', loggerMiddleware);

export const routes = {
  '/': Home,

  '/profile': {
    component: Profile,
    middleware: ['auth']  // Используем зарегистрированный middleware
  },

  '/admin': {
    component: Admin,
    middleware: ['auth', 'admin']  // Несколько middleware
  },

  '/dashboard': {
    component: Dashboard,
    middleware: ['auth', 'data-loader']
  }
};
```

## Лучшие практики

1. **Описательные имена** - Используйте понятные имена middleware
2. **Асинхронность** - Middleware могут быть асинхронными
3. **Обработка ошибок** - Всегда обрабатывайте ошибки в middleware
4. **Контекст** - Используйте context.props для передачи данных
5. **Блокировка** - Возвращайте false только для блокировки навигации

## Важные замечания

1. **Регистрация до использования** - Middleware должны быть зарегистрированы до создания роутера
2. **Асинхронность** - Все middleware выполняются асинхронно
3. **Последовательность** - Middleware выполняются в порядке регистрации
4. **Глобальные** - Для всех роутов используйте registerGlobalMiddleware

## Связанные функции

- [`registerGlobalMiddleware`](register-global-middleware.md) - Регистрация глобальных middleware
- [`middleware`](middleware.md) - Общая документация по middleware
