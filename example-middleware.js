// Примеры middleware для svelte-router-v5

import { registerMiddleware, registerGlobalMiddleware } from './src/index.js';

// ===== ПРИМЕРЫ MIDDLEWARE =====

// 1. Middleware аутентификации
registerMiddleware('auth', async (context) => {
  console.log('🔐 Auth middleware:', context.to);
  
  // Проверяем, есть ли токен в localStorage
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('❌ No auth token, redirecting to login');
    context.navigate('/login');
    return false; // Блокируем переход
  }
  
  // Можно добавить проверку валидности токена
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
    console.error('Token verification failed:', error);
    localStorage.removeItem('auth_token');
    context.navigate('/login');
    return false;
  }
  
  console.log('✅ Auth middleware passed');
  return true; // Разрешаем переход
});

// 2. Middleware проверки ролей
registerMiddleware('admin', async (context) => {
  console.log('👑 Admin middleware:', context.to);
  
  const userRole = localStorage.getItem('user_role');
  
  if (userRole !== 'admin') {
    console.log('❌ Not admin, redirecting to 403');
    context.navigate('/403');
    return false;
  }
  
  console.log('✅ Admin middleware passed');
  return true;
});

// 3. Middleware с опциями (проверка разрешений)
registerMiddleware('permissions', async (context) => {
  console.log('🔑 Permissions middleware:', context.to, context.middlewareOptions);
  
  const requiredPermissions = context.middlewareOptions?.required || [];
  const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
  
  const hasAllPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
  
  if (!hasAllPermissions) {
    console.log('❌ Missing permissions:', requiredPermissions);
    context.navigate('/403');
    return false;
  }
  
  console.log('✅ Permissions middleware passed');
  return true;
});

// 4. Middleware логирования
registerMiddleware('logger', async (context) => {
  console.log('📝 Logger middleware:', {
    from: context.from,
    to: context.to,
    params: context.params,
    query: context.query,
    timestamp: new Date().toISOString()
  });
  
  // Можно отправить в аналитику
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: context.to,
      page_location: window.location.href
    });
  }
  
  return true; // Всегда разрешаем
});

// 5. Middleware редиректа
registerMiddleware('redirect', async (context) => {
  console.log('🔄 Redirect middleware:', context.to);
  
  // Пример: редирект со старого URL на новый
  const redirects = {
    '/old-page': '/new-page',
    '/legacy': '/modern'
  };
  
  if (redirects[context.to]) {
    console.log(`🔄 Redirecting ${context.to} to ${redirects[context.to]}`);
    context.navigate(redirects[context.to]);
    return false; // Блокируем оригинальный переход
  }
  
  return true;
});

// 6. Middleware загрузки данных
registerMiddleware('loadData', async (context) => {
  console.log('📊 Load data middleware:', context.to);
  
  // Пример: загрузка данных пользователя перед переходом на профиль
  if (context.to.startsWith('/user/') && context.params.id) {
    try {
      const response = await fetch(`/api/users/${context.params.id}`);
      if (response.ok) {
        const userData = await response.json();
        // Добавляем данные в контекст для передачи в компонент
        context.props.userData = userData;
        console.log('✅ User data loaded:', userData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Можно редиректить на 404 или показать ошибку
    }
  }
  
  return true;
});

// ===== ГЛОБАЛЬНЫЕ MIDDLEWARE =====

// Глобальное логирование всех переходов
registerGlobalMiddleware('before', async (context) => {
  console.log('🌍 Global before middleware:', {
    from: context.from,
    to: context.to,
    timestamp: new Date().toISOString()
  });
  return true;
});

// Глобальная аналитика
registerGlobalMiddleware('after', async (context) => {
  console.log('📈 Global after middleware - tracking page view:', context.to);
  
  // Отправляем в аналитику
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: context.to
    });
  }
});

// Глобальная обработка ошибок
registerGlobalMiddleware('error', async (error, context) => {
  console.error('🚨 Global error middleware:', {
    error: error.message,
    from: context.from,
    to: context.to,
    timestamp: new Date().toISOString()
  });
  
  // Можно отправить ошибку в сервис мониторинга
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

// ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ =====

console.log('✅ Middleware examples loaded!');
console.log('Available middleware: auth, admin, permissions, logger, redirect, loadData');
console.log('Global middleware: before, after, error');
