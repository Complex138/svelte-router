// Утилиты для работы с layout'ами в роутах

import { getLayout } from './layout-registry.js';

/**
 * Определяет layout для роута по приоритету
 * @param {Object} routeConfig - Конфигурация роута
 * @param {Object} groupConfig - Конфигурация группы
 * @param {string} defaultLayout - Глобальный layout
 * @returns {string|null} Имя layout или null
 */
export function resolveLayout(routeConfig, groupConfig = null, defaultLayout = null) {
  // Приоритет: роут > группа > глобальный
  if (routeConfig && routeConfig.layout) {
    return routeConfig.layout;
  }
  
  if (groupConfig && groupConfig.layout) {
    return groupConfig.layout;
  }
  
  return defaultLayout;
}

/**
 * Получает layout компонент для роута
 * @param {Object} routeConfig - Конфигурация роута
 * @param {Object} groupConfig - Конфигурация группы
 * @param {string} defaultLayout - Глобальный layout
 * @returns {Component|null} Layout компонент или null
 */
export function getLayoutComponent(routeConfig, groupConfig = null, defaultLayout = null) {
  const layoutName = resolveLayout(routeConfig, groupConfig, defaultLayout);
  
  if (!layoutName) {
    return null;
  }
  
  return getLayout(layoutName);
}

/**
 * Проверяет, нужен ли layout для роута
 * @param {Object} routeConfig - Конфигурация роута
 * @param {Object} groupConfig - Конфигурация группы
 * @param {string} defaultLayout - Глобальный layout
 * @returns {boolean}
 */
export function needsLayout(routeConfig, groupConfig = null, defaultLayout = null) {
  return resolveLayout(routeConfig, groupConfig, defaultLayout) !== null;
}

/**
 * Извлекает глобальные настройки из конфигурации роутов
 * @param {Object} routesConfig - Конфигурация роутов
 * @returns {Object} Глобальные настройки
 */
export function extractGlobalSettings(routesConfig) {
  const globalSettings = {};
  
  // Извлекаем глобальные настройки
  if (routesConfig.defaultLayout) {
    globalSettings.defaultLayout = routesConfig.defaultLayout;
  }
  
  if (routesConfig.defaultMiddleware) {
    globalSettings.defaultMiddleware = routesConfig.defaultMiddleware;
  }
  
  if (routesConfig.defaultGuards) {
    globalSettings.defaultGuards = routesConfig.defaultGuards;
  }
  
  return globalSettings;
}

/**
 * Создает конфигурацию роута с layout информацией
 * @param {Object} routeConfig - Конфигурация роута
 * @param {Object} groupConfig - Конфигурация группы
 * @param {Object} globalSettings - Глобальные настройки
 * @returns {Object} Конфигурация роута с layout
 */
export function createRouteWithLayout(routeConfig, groupConfig = null, globalSettings = {}) {
  const layoutName = resolveLayout(routeConfig, groupConfig, globalSettings.defaultLayout);
  const layoutComponent = layoutName ? getLayout(layoutName) : null;
  
  return {
    ...routeConfig,
    layout: layoutName,
    layoutComponent,
    groupLayout: groupConfig?.layout || null,
    defaultLayout: globalSettings.defaultLayout || null
  };
}
