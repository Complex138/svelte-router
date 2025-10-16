// TypeScript типы для svelte-router-v5
import type { ComponentType, SvelteComponent } from 'svelte';
import type { Readable, Writable } from 'svelte/store';

// ===== LAZY LOADING TYPES =====

// Тип для lazy-загружаемого компонента
export type LazyComponent = () => Promise<{ default: ComponentType<SvelteComponent> } | ComponentType<SvelteComponent>>;

// Тип для маршрутов с поддержкой lazy loading
export interface Routes {
  [route: string]: ComponentType<SvelteComponent> | LazyComponent;
}

// Тип для параметров маршрута
export interface RouteParams {
  [key: string]: string;
}

// Тип для GET параметров
export interface QueryParams {
  [key: string]: string;
}

// Тип для дополнительных props
export interface AdditionalProps {
  [key: string]: any;
}

// Тип для текущего компонента с поддержкой lazy loading
export interface CurrentComponent {
  component: ComponentType<SvelteComponent> | null;
  props: RouteParams & QueryParams & AdditionalProps;
  loading?: boolean;
  error?: string | null;
}

// Тип для функции навигации (старая версия)
export type NavigateFunction = (path: string, additionalProps?: AdditionalProps) => void;

// Тип для новой функции navigate (поддерживает все форматы)
// Method 1: navigate('/user/:id', {id: 123}, {tab: 'profile'}, {userData: {...}})
// Method 2: navigate('/user/:id', {params: {...}, queryParams: {...}, props: {...}})
// Method 3: navigate('/user/:id', {id: 123, userData: {...}}) - automatic detection
export type NavigateFunctionV2 = (
  routePattern: string, 
  paramsOrConfig?: RouteParams | NavigateConfig | (RouteParams & AdditionalProps), 
  queryParams?: QueryParams, 
  additionalProps?: AdditionalProps
) => void;

// Тип для объекта конфигурации navigate (Method 2)
// navigate('/user/:id', {params: {id: 123}, queryParams: {tab: 'profile'}, props: {userData: {...}}})
export interface NavigateConfig {
  params?: RouteParams;
  queryParams?: QueryParams;
  props?: AdditionalProps;
}

// Тип для автоматического navigate (Method 3)
// navigate('/user/:id', {id: 123, userData: {...}}) - automatic detection
export type NavigateAuto = (routePattern: string, data: RouteParams & AdditionalProps, queryParams?: QueryParams) => void;

// Тип для LinkTo props
// <LinkTo route="/user/:id" params={{id: 123}} queryParams={{tab: 'profile'}} props={{userData: {...}}} />
// route может быть с регулярками или без: '/user/:id' или '/user/:id(\\d+)' - результат одинаковый
export interface LinkToProps {
  route: string;
  params?: RouteParams;
  queryParams?: QueryParams;
  props?: AdditionalProps;
  className?: string;
}

// Тип для URL store
export interface UrlData {
  pathname: string;
  search: string;
}

// Тип для RouterView props с поддержкой lazy loading
export interface RouterViewProps {
  currentComponent?: CurrentComponent;
  loadingComponent?: ComponentType<SvelteComponent>;
  errorComponent?: ComponentType<SvelteComponent>;
}

// Тип для linkTo функции
// linkTo('/user/:id', {id: 123}, {tab: 'profile'}) -> '/user/123?tab=profile'
// route может быть с регулярками или без: '/user/:id' или '/user/:id(\\d+)' - результат одинаковый
export type LinkToFunction = (routePattern: string, params?: RouteParams, queryParams?: QueryParams) => string;

// ===== MIDDLEWARE TYPES =====

// Контекст для middleware
export interface MiddlewareContext {
  from: string;                    // откуда переходим
  to: string;                     // куда переходим
  params: RouteParams;            // параметры роута
  query: QueryParams;             // GET параметры
  props: AdditionalProps;         // дополнительные props
  navigate: NavigateFunctionV2;   // функция навигации
  route: string;                  // паттерн роута
}

// Основная функция middleware
export type MiddlewareFunction = (context: MiddlewareContext) => Promise<boolean> | boolean;

// Error middleware функция
export type ErrorMiddlewareFunction = (error: Error, context: MiddlewareContext) => Promise<void> | void;

// Конфигурация middleware
export interface MiddlewareConfig {
  name: string;
  options?: any;
}

// Тип для middleware в роуте (строка или объект)
export type RouteMiddleware = string | MiddlewareConfig;

// Конфигурация роута с middleware и lazy loading
export interface RouteConfig {
  component: ComponentType<SvelteComponent> | LazyComponent;
  middleware?: RouteMiddleware[];
  beforeEnter?: MiddlewareFunction;
  afterEnter?: MiddlewareFunction;
}

// Обновленный тип Routes с поддержкой middleware и lazy loading
export interface RoutesWithMiddleware {
  [route: string]: ComponentType<SvelteComponent> | LazyComponent | RouteConfig;
}

// Реестр middleware
export interface MiddlewareRegistry {
  [name: string]: MiddlewareFunction;
}

// Глобальные middleware
export interface GlobalMiddleware {
  before?: MiddlewareFunction[];
  after?: MiddlewareFunction[];
  error?: ErrorMiddlewareFunction[];
}

// ===== LAZY LOADING UTILITY FUNCTIONS =====

// Функция для создания lazy компонента
export type LazyFunction = (importFn: LazyComponent) => LazyComponent;

// Функция для создания lazy роута с конфигурацией
export type LazyRouteFunction = (importFn: LazyComponent, config?: Omit<RouteConfig, 'component'>) => RouteConfig;

// Функция для предзагрузки компонента
export type PreloadFunction = (importFn: LazyComponent) => Promise<ComponentType<SvelteComponent>>;

// Функция для создания группы lazy роутов
export type LazyGroupFunction = (
  routes: { [path: string]: LazyComponent },
  sharedConfig?: Omit<RouteConfig, 'component'>
) => { [path: string]: RouteConfig };

// Функция для проверки, является ли компонент lazy
export type IsLazyComponentFunction = (routeValue: any) => boolean;

// Функция для загрузки lazy компонента
export type LoadLazyComponentFunction = (routeValue: any) => Promise<ComponentType<SvelteComponent>>;

// Экспорт основных типов (убираем дублирующие экспорты)
// Все типы уже экспортированы выше как interface/type
