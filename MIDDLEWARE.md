# Middleware / Route Guards 2.0 🔐

Система middleware для `svelte-router-v5` предоставляет мощные возможности для контроля навигации, аутентификации, авторизации и обработки ошибок.

## 🚀 Быстрый старт

### 1. Регистрация middleware

```javascript
import { registerMiddleware, registerGlobalMiddleware } from 'svelte-router-v5';

// Простой middleware
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    context.navigate('/login');
    return false; // Блокируем переход
  }
  return true; // Разрешаем переход
});

// Middleware с опциями
registerMiddleware('permissions', async (context) => {
  const required = context.middlewareOptions?.required || [];
  const userPermissions = getUserPermissions();
  
  const hasPermission = required.every(perm => 
    userPermissions.includes(perm)
  );
  
  if (!hasPermission) {
    context.navigate('/403');
    return false;
  }
  return true;
});
```

### 2. Конфигурация роутов

```javascript
export const routes = {
  '/': Home,
  
  // Простой роут с middleware
  '/profile': {
    component: Profile,
    middleware: ['auth', 'logger']
  },
  
  // Роут с middleware и опциями
  '/admin/users': {
    component: AdminUsers,
    middleware: [
      'auth',
      'admin',
      { name: 'permissions', options: { required: ['read:users'] } }
    ]
  },
  
  // Роут с beforeEnter и afterEnter
  '/user/:id': {
    component: User,
    middleware: ['logger'],
    beforeEnter: async (context) => {
      console.log('Entering user page:', context.params.id);
      return true;
    },
    afterEnter: async (context) => {
      console.log('Successfully entered user page');
    }
  }
};
```

## 📋 API Reference

### MiddlewareContext

Контекст, передаваемый в каждый middleware:

```typescript
interface MiddlewareContext {
  from: string;                    // откуда переходим
  to: string;                     // куда переходим
  params: RouteParams;            // параметры роута
  query: QueryParams;             // GET параметры
  props: AdditionalProps;         // дополнительные props
  navigate: NavigateFunctionV2;   // функция навигации
  route: string;                  // паттерн роута
  middlewareOptions?: any;        // опции middleware
}
```

### Функции регистрации

#### `registerMiddleware(name, middlewareFunction)`

Регистрирует middleware по имени.

```javascript
registerMiddleware('auth', async (context) => {
  // Логика middleware
  return true; // или false для блокировки
});
```

#### `registerGlobalMiddleware(type, middlewareFunction)`

Регистрирует глобальный middleware.

```javascript
// Глобальный before middleware
registerGlobalMiddleware('before', async (context) => {
  console.log('Global before:', context.to);
  return true;
});

// Глобальный after middleware
registerGlobalMiddleware('after', async (context) => {
  console.log('Global after:', context.to);
});

// Глобальный error middleware
registerGlobalMiddleware('error', async (error, context) => {
  console.error('Global error:', error);
});
```

## 🔄 Порядок выполнения

Middleware выполняются в следующем порядке:

1. **Глобальные before middleware**
2. **Middleware роута** (в порядке указания)
3. **beforeEnter** (если определен)
4. **Навигация** (если все middleware прошли успешно)
5. **afterEnter** (если определен)
6. **Глобальные after middleware**

Если любой middleware возвращает `false`, навигация блокируется.

## 🎯 Примеры использования

### Аутентификация

```javascript
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    context.navigate('/login');
    return false;
  }
  
  // Проверка валидности токена
  try {
    const response = await fetch('/api/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      localStorage.removeItem('auth_token');
      context.navigate('/login');
      return false;
    }
  } catch (error) {
    localStorage.removeItem('auth_token');
    context.navigate('/login');
    return false;
  }
  
  return true;
});
```

### Проверка ролей

```javascript
registerMiddleware('admin', async (context) => {
  const userRole = localStorage.getItem('user_role');
  
  if (userRole !== 'admin') {
    context.navigate('/403');
    return false;
  }
  
  return true;
});
```

### Проверка разрешений

```javascript
registerMiddleware('permissions', async (context) => {
  const requiredPermissions = context.middlewareOptions?.required || [];
  const userPermissions = JSON.parse(
    localStorage.getItem('user_permissions') || '[]'
  );
  
  const hasAllPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
  
  if (!hasAllPermissions) {
    context.navigate('/403');
    return false;
  }
  
  return true;
});
```

### Логирование

