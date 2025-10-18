# Smart Prefetch Demo 🚀

Демонстрация новой функциональности умного prefetch в svelte-router-v5.

## Что было исправлено

### ✅ Проблема 1: Строковые middleware
**Статус**: УЖЕ РАБОТАЕТ! 
Строковые middleware уже полностью поддерживаются в коде:
```javascript
export const routes = {
  '/profile': {
    component: Profile,
    middleware: ['auth', 'logger'] // ← ЭТО УЖЕ РАБОТАЕТ!
  }
};
```

### ✅ Проблема 2: Умный prefetch
**Статус**: ИСПРАВЛЕНО! 
Добавлена интеграция умного prefetch в LinkTo компонент и Navigation.js.

## Новые возможности

### 1. Умный prefetch в LinkTo
```javascript
<!-- Обычный prefetch -->
<LinkTo route="/dashboard" prefetch="hover">Dashboard</LinkTo>

<!-- Умный prefetch - изучает паттерны навигации -->
<LinkTo route="/dashboard" prefetch="smart">Dashboard</LinkTo>
```

### 2. Автоматическое обучение
Роутер теперь автоматически записывает историю навигации и предсказывает следующие роуты:

```javascript
// Navigation.js автоматически записывает переходы
smartPrefetch.recordNavigation(fromPath, toPath);

// LinkTo автоматически prefetch предсказанные роуты
const predicted = smartPrefetch.predictNext(route);
if (predicted.length > 0) {
  await prefetchRelated(predicted.slice(0, 2), { parallel: true });
}
```

### 3. Поддерживаемые стратегии prefetch
- `hover` - prefetch при наведении (по умолчанию)
- `visible` - prefetch при появлении в viewport
- `mount` - prefetch при монтировании компонента
- `smart` - **НОВОЕ!** Умный prefetch с обучением
- `none` - отключить prefetch

## Пример использования

```javascript
// App.svelte
<script>
  import { createNavigation, LinkTo, RouterView } from 'svelte-router-v5';
  import { routes } from './routes.js';
  
  const currentComponent = createNavigation(routes);
</script>

<main>
  <nav>
    <!-- Обычные ссылки -->
    <LinkTo route="/" className="nav-link">Home</LinkTo>
    <LinkTo route="/about" className="nav-link">About</LinkTo>
    
    <!-- Умный prefetch - изучит, куда пользователь обычно переходит -->
    <LinkTo route="/dashboard" prefetch="smart" className="nav-link">
      Dashboard
    </LinkTo>
    
    <!-- Умный prefetch с задержкой -->
    <LinkTo route="/profile" prefetch="smart" prefetchDelay={200} className="nav-link">
      Profile
    </LinkTo>
  </nav>
  
  <RouterView currentComponent={$currentComponent} />
</main>
```

## Как это работает

1. **Обучение**: При каждой навигации роутер записывает переходы в историю
2. **Предсказание**: При hover/visible/mount на LinkTo с `prefetch="smart"`:
   - Загружается текущий роут
   - Анализируется история навигации
   - Предзагружаются 2 наиболее вероятных следующих роута
3. **Кеширование**: Все предзагруженные компоненты сохраняются в кеше

## Преимущества

- **Быстрая навигация**: Пользователь получает мгновенные переходы
- **Умное предсказание**: Система учится на поведении пользователя
- **Эффективность**: Загружаются только наиболее вероятные роуты
- **Автоматизация**: Не требует ручной настройки

## Обратная совместимость

Все существующие функции работают как прежде:
- Обычные prefetch стратегии (`hover`, `visible`, `mount`, `none`)
- Строковые middleware уже работали
- Все API остались неизменными

## Заключение

Теперь svelte-router-v5 имеет полноценную поддержку:
- ✅ Строковых middleware (уже работало)
- ✅ Умного prefetch (добавлено)
- ✅ Автоматического обучения навигации (добавлено)
- ✅ Интеграции с LinkTo компонентом (добавлено)

Роутер стал еще более мощным и умным! 🎉
