# RouterView - Отображение роутов

## Описание

Svelte компонент для отображения текущего роута. Автоматически обрабатывает состояние загрузки, ошибки и применение лейаутов.

## Синтаксис

```svelte
<RouterView
  currentComponent={currentComponentStore}
  loadingComponent={LoadingComponent}
  errorComponent={ErrorComponent}
/>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `currentComponent` | Object | - | Store с текущим компонентом (обязательный) |
| `loadingComponent` | Component | null | Кастомный компонент для состояния загрузки |
| `errorComponent` | Component | null | Кастомный компонент для отображения ошибок |

## Структура currentComponent

```javascript
{
  component: Component,     // Текущий компонент роута
  props: Object,           // Props для компонента
  loading: Boolean,        // Состояние загрузки
  error: String|null,      // Ошибка загрузки
  layout: String|null      // Название лейаута
}
```

## Примеры использования

### Базовое использование

```svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <RouterView currentComponent={$currentComponent} />
</main>
```

### С кастомными компонентами загрузки и ошибок

```svelte
<script>
  import { createNavigation, RouterView } from 'svelte-router-v5';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorPage from './components/ErrorPage.svelte';
  import { routes } from './routes.js';

  const currentComponent = createNavigation(routes);
</script>

<main>
  <RouterView
    currentComponent={$currentComponent}
    loadingComponent={LoadingSpinner}
    errorComponent={ErrorPage}
  />
</main>
```

### Кастомный LoadingSpinner

```svelte
<!-- LoadingSpinner.svelte -->
<script>
  export let message = 'Загрузка...';
</script>

<div class="loading-spinner">
  <div class="spinner"></div>
  <p>{message}</p>
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    min-height: 200px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

### Кастомный ErrorPage

```svelte
<!-- ErrorPage.svelte -->
<script>
  export let error = 'Произошла ошибка';
</script>

<div class="error-page">
  <h1>Ошибка</h1>
  <p class="error-message">{error}</p>
  <button on:click={() => window.location.reload()}>
    Обновить страницу
  </button>
</div>

<style>
  .error-page {
    padding: 2rem;
    text-align: center;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .error-message {
    color: #d32f2f;
    margin: 1rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }
</style>
```

## Важные замечания

1. **Обязательный проп** - `currentComponent` должен быть передан
2. **Автоматическая обработка** - Загрузка и ошибки обрабатываются автоматически
3. **Лейауты** - Автоматически применяет лейауты если они заданы
4. **Производительность** - Использует предзагруженные компоненты

## Связанные функции

- [`createNavigation`](create-navigation.md) - Создание роутера
- [`LinkTo`](link-to.md) - Компонент ссылок
