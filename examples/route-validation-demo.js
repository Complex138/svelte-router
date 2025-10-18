// Демонстрация Route Validation
import { createNavigation, validateRoutes } from 'svelte-router-v5';

// Пример 1: Конфликтующие роуты
console.log('=== Пример 1: Конфликтующие роуты ===');

const conflictingRoutes = {
  '/users': 'UsersList',
  '/users': 'UsersListDuplicate',  // Дубликат!
  '/users/:id': 'UserDetail',
  '/users/profile': 'UserProfile'  // Потенциальный конфликт
};

const validation1 = validateRoutes(conflictingRoutes);
console.log('Результат валидации:', validation1);

// Пример 2: Неопределенные приоритеты
console.log('\n=== Пример 2: Неопределенные приоритеты ===');

const ambiguousRoutes = {
  '/users/:id': 'UserDetail',
  '/users/:name': 'UserByName',  // Неопределенный приоритет
  '/posts/:slug': 'PostDetail',
  '/posts/:id': 'PostById'       // Еще один конфликт
};

const validation2 = validateRoutes(ambiguousRoutes);
console.log('Результат валидации:', validation2);

// Пример 3: Правильные роуты
console.log('\n=== Пример 3: Правильные роуты ===');

const goodRoutes = {
  '/': 'Home',
  '/about': 'About',
  '/users': 'UsersList',
  '/users/:id': 'UserDetail',
  '/users/:id/posts': 'UserPosts',
  '/posts': 'PostsList',
  '/posts/:slug': 'PostDetail',
  '*': 'NotFound'
};

const validation3 = validateRoutes(goodRoutes);
console.log('Результат валидации:', validation3);

// Пример 4: Строгий режим
console.log('\n=== Пример 4: Строгий режим ===');

try {
  const currentComponent = createNavigation(conflictingRoutes, {
    strict: true,
    validate: true
  });
  console.log('Роутер создан успешно');
} catch (error) {
  console.error('Ошибка в строгом режиме:', error.message);
}

// Пример 5: Пользовательские приоритеты
console.log('\n=== Пример 5: Пользовательские приоритеты ===');

const customRoutes = {
  '/admin': 'Admin',
  '/api': 'ApiRoutes',
  '/users/:id': 'UserDetail'
};

const validation5 = validateRoutes(customRoutes, {
  customPriorities: {
    '/admin': 50,   // Высокий приоритет
    '/api': 100,    // Средний приоритет
    '/users/:id': 200 // Низкий приоритет
  }
});

console.log('Результат с пользовательскими приоритетами:', validation5);

// Пример 6: Отключение валидации
console.log('\n=== Пример 6: Отключение валидации ===');

const currentComponent = createNavigation(conflictingRoutes, {
  validate: false  // Валидация отключена
});

console.log('Роутер создан без валидации');

export { conflictingRoutes, ambiguousRoutes, goodRoutes, customRoutes };
