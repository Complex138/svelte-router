# HTML Links Support

## Описание

Автоматическая обработка обычных HTML ссылок `<a href="...">` с перехватом кликов и обработкой через роутер.

## Автоматическая инициализация

По умолчанию HTML ссылки обрабатываются автоматически при вызове `createNavigation()`:

```javascript
import { createNavigation } from 'svelte-router-v5';

const router = createNavigation(routes);
// ✅ HTML ссылки уже работают автоматически!
```

## Использование

### Обычные HTML ссылки

```html
<!-- ✅ Эти ссылки будут обработаны роутером автоматически -->
<a href="/">Главная</a>
<a href="/about">О нас</a>
<a href="/user/123">Пользователь 123</a>
<a href="/post/456?tab=comments">Пост с параметрами</a>

<!-- ❌ Эти ссылки НЕ будут перехвачены (внешние, якоря, JS) -->
<a href="https://google.com">Внешняя ссылка</a>
<a href="mailto:test@example.com">Email</a>
<a href="tel:+1234567890">Телефон</a>
<a href="#section">Якорь</a>
<a href="javascript:alert('test')">JavaScript</a>
<a target="_blank">Новая вкладка</a>
<a download>Скачать файл</a>
```

### Настройка обработки

```javascript
import { initHtmlLinks } from 'svelte-router-v5';

// Ручная инициализация с настройками
const cleanup = initHtmlLinks({
  enabled: true,                    // Включить обработку
  selector: 'a[href]',             // Селектор ссылок
  external: false,                 // Обрабатывать внешние ссылки
  exclude: [                       // Исключения
    'a[href^="http"]',            // Внешние ссылки
    'a[href^="mailto:"]',         // Email
    'a[href^="tel:"]',            // Телефон
    'a[target="_blank"]',         // Новая вкладка
    'a[download]',                // Скачивание
    'a[href^="javascript:"]'      // JavaScript
  ]
});

// Отключить обработку
cleanup();
```

### Обработка конкретной ссылки

```javascript
import { processLink } from 'svelte-router-v5';

// Обработать конкретную ссылку
const link = document.querySelector('a[href="/user/123"]');
const processed = processLink(link);

if (processed) {
  console.log('Ссылка обработана роутером');
} else {
  console.log('Ссылка не обработана (внешняя или исключена)');
}
```

## Настройки

### enabled
- **Тип:** `boolean`
- **По умолчанию:** `true`
- **Описание:** Включить/выключить обработку HTML ссылок

### selector
- **Тип:** `string`
- **По умолчанию:** `'a[href]'`
- **Описание:** CSS селектор для ссылок

### external
- **Тип:** `boolean`
- **По умолчанию:** `false`
- **Описание:** Обрабатывать внешние ссылки (http/https)

### exclude
- **Тип:** `Array<string>`
- **По умолчанию:** `['a[href^="http"]', 'a[href^="mailto:"]', 'a[href^="tel:"]', 'a[target="_blank"]']`
- **Описание:** CSS селекторы для исключения из обработки

## Примеры использования

### Базовое использование

```html
<!-- App.svelte -->
<script>
  import { createNavigation } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const router = createNavigation(routes);
  // ✅ HTML ссылки работают автоматически
</script>

<nav>
  <!-- ✅ Обычные HTML ссылки -->
  <a href="/">Главная</a>
  <a href="/about">О нас</a>
  <a href="/user/123">Пользователь</a>
  
  <!-- ✅ С параметрами -->
  <a href="/post/456?tab=comments">Пост с комментариями</a>
  
  <!-- ❌ Внешние ссылки (не перехватываются) -->
  <a href="https://google.com">Google</a>
  <a href="mailto:test@example.com">Email</a>
</nav>
```

### Кастомная настройка

```javascript
import { initHtmlLinks } from 'svelte-router-v5';

// Настроить обработку для конкретных ссылок
const cleanup = initHtmlLinks({
  selector: '.nav-link[href]',     // Только ссылки с классом nav-link
  external: true,                  // Обрабатывать внешние ссылки
  exclude: [
    'a[target="_blank"]',         // Исключить новые вкладки
    'a[download]'                 // Исключить скачивания
  ]
});
```

### Отключение для конкретных ссылок

```html
<!-- Добавить data-атрибут для исключения -->
<a href="/external" data-router-ignore>Внешняя ссылка</a>

<!-- Или использовать target="_blank" -->
<a href="/external" target="_blank">Внешняя ссылка</a>
```

## Преимущества

- ✅ **Автоматическая обработка** - не нужно менять существующий HTML
- ✅ **Умные исключения** - внешние ссылки, email, телефон не перехватываются
- ✅ **Производительность** - обработка только внутренних ссылок
- ✅ **Гибкость** - настраиваемые селекторы и исключения
- ✅ **Обратная совместимость** - работает с существующим кодом

## Ограничения

- ❌ **Только внутренние ссылки** - внешние ссылки не обрабатываются
- ❌ **Только существующие роуты** - неизвестные роуты не перехватываются
- ❌ **Только клики** - программная навигация не перехватывается
