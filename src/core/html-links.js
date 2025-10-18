/**
 * Автоматическая обработка HTML ссылок <a href="...">
 * Перехватывает клики по обычным ссылкам и обрабатывает их через роутер
 */

import { routeExists } from '../Router.js';
import { getContext } from 'svelte';

/**
 * Инициализирует автоматическую обработку HTML ссылок
 * @param {Object} options - Настройки
 * @param {boolean} options.enabled - Включить обработку (по умолчанию true)
 * @param {string} options.selector - Селектор для ссылок (по умолчанию 'a[href]')
 * @param {boolean} options.external - Обрабатывать внешние ссылки (по умолчанию false)
 * @param {Array} options.exclude - Селекторы для исключения
 */
export function initHtmlLinks(options = {}) {
  const {
    enabled = true,
    selector = 'a[href]',
    external = false,
    exclude = ['a[href^="http"]', 'a[href^="mailto:"]', 'a[href^="tel:"]', 'a[target="_blank"]']
  } = options;

  if (!enabled) return;

  // Получаем navigate из контекста
  const navigate = getContext('navigate');
  if (!navigate) {
    console.warn('HTML links processing: navigate context not found. Make sure createNavigation() is called first.');
    return;
  }

  // Обработчик кликов
  function handleLinkClick(event) {
    const link = event.target.closest(selector);
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Проверяем исключения
    const shouldExclude = exclude.some(excludeSelector => {
      try {
        return link.matches(excludeSelector);
      } catch (e) {
        return false;
      }
    });

    if (shouldExclude) return;

    // Проверяем внешние ссылки
    if (!external && (href.startsWith('http') || href.startsWith('//'))) {
      return; // Позволяем браузеру обработать внешние ссылки
    }

    // Проверяем, что это внутренняя ссылка
    if (href.startsWith('#') || href.startsWith('javascript:')) {
      return; // Позволяем браузеру обработать якоря и JS
    }

    // Проверяем, существует ли роут
    const pathOnly = href.split('?')[0];
    if (!routeExists(pathOnly)) {
      return; // Позволяем браузеру обработать неизвестные ссылки
    }

    // Перехватываем навигацию
    event.preventDefault();
    event.stopPropagation();

    // Обрабатываем через роутер
    try {
      navigate(href);
    } catch (error) {
      console.error('HTML links processing error:', error);
      // Fallback: позволяем браузеру обработать ссылку
      window.location.href = href;
    }
  }

  // Добавляем обработчик
  document.addEventListener('click', handleLinkClick, true);

  // Возвращаем функцию для отключения
  return () => {
    document.removeEventListener('click', handleLinkClick, true);
  };
}

/**
 * Автоматически инициализирует обработку HTML ссылок при загрузке DOM
 * @param {Object} options - Настройки
 */
export function autoInitHtmlLinks(options = {}) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initHtmlLinks(options));
  } else {
    initHtmlLinks(options);
  }
}

/**
 * Обрабатывает конкретную ссылку
 * @param {HTMLAnchorElement} link - Элемент ссылки
 * @param {Object} options - Настройки
 */
export function processLink(link, options = {}) {
  const {
    external = false,
    exclude = ['a[href^="http"]', 'a[href^="mailto:"]', 'a[href^="tel:"]', 'a[target="_blank"]']
  } = options;

  const href = link.getAttribute('href');
  if (!href) return false;

  // Проверяем исключения
  const shouldExclude = exclude.some(excludeSelector => {
    try {
      return link.matches(excludeSelector);
    } catch (e) {
      return false;
    }
  });

  if (shouldExclude) return false;

  // Проверяем внешние ссылки
  if (!external && (href.startsWith('http') || href.startsWith('//'))) {
    return false;
  }

  // Проверяем, что это внутренняя ссылка
  if (href.startsWith('#') || href.startsWith('javascript:')) {
    return false;
  }

  // Проверяем, существует ли роут
  const pathOnly = href.split('?')[0];
  if (!routeExists(pathOnly)) {
    return false;
  }

  // Получаем navigate из контекста
  const navigate = getContext('navigate');
  if (!navigate) {
    return false;
  }

  // Обрабатываем через роутер
  try {
    navigate(href);
    return true;
  } catch (error) {
    console.error('HTML links processing error:', error);
    return false;
  }
}
