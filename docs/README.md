# Документация svelte-router-v5

## Обзор пакета

**svelte-router-v5** - мощный роутер для Svelte 5 с автоматическим извлечением параметров, реактивной навигацией, поддержкой регулярных выражений и продвинутыми возможностями.

## Основные возможности

- ✅ **Автоматическое извлечение параметров** - Параметры из URL автоматически доступны в компонентах
- ✅ **Регулярные выражения** - Валидация параметров роутов с помощью regex
- ✅ **Реактивная навигация** - Автоматическое обновление при изменении URL
- ✅ **Middleware система** - Аутентификация, авторизация и обработка навигации
- ✅ **Lazy loading** - Ленивая загрузка компонентов для лучшей производительности
- ✅ **Prefetch система** - Автоматическая предзагрузка компонентов
- ✅ **Группы роутов** - Организация роутов с общими настройками
- ✅ **Layout система** - Общие шаблоны для страниц
- ✅ **TypeScript поддержка** - Полная типизация

## Быстрый старт

### 1. Установка

```bash
npm install svelte-router-v5
```

### 2. Базовая настройка

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/about': About,
  '/user/:id': User
};

// App.svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <a href="/">Главная</a>
    <a href="/about">О нас</a>
    <a href="/user/123">Пользователь</a>
  </nav>

  <RouterView currentComponent={$currentComponent} />
</main>
```

### 3. С параметрами

```svelte
<script>
  import { getRoutParams } from 'svelte-router-v5';

  $: ({ id, name } = $getRoutParams);
</script>

<h1>Пользователь: {name || 'Неизвестный'}</h1>
<p>ID: {id}</p>
```

## Архитектура

```
src/
├── index.js              # Главный экспорт
├── Navigation.js         # Логика навигации
├── Router.js            # Функции роутера
├── RouterView.svelte     # Компонент отображения
├── LinkTo.svelte        # Компонент ссылок
├── core/
│   ├── routes-store.js   # Управление роутами
│   ├── route-pattern.js  # Паттерны роутов
│   ├── query.js         # Query параметры
│   ├── resolve.js       # Разрешение компонентов
│   ├── link.js          # Генерация ссылок
│   ├── component-cache.js # Кеширование компонентов
│   ├── prefetch.js      # Предзагрузка
│   ├── layout-registry.js # Реестр лейаутов
│   └── layout-utils.js   # Утилиты лейаутов
├── middleware/
│   ├── registry.js      # Реестр middleware
│   ├── exec.js         # Выполнение middleware
│   ├── global.js       # Глобальные middleware
│   └── route-meta.js   # Метаданные роутов
├── utils/
│   └── lazy.js         # Lazy loading утилиты
├── stores/
│   ├── url.js          # URL store
│   ├── additional-props.js # Дополнительные props
│   └── layout.js       # Layout store
└── types.d.ts          # TypeScript типы
```

## Документация по функциям

### Основные компоненты

- **[createNavigation](create-navigation.md)** - Создание экземпляра роутера
- **[RouterView](router-view.md)** - Компонент для отображения роутов
- **[LinkTo](link-to.md)** - Компонент для создания ссылок

### Навигация

- **[navigate](navigate.md)** - Программная навигация
- **[generate-url](generate-url.md)** - Генерация URL без навигации

### Параметры

- **[route-parameters](route-parameters.md)** - Работа с параметрами роутов
- **[get-route-params](get-route-params.md)** - Реактивные параметры
- **[parameter-helpers](parameter-helpers.md)** - Вспомогательные функции параметров

### Middleware

- **[middleware](middleware.md)** - Система промежуточного ПО
- **[register-middleware](register-middleware.md)** - Регистрация middleware

### Производительность

- **[lazy-loading](lazy-loading.md)** - Ленивая загрузка компонентов
- **[prefetch](prefetch.md)** - Система предзагрузки

### Организация

- **[route-groups](route-groups.md)** - Группировка роутов
- **[layouts](layouts.md)** - Система шаблонов страниц

### Утилиты

- **[register-layout](register-layout.md)** - Регистрация лейаутов
- **[layout-helpers](layout-helpers.md)** - Функции работы с лейаутами

## Примеры приложений

### Базовое SPA

```javascript
// routes.js
export const routes = {
  '/': Home,
  '/about': About,
  '/contact': Contact,
  '/user/:id': User
};

// App.svelte
<script>
  import { createNavigation, RouterView, LinkTo } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<header>
  <nav>
    <LinkTo route="/">Главная</LinkTo>
    <LinkTo route="/about">О нас</LinkTo>
    <LinkTo route="/contact">Контакты</LinkTo>
  </nav>
</header>

<main>
  <RouterView currentComponent={$currentComponent} />
</main>
```

### С аутентификацией

```javascript
// routes.js
export const routes = {
  '/login': Login,

  group: {
    prefix: '/app',
    middleware: ['auth'],
    routes: {
      '/': Dashboard,
      '/profile': Profile,
      group: {
        prefix: '/admin',
        middleware: ['admin'],
        routes: {
          '/': AdminDashboard,
          '/users': AdminUsers
        }
      }
    }
  }
};
```

### С лейаутами

```javascript
// Регистрация лейаутов
registerLayout('app', AppLayout);
registerLayout('admin', AdminLayout);

export const routes = {
  defaultLayout: 'app',

  '/admin': {
    component: Admin,
    layout: 'admin'
  }
};
```

## Миграция с других роутеров

### С React Router

```javascript
// React Router
<Route path="/user/:id" component={User} />

// svelte-router-v5
export const routes = {
  '/user/:id': User
};
```

### С Vue Router

```javascript
// Vue Router
{
  path: '/user/:id',
  component: User
}

// svelte-router-v5
export const routes = {
  '/user/:id': User
};
```

## Советы по производительности

1. **Используйте lazy loading** для больших компонентов
2. **Настройте предзагрузку** для критических роутов
3. **Группируйте роуты** для лучшей организации
4. **Используйте middleware** для кеширования данных

## Сообщество

- **GitHub**: https://github.com/Complex138/svelte-router
- **Issues**: https://github.com/Complex138/svelte-router/issues
- **Документация**: https://svelte-router.dev

## Лицензия

MIT - свободное использование в любых проектах.

---

*Создано с ❤️ для Svelte сообщества*
