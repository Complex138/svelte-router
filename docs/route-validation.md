# Route Validation

Route Validation - это система проверки конфликтов и валидации роутов в svelte-router-v5.

## 🚀 Основные возможности

- ✅ **Проверка дубликатов** - обнаружение повторяющихся роутов
- ✅ **Анализ конфликтов** - выявление перекрывающихся паттернов
- ✅ **Приоритеты роутов** - автоматическое определение приоритетов
- ✅ **Предупреждения** - мягкие предупреждения вместо ошибок
- ✅ **Рекомендации** - советы по исправлению проблем

## 📖 Использование

### Базовое использование

```javascript
import { createNavigation } from 'svelte-router-v5';

const routes = {
  '/': Home,
  '/users': Users,
  '/users/:id': UserDetail,
  '/users/:id/posts': UserPosts
};

// Валидация включена по умолчанию
const currentComponent = createNavigation(routes);
```

### Строгий режим

```javascript
// В строгом режиме ошибки валидации прерывают выполнение
const currentComponent = createNavigation(routes, {
  strict: true,
  validate: true
});
```

### Отключение валидации

```javascript
// Отключить валидацию для быстрой разработки
const currentComponent = createNavigation(routes, {
  validate: false
});
```

### Пользовательские настройки валидатора

```javascript
const currentComponent = createNavigation(routes, {
  validator: {
    strict: false,
    warnOnConflicts: true,
    customPriorities: {
      '/admin': 50,  // Высокий приоритет для админки
      '/api': 100    // Низкий приоритет для API
    }
  }
});
```

## 🔍 Типы проверок

### 1. Дубликаты роутов

```javascript
const routes = {
  '/users': Users,
  '/users': UserList  // ❌ Ошибка: дубликат
};
```

**Результат:**
```
🚨 Route validation failed: [
  {
    type: 'duplicate',
    pattern: '/users',
    message: "Route '/users' is defined multiple times",
    severity: 'error'
  }
]
```

### 2. Перекрывающиеся паттерны

```javascript
const routes = {
  '/users/:id': UserDetail,
  '/users/profile': UserProfile  // ⚠️ Потенциальный конфликт
};
```

**Результат:**
```
⚠️ Route validation warnings: [
  {
    type: 'route_shadowing',
    pattern: '/users/:id',
    shadowedBy: '/users/profile',
    message: "Route '/users/:id' may be shadowed by '/users/profile' due to priority",
    severity: 'warning'
  }
]
```

### 3. Неопределенные приоритеты

```javascript
const routes = {
  '/users/:id': UserDetail,
  '/users/:name': UserByName  // ⚠️ Неопределенный приоритет
};
```

**Результат:**
```
⚠️ Route validation warnings: [
  {
    type: 'ambiguous_priority',
    patterns: ['/users/:id', '/users/:name'],
    message: "Ambiguous route priority between '/users/:id' and '/users/:name'. Consider reordering or making patterns more specific.",
    severity: 'warning'
  }
]
```

## 🎯 Приоритеты роутов

Система автоматически определяет приоритеты:

1. **Статические роуты** (высший приоритет)
   - `/users` - 100
   - `/admin` - 100

2. **Роуты с параметрами**
   - `/users/:id` - 200
   - `/posts/:slug` - 200

3. **Роуты с регулярными выражениями**
   - `/users/:id(\\d+)` - 250
   - `/posts/:slug([a-z-]+)` - 250

4. **Роуты с optional параметрами**
   - `/users/:id?` - 230
   - `/posts/:slug?` - 230

5. **Wildcard роуты** (низший приоритет)
   - `*` - 1000

## 🛠️ API

### `validateRoutes(routesConfig, options)`

Быстрая валидация роутов без создания роутера.

```javascript
import { validateRoutes } from 'svelte-router-v5';

const result = validateRoutes(routes, {
  strict: false,
  warnOnConflicts: true
});

console.log(result.isValid);     // true/false
console.log(result.conflicts);   // массив конфликтов
console.log(result.warnings);    // массив предупреждений
```

### `createRouteValidator(options)`

Создание валидатора с настройками.

```javascript
import { createRouteValidator } from 'svelte-router-v5';

const validator = createRouteValidator({
  strict: true,
  customPriorities: {
    '/admin': 50
  }
});

const result = validator.validateRoutes(routes);
const recommendations = validator.getRecommendations();
```

## 🔧 Настройки

### Опции валидатора

```javascript
{
  strict: false,              // Строгий режим
  warnOnConflicts: true,     // Показывать предупреждения
  customPriorities: {}       // Пользовательские приоритеты
}
```

### Опции createNavigation

```javascript
{
  validate: true,            // Включить валидацию
  strict: false,             // Строгий режим
  validator: {               // Настройки валидатора
    strict: false,
    warnOnConflicts: true,
    customPriorities: {}
  }
}
```

## 💡 Рекомендации

### 1. Порядок роутов

```javascript
// ✅ Хорошо - от конкретного к общему
const routes = {
  '/users/profile': UserProfile,    // Конкретный
  '/users/:id': UserDetail,         // Общий
  '/users': Users                   // Список
};
```

### 2. Избегайте конфликтов

```javascript
// ❌ Плохо - конфликт
const routes = {
  '/users/:id': UserDetail,
  '/users/:name': UserByName
};

// ✅ Хорошо - разные пути
const routes = {
  '/users/:id': UserDetail,
  '/users/by-name/:name': UserByName
};
```

### 3. Используйте приоритеты

```javascript
// ✅ Настройка приоритетов
const routes = {
  '/admin': Admin,           // Приоритет 50
  '/api': ApiRoutes,         // Приоритет 100
  '/users/:id': UserDetail   // Приоритет 200
};
```

## 🚨 Обработка ошибок

### В строгом режиме

```javascript
try {
  const currentComponent = createNavigation(routes, { strict: true });
} catch (error) {
  console.error('Route validation failed:', error.message);
  // Обработка ошибки
}
```

### В обычном режиме

```javascript
const currentComponent = createNavigation(routes);

// Проверяем логи в консоли
// 🚨 Route validation failed: [...]
// ⚠️ Route validation warnings: [...]
```

## 🎉 Заключение

Route Validation помогает:

- 🛡️ **Предотвратить ошибки** на этапе разработки
- 🔍 **Обнаружить конфликты** до продакшена
- 📈 **Улучшить производительность** роутинга
- 🧹 **Поддерживать чистоту** кода

Используйте валидацию для создания надежных и предсказуемых роутов!
