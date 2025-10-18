# Prefetch система - Предзагрузка

## Описание

Система автоматической предзагрузки компонентов для мгновенных переходов между страницами. Поддерживает несколько стратегий предзагрузки и умное предсказание навигации.

## Стратегии предзагрузки

### hover (по умолчанию)

Предзагружает компонент при наведении курсора на ссылку.

```svelte
<LinkTo route="/heavy-page" prefetch="hover">
  Тяжелая страница
</LinkTo>
```

### visible

Предзагружает компонент когда ссылка появляется в области видимости.

```svelte
<LinkTo route="/lazy-content" prefetch="visible">
  Контент для ленивой загрузки
</LinkTo>
```

### mount

Предзагружает компонент сразу при монтировании компонента ссылки.

```svelte
<LinkTo route="/critical-page" prefetch="mount">
  Критически важная страница
</LinkTo>
```

### smart

Умная предзагрузка, которая учится на паттернах навигации пользователя.

```svelte
<LinkTo route="/dashboard" prefetch="smart">
  Дашборд
</LinkTo>
```

### none

Отключает автоматическую предзагрузку.

```svelte
<LinkTo route="/logout" prefetch="none">
  Выход
</LinkTo>
```

## Ручная предзагрузка

### Предзагрузка конкретного роута

```javascript
import { prefetchRoute } from 'svelte-router-v5';

// Предзагрузка одного роута
await prefetchRoute('/dashboard');

// С опциями
await prefetchRoute('/user/:id', {
  force: true  // Принудительная предзагрузка даже если уже в кеше
});
```

### Предзагрузка всех роутов

```javascript
import { prefetchAll } from 'svelte-router-v5';

// Предзагрузка всех роутов
await prefetchAll();

// С приоритетами
await prefetchAll({
  priority: ['/dashboard', '/profile'],  // Загрузить первыми
  exclude: ['/admin', '/settings']       // Исключить из загрузки
});
```

### Предзагрузка при простое

```javascript
import { prefetchOnIdle } from 'svelte-router-v5';

// Предзагрузка когда браузер свободен
prefetchOnIdle(['/reports', '/analytics'], {
  timeout: 2000  // Максимальное время ожидания (мс)
});
```

### Предзагрузка связанных роутов

```javascript
import { prefetchRelated } from 'svelte-router-v5';

// Предзагрузка связанных роутов
await prefetchRelated([
  '/posts/page/2',
  '/posts/page/3',
  '/posts/page/1'
], {
  parallel: true,  // Загружать параллельно
  delay: 500       // Задержка перед загрузкой
});
```

## Умная предзагрузка

### Создание экземпляра умной предзагрузки

```javascript
import { createSmartPrefetch } from 'svelte-router-v5';

// Создаем умный prefetch с историей последних 10 навигаций
const smartPrefetch = createSmartPrefetch(10);

// В функции навигации записываем переходы
function handleNavigation(from, to) {
  smartPrefetch.recordNavigation(from, to);

  // Автоматически предзагружаем предсказанные роуты
  smartPrefetch.prefetchPredicted(to, 2); // Топ 2 предсказания
}
```

### Предсказание следующих роутов

```javascript
// Получить предсказанные роуты
const predicted = smartPrefetch.predictNext('/dashboard');
// ['/dashboard/analytics', '/dashboard/reports']

// Предзагрузить предсказанные роуты
await smartPrefetch.prefetchPredicted('/dashboard', 3);
```

## Расширенные возможности

### С учетом сети

```javascript
import { prefetchWithNetworkAware } from 'svelte-router-v5';

// Предзагружает только если сеть достаточно быстрая
await prefetchWithNetworkAware('/heavy-dashboard');
```

### Задержка предзагрузки

```javascript
import { prefetchWithDelay } from 'svelte-router-v5';

// Предзагрузка с задержкой
const timeoutId = prefetchWithDelay('/dashboard', 1000);

// Отмена предзагрузки
clearTimeout(timeoutId);
```

