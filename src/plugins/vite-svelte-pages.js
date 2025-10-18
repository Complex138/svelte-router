import { readdirSync, statSync } from 'fs';
import { join, relative, extname, resolve } from 'path';

/**
 * Vite plugin для file-based routing в Svelte
 * Генерирует роуты на основе файловой системы
 */
export function viteSveltePages(options = {}) {
  const {
    pagesDir = 'resources/js/pages',
    extensions = ['.svelte'],
    ignore = ['_layout.svelte', '_error.svelte', '_middleware.js'],
    alias = '~pages'
  } = options;

  const genConfig = {
    pagesDir,
    extensions,
    ignore,
    alias,
    genCodeAlias: alias,
    routerPath: resolve(process.cwd(), 'temp-fix2/src/generated')
  };

  return {
    name: 'vite-svelte-pages',
    config(config) {
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      const replacement = resolve(process.cwd(), genConfig.routerPath);

      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ find: genConfig.alias, replacement });
      } else {
        config.resolve.alias[genConfig.alias] = replacement;
      }
    },
    buildStart() {
      console.log('🔍 Generating Svelte file-based routes...');
      writeRouterCode(genConfig);
    },
    watchChange(file) {
      if (file.includes(genConfig.pagesDir)) {
        console.log('🔄 File changed, regenerating routes...');
        writeRouterCode(genConfig);
      }
    }
  };
}

/**
 * Генерирует код роутов
 */
function writeRouterCode(config) {
  const files = scanFiles(config.pagesDir, config.extensions, config.ignore);
  const routes = {};
  const layouts = {};
  const middleware = {};

  // Обрабатываем каждый файл
  for (const file of files) {
    const routePath = fileToRoute(file, config.pagesDir);
    const importPath = `/resources/js/pages/${file}`;
    
    // Добавляем роут
    routes[routePath] = `() => import('${importPath}')`;
    
    // Обрабатываем layouts
    if (file.includes('_layout.svelte')) {
      const layoutPath = getLayoutPath(file, config.pagesDir);
      layouts[layoutPath] = `() => import('${importPath}')`;
    }
    
    // Обрабатываем middleware
    if (file.includes('_middleware')) {
      const middlewarePath = getMiddlewarePath(file, config.pagesDir);
      middleware[middlewarePath] = `() => import('${importPath}')`;
    }
  }

  // Генерируем код с правильными импортами
  const routesCode = `// Автоматически сгенерированные роуты для Svelte
import { createNavigation } from 'svelte-router-v5';

// Статические импорты всех компонентов
${files.map((file, index) => {
  const componentName = file.replace(/[^a-zA-Z0-9]/g, '_').replace(/\.svelte$/, '');
  return `import ${componentName} from '/resources/js/pages/${file}';`;
}).join('\n')}

// Создаем роуты
const routes = {
${Object.entries(routes).map(([path, importCode]) => 
  `  '${path}': ${importCode}`
).join(',\n')}
};

// Создаем layouts
const layouts = {
${Object.entries(layouts).map(([path, importCode]) => 
  `  '${path}': ${importCode}`
).join(',\n')}
};

// Создаем middleware
const middleware = {
${Object.entries(middleware).map(([path, importCode]) => 
  `  '${path}': ${importCode}`
).join(',\n')}
};

// Экспортируем навигацию
export const navigation = createNavigation(routes);

export { routes, layouts, middleware };
`;

  // Создаем директорию если не существует
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(config.routerPath)) {
    fs.mkdirSync(config.routerPath, { recursive: true });
  }
  
  // Записываем файл
  fs.writeFileSync(
    path.join(config.routerPath, 'index.js'),
    routesCode
  );
  
  console.log('✅ Generated routes:', Object.keys(routes));
  console.log('✅ Generated layouts:', Object.keys(layouts));
  console.log('✅ Generated middleware:', Object.keys(middleware));
}

/**
 * Сканирует файлы рекурсивно
 */
function scanFiles(dir, extensions, ignore, config) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanFiles(fullPath, extensions, ignore, config));
      } else {
        const ext = extname(item);
        const isIgnored = ignore.some(ignorePattern => item.includes(ignorePattern));
        
        if (extensions.includes(ext) && !isIgnored) {
          // Возвращаем только путь относительно pagesDir
          const pagesDir = config?.pagesDir || 'resources/js/pages';
          const relativePath = relative(join(process.cwd(), pagesDir), fullPath);
          files.push(relativePath);
        }
      }
    }
  } catch (error) {
    console.warn('Error scanning directory:', error);
  }
  
  return files;
}

/**
 * Преобразует путь к файлу в роут
 */
function fileToRoute(filePath, pagesDir) {
  // Убираем полный путь до pagesDir
  let route = filePath.replace(/.*\/resources\/js\/pages\//, '');
  
  // Убираем расширение
  route = route.replace(/\.(svelte|js|ts)$/, '');
  
  // Обрабатываем index файлы
  if (route.endsWith('/index')) {
    route = route.replace('/index', '');
  }
  
  // Обрабатываем динамические параметры
  route = processDynamicParams(route);
  
  return route || '/';
}

/**
 * Обрабатывает динамические параметры
 */
function processDynamicParams(route) {
  return route.replace(/\[(\w+)(?:\(([^)]+)\))?\]/g, (match, paramName, regex) => {
    if (paramName.endsWith('?')) {
      const actualParamName = paramName.slice(0, -1);
      return `:${actualParamName}(${regex || '[^/]+'})?`;
    }
    return `:${paramName}(${regex || '[^/]+'})`;
  });
}

/**
 * Получает путь для layout
 */
function getLayoutPath(filePath, pagesDir) {
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
  return dirPath.replace(pagesDir + '/', '') || '/';
}

/**
 * Получает путь для middleware
 */
function getMiddlewarePath(filePath, pagesDir) {
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
  return dirPath.replace(pagesDir + '/', '') || '/';
}
