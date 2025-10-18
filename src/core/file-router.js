/**
 * File-based routing для Svelte
 * Использует сгенерированные роуты из Vite плагина
 */

/**
 * Создает file router
 * @param {string} pagesDir - Директория с страницами
 * @param {object} options - Опции
 * @returns {object} Объект с роутами
 */
export async function createFileRouter(pagesDir, options = {}) {
  try {
    // Импортируем сгенерированные роуты через alias
    const { navigation, routes, layouts, middleware } = await import('~pages');
    
    console.log('✅ File router loaded successfully:', Object.keys(routes));
    
    return {
      navigation,
      routes,
      layouts,
      middleware,
      registerLayouts: () => {
        console.log('✅ Layouts registered:', Object.keys(layouts));
      },
      registerMiddleware: () => {
        console.log('✅ Middleware registered:', Object.keys(middleware));
      }
    };
  } catch (error) {
    console.warn('Generated routes not found:', error);
    
    // Fallback - пустой объект
    return {
      navigation: null,
      routes: {},
      layouts: {},
      middleware: {},
      registerLayouts: () => {},
      registerMiddleware: () => {}
    };
  }
}
