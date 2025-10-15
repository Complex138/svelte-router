// Логика навигации
import { routeExists, getRouteComponent, getRouteParams, getQueryParams, getAllParams, updateUrlStore, updateAdditionalProps, setRoutes } from './Router.js';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';

// Создаем объект для управления навигацией
export function createNavigation(routesConfig = {}) {
  // Устанавливаем routes
  setRoutes(routesConfig);
  let currentPath = window.location.pathname;
  
  // Создаем реактивный store с компонентом и props
  const currentComponent = writable({
    component: getRouteComponent(currentPath),
    props: {
      routeParams: getRouteParams(currentPath),
      queryParams: getQueryParams(),
      allParams: getAllParams(currentPath)
    }
  });

  // Функция навигации
  function navigate(fullPath, additionalProps = {}) {
    // Извлекаем только путь без query string для проверки
    const pathOnly = fullPath.split('?')[0];
    
    if (routeExists(pathOnly)) {
      currentPath = pathOnly;
      window.history.pushState({}, '', fullPath);
      // Обновляем дополнительные props
      updateAdditionalProps(additionalProps);
      
      // Обновляем store с новыми props
      currentComponent.set({
        component: getRouteComponent(currentPath),
        props: {
          routeParams: getRouteParams(currentPath),
          queryParams: getQueryParams(),
          allParams: getAllParams(currentPath),
          ...additionalProps // Добавляем дополнительные props
        }
      });
      // Обновляем URL store
      updateUrlStore();
    } else {
      console.warn(`Маршрут ${pathOnly} не найден`);
    }
  }

  // Обработка кнопок браузера
  window.addEventListener('popstate', () => {
    currentPath = window.location.pathname;
    currentComponent.set({
      component: getRouteComponent(currentPath),
      props: {
        routeParams: getRouteParams(currentPath),
        queryParams: getQueryParams(),
        allParams: getAllParams(currentPath)
      }
    });
    // Обновляем URL store
    updateUrlStore();
  });


  // Передаем функцию navigate через контекст
  setContext('navigate', navigate);

  // Возвращаем store напрямую
  return currentComponent;
}
