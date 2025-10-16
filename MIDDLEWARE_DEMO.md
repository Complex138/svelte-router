# Middleware System Demo 🚀

Полная демонстрация системы middleware в svelte-router-v5.

## 🎯 Что реализовано

### ✅ Основные возможности
- **Middleware регистрация** - `registerMiddleware()`
- **Глобальные middleware** - `registerGlobalMiddleware()`
- **Конфигурация роутов** - поддержка middleware в routes
- **beforeEnter/afterEnter** - хуки для роутов
- **Асинхронная поддержка** - все middleware могут быть async
- **Обработка ошибок** - автоматическая обработка ошибок middleware
- **Контекст навигации** - полный доступ к данным навигации

### ✅ Типы middleware
1. **Route Middleware** - применяются к конкретным роутам
2. **Global Middleware** - применяются ко всем роутам
3. **beforeEnter/afterEnter** - хуки роутов
4. **Error Middleware** - обработка ошибок

### ✅ Порядок выполнения
1. Глобальные before middleware
2. Middleware роута (в порядке указания)
3. beforeEnter (если определен)
4. Навигация (если все middleware прошли)
5. afterEnter (если определен)
6. Глобальные after middleware

## 🔧 Файлы проекта

### Основные файлы пакета
- `src/types.d.ts` - TypeScript типы для middleware
- `src/Router.js` - основная логика middleware
- `src/Navigation.js` - интеграция middleware в навигацию
- `src/index.js` - экспорт новых функций

### Демонстрационные файлы
- `example-middleware.js` - примеры middleware
- `MIDDLEWARE.md` - полная документация
- `MIDDLEWARE_DEMO.md` - этот файл

### Файлы основного проекта
- `resources/js/config/routes.js` - конфигурация роутов с middleware
- `resources/js/App.svelte` - регистрация middleware и демонстрация
- `resources/js/pages/Login.svelte` - страница входа
- `resources/js/pages/Admin.svelte` - админ панель
- `resources/js/pages/Profile.svelte` - профиль пользователя

## 🚀 Как тестировать

### 1. Запустите проект
```bash
cd resources/js
npm run dev
```

### 2. Откройте консоль браузера
Все действия middleware будут логироваться в консоль.

### 3. Тестируйте сценарии

#### Сценарий 1: Без аутентификации
1. Перейдите на `/profile` - должен редиректить на `/login`
2. Перейдите на `/admin` - должен редиректить на `/login`
3. Перейдите на `/admin/users` - должен редиректить на `/login`

#### Сценарий 2: Вход как пользователь
1. Перейдите на `/login`
2. Введите `user` / `user`
3. Нажмите "Войти"
4. Должен редиректить на `/profile`
5. Попробуйте перейти на `/admin` - должен редиректить на `/403`

#### Сценарий 3: Вход как админ
1. Перейдите на `/login`
2. Введите `admin` / `admin`
3. Нажмите "Войти"
4. Должен редиректить на `/admin`
5. Перейдите на `/admin/users` - должен работать
6. Перейдите на `/profile` - должен работать

#### Сценарий 4: Тестирование beforeEnter
1. Войдите как любой пользователь
2. Перейдите на `/user/999` - должен редиректить на `/403` (заблокированный пользователь)
3. Перейдите на `/user/123` - должен работать

## 📊 Логи в консоли

При навигации вы увидите логи в следующем формате:

```
🌍 Global before middleware: {from: "/", to: "/profile", timestamp: "..."}
🔐 Auth middleware: /profile
❌ No auth token, redirecting to login
📝 Logger middleware: {from: "/", to: "/profile", ...}
```

## 🔍 Структура middleware

### Middleware контекст
```javascript
{
  from: "/",                    // откуда переходим
  to: "/profile",              // куда переходим
  params: {id: "123"},         // параметры роута
  query: {tab: "profile"},     // GET параметры
  props: {userData: {...}},    // дополнительные props
  navigate: function,          // функция навигации
  route: "/user/:id",          // паттерн роута
  middlewareOptions: {...}     // опции middleware
}
```

### Регистрация middleware
```javascript
// Простой middleware
registerMiddleware('auth', async (context) => {
  // логика
  return true; // или false для блокировки
});

// Middleware с опциями
registerMiddleware('permissions', async (context) => {
  const required = context.middlewareOptions?.required || [];
  // логика
  return true;
});

// Глобальный middleware
registerGlobalMiddleware('before', async (context) => {
  // логика
  return true;
});
```

### Конфигурация роутов
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
  
  // Роут с beforeEnter/afterEnter
  '/user/:id': {
    component: User,
    middleware: ['logger'],
    beforeEnter: async (context) => {
      // логика
      return true;
    },
    afterEnter: async (context) => {
      // логика
    }
  }
};
```

## 🎨 Примеры middleware

### 1. Аутентификация
```javascript
registerMiddleware('auth', async (context) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    context.navigate('/login');
    return false;
  }
  return true;
});
```

### 2. Проверка ролей
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

### 3. Проверка разрешений
```javascript
registerMiddleware('permissions', async (context) => {
  const required = context.middlewareOptions?.required || [];
  const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
  
  const hasAllPermissions = required.every(permission => 
    userPermissions.includes(permission)
  );
  
  if (!hasAllPermissions) {
    context.navigate('/403');
    return false;
  }
  return true;
});
```

### 4. Логирование
```javascript
registerMiddleware('logger', async (context) => {
  console.log('Navigation:', {
    from: context.from,
    to: context.to,
    params: context.params,
    query: context.query,
    timestamp: new Date().toISOString()
  });
  return true;
});
```

### 5. Загрузка данных
```javascript
registerMiddleware('loadData', async (context) => {
  if (context.to.startsWith('/user/') && context.params.id) {
    // Имитация загрузки данных
    context.props.userData = { 
      id: context.params.id, 
      name: `User ${context.params.id}` 
    };
  }
  return true;
});
```

## 🌍 Глобальные middleware

### Логирование всех переходов
```javascript
registerGlobalMiddleware('before', async (context) => {
  console.log('🌍 Global before middleware:', {
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
  console.log('📈 Global after middleware - tracking page view:', context.to);
  // Отправка в аналитику
});
```

### Обработка ошибок
```javascript
registerGlobalMiddleware('error', async (error, context) => {
  console.error('🚨 Global error middleware:', {
    error: error.message,
    from: context.from,
    to: context.to,
    timestamp: new Date().toISOString()
  });
});
```

## 🎯 Результат

Система middleware полностью интегрирована в svelte-router-v5 и предоставляет:

- ✅ **Гибкость** - легко добавлять новые middleware
- ✅ **Мощность** - поддержка асинхронных операций
- ✅ **Безопасность** - контроль доступа к роутам
- ✅ **Отладка** - подробное логирование
- ✅ **Типизация** - полная поддержка TypeScript
- ✅ **Простота** - интуитивный API

Middleware система готова к использованию в продакшене! 🚀
