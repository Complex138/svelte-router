# Функции работы с лейаутами

## Описание

Набор функций для управления зарегистрированными лейаутами в системе роутера.

## Функции

### getLayout(name)

Получает лейаут компонент по имени.

**Параметры:**
- `name` (String) - Имя лейаута

**Возвращает:** Component или null

```javascript
import { getLayout } from 'svelte-router-v5';

const appLayout = getLayout('app');
if (appLayout) {
  console.log('App layout найден');
} else {
  console.log('App layout не найден');
}
```

### hasLayout(name)

Проверяет, зарегистрирован ли лейаут с указанным именем.

**Параметры:**
- `name` (String) - Имя лейаута

**Возвращает:** Boolean

```javascript
import { hasLayout } from 'svelte-router-v5';

if (hasLayout('admin')) {
  console.log('Admin layout зарегистрирован');
} else {
  console.log('Admin layout не найден');
}
```

### getAllLayouts()

Возвращает Map со всеми зарегистрированными лейаутами.

**Возвращает:** Map с лейаутами

```javascript
import { getAllLayouts } from 'svelte-router-v5';

const allLayouts = getAllLayouts();
console.log('Все лейауты:', allLayouts);

for (const [name, component] of allLayouts) {
  console.log(`Лейаут: ${name}`, component);
}
```

### clearLayouts()

Очищает реестр всех зарегистрированных лейаутов.

```javascript
import { clearLayouts } from 'svelte-router-v5';

// Очищаем все лейауты
clearLayouts();
console.log('Все лейауты удалены');
```

### getLayoutNames()

Возвращает массив имен всех зарегистрированных лейаутов.

**Возвращает:** Array строк

```javascript
import { getLayoutNames } from 'svelte-router-v5';

const layoutNames = getLayoutNames();
console.log('Имена лейаутов:', layoutNames);
// ['app', 'admin', 'user', 'auth']
```

### debugLayouts()

Выводит в консоль информацию о всех зарегистрированных лейаутах.

```javascript
import { debugLayouts } from 'svelte-router-v5';

// Выводит подробную информацию в консоль
debugLayouts();
```

## Примеры использования

### Проверка перед использованием

```javascript
import { hasLayout, getLayout } from 'svelte-router-v5';

function renderWithLayout(layoutName, component, props = {}) {
  if (!hasLayout(layoutName)) {
    console.warn(`Лейаут ${layoutName} не найден`);
    return component;
  }

  const Layout = getLayout(layoutName);
  return Layout({ component, ...props });
}
```

### Динамическое создание лейаутов

```javascript
import { registerLayout, getLayoutNames } from 'svelte-router-v5';

// Получаем список доступных лейаутов
const availableLayouts = getLayoutNames();

// Создаем лейаут на основе условий
function createConditionalLayout(user) {
  if (user?.role === 'admin') {
    return getLayout('admin');
  } else if (user?.role === 'user') {
    return getLayout('user');
  } else {
    return getLayout('app');
  }
}
```

### Инспекция лейаутов

```javascript
import { getAllLayouts, getLayoutNames } from 'svelte-router-v5';

function inspectLayouts() {
  console.group('🔍 Инспекция лейаутов');

  const names = getLayoutNames();
  console.log('Зарегистрированные лейауты:', names);

  const all = getAllLayouts();
  for (const [name, component] of all) {
    console.log(`${name}:`, {
      component: component?.name || 'Anonymous',
      isFunction: typeof component === 'function'
    });
  }

  console.groupEnd();
}

// Вызываем в development режиме
if (import.meta.env.DEV) {
  inspectLayouts();
}
```

### Очистка при logout

```javascript
import { clearLayouts } from 'svelte-router-v5';

function handleLogout() {
  // Очищаем пользовательские данные
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // Очищаем лейауты (если нужно)
  clearLayouts();

  // Перенаправляем на главную
  navigate('/');
}
```

## Важные замечания

1. **Регистрация обязательна** - Лейауты должны быть зарегистрированы до использования
2. **Поиск** - Функции выполняют поиск по имени без учета регистра
3. **Производительность** - getAllLayouts() возвращает копию Map для безопасности

## Связанные функции

- [`registerLayout`](register-layout.md) - Регистрация лейаутов
- [`layouts`](layouts.md) - Общая документация по лейаутам
