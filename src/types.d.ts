// TypeScript типы для svelte-router-v5
import type { ComponentType, SvelteComponent } from 'svelte';
import type { Readable, Writable } from 'svelte/store';

// Тип для маршрутов
export interface Routes {
  [route: string]: ComponentType<SvelteComponent>;
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

// Тип для текущего компонента
export interface CurrentComponent {
  component: ComponentType<SvelteComponent>;
  props: RouteParams & QueryParams & AdditionalProps;
}

// Тип для функции навигации
export type NavigateFunction = (path: string, additionalProps?: AdditionalProps) => void;

// Тип для LinkTo props
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

// Экспорт основных типов
export type {
  Routes,
  RouteParams,
  QueryParams,
  AdditionalProps,
  CurrentComponent,
  NavigateFunction,
  LinkToProps,
  UrlData
};