```javascript
registerMiddleware('logger', async (context) => {
  console.log('Navigation:', {
    from: context.from,
    to: context.to,
    params: context.params,
    query: context.query,
    timestamp: new Date().toISOString()
  });
  
  // Отправка в аналитику
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: context.to,
      page_location: window.location.href
    });
  }
  
  return true;
});
```

### Загрузка данных

```javascript
registerMiddleware('loadData', async (context) => {
  if (context.to.startsWith('/user/') && context.params.id) {
    try {
      const response = await fetch(`/api/users/${context.params.id}`);
      if (response.ok) {
        const userData = await response.json();
        context.props.userData = userData;
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }
  
  return true;
});
```

### Редиректы

```javascript
registerMiddleware('redirect', async (context) => {
  const redirects = {
    '/old-page': '/new-page',
    '/legacy': '/modern'
  };
  
  if (redirects[context.to]) {
    context.navigate(redirects[context.to]);
    return false; // Блокируем оригинальный переход
  }
  
  return true;
});
```

## 🌍 Глобальные middleware

### Логирование всех переходов

```javascript
registerGlobalMiddleware('before', async (context) => {
  console.log('Global before:', {
    from: context.from,
    to: context.to,
    timestamp: new Date().toISOString()
  });
  return true;
});
```

### Аналитика

```javascript
registerGlobalMiddleware('after', async (context) => {
  // Отправка в Google Analytics
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: context.to
    });
  }
});
```

### Обработка ошибок

```javascript
registerGlobalMiddleware('error', async (error, context) => {
  console.error('Navigation error:', {
    error: error.message,
    from: context.from,
    to: context.to,
    timestamp: new Date().toISOString()
  });
  
  // Отправка в Sentry
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: {
        component: 'router',
        from: context.from,
        to: context.to
      }
    });
  }
});
```

## 🔧 Продвинутые возможности

### Комбинирование middleware

```javascript
export const routes = {
  '/admin/dashboard': {
    component: AdminDashboard,
    middleware: [
      'auth',           // Проверка аутентификации
      'admin',          // Проверка роли
      'logger',         // Логирование
      { 
        name: 'permissions', 
        options: { 
          required: ['read:dashboard', 'write:dashboard'] 
        } 
      }
    ]
  }
};
```

### beforeEnter и afterEnter

```javascript
export const routes = {
  '/user/:id': {
    component: User,
    middleware: ['logger'],
    beforeEnter: async (context) => {
      // Проверка существования пользователя
      const userExists = await checkUserExists(context.params.id);
      if (!userExists) {
        context.navigate('/404');
        return false;
      }
      return true;
    },
    afterEnter: async (context) => {
      // Загрузка дополнительных данных
      await loadUserAnalytics(context.params.id);
    }
  }
};
```

### Асинхронные middleware

Все middleware поддерживают асинхронные операции:

```javascript
registerMiddleware('asyncAuth', async (context) => {
  try {
    const response = await fetch('/api/verify-token');
    const data = await response.json();
    
    if (!data.valid) {
      context.navigate('/login');
      return false;
    }
    
    // Сохраняем данные пользователя
    context.props.user = data.user;
    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    context.navigate('/login');
    return false;
  }
});
```

## 🚨 Обработка ошибок

Middleware автоматически обрабатывают ошибки:

```javascript
registerMiddleware('risky', async (context) => {
  // Если здесь произойдет ошибка, она будет перехвачена
  // и передана в глобальные error middleware
  throw new Error('Something went wrong');
});
```

## 📝 Лучшие практики

1. **Всегда возвращайте boolean** из middleware
2. **Используйте async/await** для асинхронных операций
3. **Обрабатывайте ошибки** в middleware
4. **Логируйте действия** для отладки
5. **Используйте глобальные middleware** для общих задач
6. **Группируйте связанные middleware** в массиве
7. **Используйте опции** для настройки поведения middleware

## 🔍 Отладка

Включите подробное логирование:

```javascript
// В консоли браузера будут видны все действия middleware
registerGlobalMiddleware('before', async (context) => {
  console.log('🔍 Middleware Debug:', {
    from: context.from,
    to: context.to,
    params: context.params,
    query: context.query,
    middlewareOptions: context.middlewareOptions
  });
  return true;
});
```

---

**Middleware система в svelte-router-v5** предоставляет гибкий и мощный инструмент для контроля навигации в ваших Svelte приложениях! 🚀