### Hover предзагрузка с задержкой

```javascript
import { createHoverPrefetch } from 'svelte-router-v5';

// Создаем hover предзагрузку с задержкой
const hoverPrefetch = createHoverPrefetch('/dashboard', 200);

function handleMouseEnter() {
  hoverPrefetch.start();
}

function handleMouseLeave() {
  hoverPrefetch.cancel();
}
```

### Предзагрузка при видимости

```javascript
import { createVisibilityPrefetch } from 'svelte-router-v5';

// Создаем observer для предзагрузки видимых ссылок
const visibilityPrefetch = createVisibilityPrefetch({
  threshold: 0.1,    // 10% видимости
  rootMargin: '50px', // 50px отступа
  delay: 100          // Задержка после появления
});

// Используем с элементами
const linkElement = document.querySelector('[data-prefetch-route]');
linkElement.setAttribute('data-prefetch-route', '/dashboard');
visibilityPrefetch.observe(linkElement);
```

## Управление кешем

### Проверка кеша

```javascript
import {
  hasCachedComponent,
  getCachedComponent,
  getCachedPaths,
  getCacheSize
} from 'svelte-router-v5';

// Проверка наличия в кеше
if (hasCachedComponent('/dashboard')) {
  console.log('Dashboard уже загружен');
}

// Получение закешированного компонента
const dashboard = getCachedComponent('/dashboard');

// Список всех закешированных роутов
console.log('Кешированные роуты:', getCachedPaths());

// Размер кеша
console.log('Размер кеша:', getCacheSize());
```

### Очистка кеша

```javascript
import { clearComponentCache, removeCachedComponent } from 'svelte-router-v5';

// Очистить весь кеш
clearComponentCache();

// Удалить конкретный компонент
removeCachedComponent('/dashboard');
```

## Примеры использования

### В App.svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { prefetchRoute, prefetchOnIdle } from 'svelte-router-v5';

  onMount(() => {
    // Предзагружаем критические роуты сразу
    prefetchRoute('/dashboard');

    // Предзагружаем остальные роуты когда браузер свободен
    prefetchOnIdle([
      '/profile',
      '/settings',
      '/about'
    ]);
  });
</script>
```

### Кастомная предзагрузка в компоненте

```svelte
<script>
  import { createHoverPrefetch } from 'svelte-router-v5';

  let hoverPrefetch;

  function setupPrefetch(route) {
    hoverPrefetch = createHoverPrefetch(route, 100);
  }

  function handleMouseEnter() {
    if (hoverPrefetch) {
      hoverPrefetch.start();
    }
  }

  function handleMouseLeave() {
    if (hoverPrefetch) {
      hoverPrefetch.cancel();
    }
  }
</script>

<div
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  use:setupPrefetch="/dashboard"
>
  Наведите для предзагрузки
</div>
```

### Предзагрузка пагинации

```javascript
<script>
  import { prefetchRelated } from 'svelte-router-v5';

  export let currentPage = 1;

  async function preloadPagination() {
    const relatedPages = [
      `/posts/page/${currentPage + 1}`,
      `/posts/page/${currentPage - 1}`,
      `/posts/page/${currentPage + 2}`
    ];

    await prefetchRelated(relatedPages, {
      parallel: true,
      delay: 300
    });
  }
</script>

<button on:click={preloadPagination}>
  Предзагрузить страницы пагинации
</button>
```

## Лучшие практики

1. **Критические роуты** - Предзагружайте сразу или при монтировании
2. **Пользовательские паттерны** - Используйте умную предзагрузку для обучения
3. **Сеть** - Учитывайте скорость соединения
4. **Пользовательский опыт** - Не предзагружайте слишком много

## Связанные функции

- [`LinkTo`](link-to.md) - Компонент с автоматической предзагрузкой
- [`lazy`](lazy-loading.md) - Ленивая загрузка компонентов
