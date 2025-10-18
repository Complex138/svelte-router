# Индекс документации svelte-router-v5

## Быстрый поиск по функциям

### Основные компоненты
- **[createNavigation](create-navigation.md)** - Создание роутера
- **[RouterView](router-view.md)** - Отображение роутов
- **[LinkTo](link-to.md)** - Компонент навигации

### Навигация и URL
- **[navigate](navigate.md)** - Программная навигация
- **[generate-url](generate-url.md)** - Генерация URL

### Параметры и данные
- **[route-parameters](route-parameters.md)** - Параметры роутов
- **[get-route-params](get-route-params.md)** - Реактивные параметры
- **[parameter-helpers](parameter-helpers.md)** - Вспомогательные функции

### Middleware система
- **[middleware](middleware.md)** - Обзор middleware
- **[register-middleware](register-middleware.md)** - Регистрация middleware

### Производительность
- **[lazy-loading](lazy-loading.md)** - Ленивая загрузка
- **[prefetch](prefetch.md)** - Предзагрузка компонентов

### Организация кода
- **[route-groups](route-groups.md)** - Группировка роутов
- **[layouts](layouts.md)** - Система шаблонов

### Утилиты
- **[register-layout](register-layout.md)** - Регистрация лейаутов
- **[layout-helpers](layout-helpers.md)** - Функции лейаутов

## Тематические группы

### 🚀 Начало работы
1. **[README](../README.md)** - Общий обзор
2. **[create-navigation](create-navigation.md)** - Первый роутер
3. **[router-view](router-view.md)** - Отображение страниц
4. **[link-to](link-to.md)** - Создание ссылок

### 🛣️ Маршрутизация
1. **[route-parameters](route-parameters.md)** - Работа с параметрами
2. **[route-groups](route-groups.md)** - Организация роутов
3. **[middleware](middleware.md)** - Обработка навигации

### ⚡ Производительность
1. **[lazy-loading](lazy-loading.md)** - Оптимизация загрузки
2. **[prefetch](prefetch.md)** - Предзагрузка страниц

### 🎨 Интерфейс
1. **[layouts](layouts.md)** - Шаблоны страниц
2. **[register-layout](register-layout.md)** - Управление лейаутами

### 🔧 Разработка
1. **[get-route-params](get-route-params.md)** - Доступ к параметрам
2. **[navigate](navigate.md)** - Программная навигация
3. **[generate-url](generate-url.md)** - Работа с URL

## Поиск по задачам

### Хочу создать роутер
**[create-navigation](create-navigation.md)** + **[router-view](router-view.md)**

### Хочу добавить навигацию
**[link-to](link-to.md)** + **[navigate](navigate.md)**

### Хочу работать с параметрами
**[route-parameters](route-parameters.md)** + **[get-route-params](get-route-params.md)**

### Хочу добавить аутентификацию
**[middleware](middleware.md)** + **[register-middleware](register-middleware.md)**

### Хочу оптимизировать загрузку
**[lazy-loading](lazy-loading.md)** + **[prefetch](prefetch.md)**

### Хочу организовать код
**[route-groups](route-groups.md)** + **[layouts](layouts.md)**

## Структура пакета

```
Основные функции:
├── Базовая маршрутизация
├── Параметры и query strings
├── Middleware система
├── Lazy loading
├── Prefetch система
├── Группы роутов
├── Layout система
└── TypeScript поддержка
```

## Важные файлы

- **[../package.json](../../package.json)** - Информация о пакете
- **[../src/index.js](../../src/index.js)** - Главный экспорт
- **[../README.md](../../README.md)** - Основная документация
- **[../examples/](../../examples/)** - Примеры использования
