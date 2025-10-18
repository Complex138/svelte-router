# navigate - Программная навигация

## Описание

Функция для программной навигации между роутами. Поддерживает три формата параметров и автоматическое определение типа данных.

## Синтаксис

```javascript
import { navigate } from 'svelte-router-v5';

// Способ 1: Старый формат
navigate(route, params, queryParams, additionalProps);

// Способ 2: Новый формат с ключами
navigate(route, {
  params: {...},
  queryParams: {...},
  props: {...}
});

// Способ 3: Автоматическое определение
navigate(route, {
  paramName: 'value',     // Автоматически в params
  propName: {...}         // Автоматически в props
});
```

## Параметры

- `route` (String) - Паттерн роута (обязательный)
- `paramsOrConfig` (Object) - Параметры или объект конфигурации

### Объект конфигурации (Способ 2 и 3)

```javascript
{
  params?: Object,        // Параметры для динамических сегментов
  queryParams?: Object,   // GET параметры
  props?: Object         // Дополнительные props для компонента
}
```

## Примеры использования

### Способ 1: Старый формат

```javascript
import { navigate } from 'svelte-router-v5';

// Только параметры роута
navigate('/user/:id', {id: 123});

// С query параметрами
navigate('/search', {query: 'svelte'}, {category: 'tutorials'});

// С props для компонента
navigate('/user/:id', {id: 123}, {}, {userData: {name: 'John'}});
```

### Способ 2: Новый формат с ключами

```javascript
import { navigate } from 'svelte-router-v5';

// Все параметры явно указаны
navigate('/user/:id', {
  params: {id: 123},
  queryParams: {tab: 'profile'},
  props: {userData: {name: 'John'}}
});

// Только некоторые параметры
navigate('/search', {
  params: {query: 'svelte'},
  queryParams: {category: 'docs'}
});
```

### Способ 3: Автоматическое определение

```javascript
import { navigate } from 'svelte-router-v5';

// Автоматически определяет что куда положить
navigate('/user/:id', {
  id: 123,                    // В params (совпадает с :id)
  userData: {name: 'John'},   // В props
  settings: {theme: 'dark'}   // В props
});

// Смешанные параметры
navigate('/post/:id/comments', {
  id: 456,                    // В params
  commentId: 789,             // В props (не совпадает с паттерном)
  sortBy: 'date'              // В queryParams (короткое имя)
});
```

## Практические примеры

### Навигация после успешного действия

```javascript
<script>
  import { navigate } from 'svelte-router-v5';

  async function handleLogin(credentials) {
    try {
      const user = await loginAPI(credentials);
      // Перенаправление после успешного входа
      navigate('/dashboard', {
        userData: user,
        message: 'Добро пожаловать!'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  function goToUserProfile(userId) {
    navigate('/user/:id', {
      id: userId,
      tab: 'profile'
    });
  }
</script>
```

### Условная навигация

```javascript
<script>
  import { navigate } from 'svelte-router-v5';

  function handleAction(action, itemId) {
    switch (action) {
      case 'edit':
        navigate('/edit/:id', {id: itemId});
        break;
      case 'delete':
        if (confirm('Удалить элемент?')) {
          navigate('/delete/:id', {id: itemId});
        }
        break;
      case 'view':
        navigate('/view/:id', {
          id: itemId,
          readonly: true
        });
        break;
    }
  }
</script>
```

### Навигация с состоянием

```javascript
<script>
  import { navigate } from 'svelte-router-v5';

  function openModal(route, data) {
    // Сохраняем данные для модального окна
    sessionStorage.setItem('modalData', JSON.stringify(data));

    // Переходим на роут с модальным окном
    navigate(route, {
      showModal: true,
      modalData: data
    });
  }
</script>
```

## Важные замечания

1. **Автоматическое определение** - Работает только если название свойства совпадает с параметром роута
2. **Middleware** - Выполняются автоматически при навигации
3. **История браузера** - Добавляет запись в history API
4. **Предзагрузка** - Не запускает предзагрузку автоматически

## Связанные функции

- [`linkTo`](link-to.md) - Генерация URL без навигации
- [`LinkTo`](link-to.md) - Компонент для декларативной навигации
- [`prefetchRoute`](prefetch-route.md) - Предзагрузка роутов
