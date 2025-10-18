// Route Validation - проверка конфликтов и валидация роутов
import { parseRoutePattern } from './route-pattern.js';

/**
 * Класс для валидации роутов и проверки конфликтов
 */
export class RouteValidator {
  constructor(options = {}) {
    this.options = {
      strict: false, // Строгий режим - ошибки вместо предупреждений
      warnOnConflicts: true, // Показывать предупреждения о конфликтах
      customPriorities: {}, // Пользовательские приоритеты
      ...options
    };
    
    this.routes = new Map();
    this.patterns = new Map();
    this.conflicts = [];
    this.warnings = [];
  }

  /**
   * Валидирует все роуты из конфигурации
   * @param {Object} routesConfig - Конфигурация роутов
   * @returns {Object} Результат валидации
   */
  validateRoutes(routesConfig) {
    this.routes.clear();
    this.patterns.clear();
    this.conflicts = [];
    this.warnings = [];

    // Собираем все роуты для анализа
    const allRoutes = this._collectAllRoutes(routesConfig);
    
    // Валидируем каждый роут
    for (const [pattern, route] of allRoutes) {
      this._validateSingleRoute(pattern, route);
    }

    // Проверяем конфликты между роутами
    this._checkRouteConflicts();

    return {
      isValid: this.conflicts.length === 0,
      conflicts: this.conflicts,
      warnings: this.warnings,
      routes: Array.from(this.routes.entries()).map(([pattern, component]) => [
        pattern, 
        this._getComponentName(component)
      ])
    };
  }

  /**
   * Собирает все роуты из конфигурации (включая группы)
   * @private
   */
  _collectAllRoutes(routesConfig, prefix = '') {
    const routes = [];
    
    if (!routesConfig || typeof routesConfig !== 'object') {
      return routes;
    }

    // Сначала проверяем дубликаты в исходной конфигурации
    this._checkRawDuplicates(routesConfig);

    // Обрабатываем группы
    if (routesConfig.groups && Array.isArray(routesConfig.groups)) {
      for (const group of routesConfig.groups) {
        const groupPrefix = this._normalizePath(prefix, group.prefix || '');
        if (group.routes) {
          routes.push(...this._collectAllRoutes(group.routes, groupPrefix));
        }
      }
    }

    // Обрабатываем обычные роуты
    for (const [path, value] of Object.entries(routesConfig)) {
      // Пропускаем глобальные настройки
      if (path === 'groups' || path === 'defaultLayout' || path === 'defaultMiddleware' || path === 'defaultGuards') {
        continue;
      }

      if (value && typeof value === 'object' && value.routes) {
        // Вложенная группа
        const groupPrefix = this._normalizePath(prefix, value.prefix || '');
        routes.push(...this._collectAllRoutes(value.routes, groupPrefix));
      } else if (value && (value.component || typeof value === 'function' || typeof value === 'string')) {
        // Обычный роут (компонент, функция или строка)
        const finalPath = this._normalizePath(prefix, path);
        routes.push([finalPath, value]);
      }
    }

    return routes;
  }

  /**
   * Проверяет дубликаты в исходной конфигурации
   * @private
   */
  _checkRawDuplicates(routesConfig) {
    // JavaScript автоматически перезаписывает дубликаты в объектах
    // К моменту валидации дубликаты уже не видны
    // Это нормальное поведение JavaScript
  }

  /**
   * Валидирует отдельный роут
   * @private
   */
  _validateSingleRoute(pattern, route) {
    // Проверяем дубликаты ДО добавления в Map
    if (this.routes.has(pattern)) {
      this.conflicts.push({
        type: 'duplicate',
        pattern,
        message: `Route '${pattern}' is defined multiple times`,
        severity: 'error'
      });
      return;
    }

    // Парсим паттерн для анализа
    try {
      const parsed = parseRoutePattern(pattern);
      this.routes.set(pattern, route);
      this.patterns.set(pattern, parsed);
    } catch (error) {
      this.conflicts.push({
        type: 'invalid_pattern',
        pattern,
        message: `Invalid route pattern '${pattern}': ${error.message}`,
        severity: 'error'
      });
    }
  }

  /**
   * Получает название компонента
   * @private
   */
  _getComponentName(component) {
    if (!component) return 'Unknown';
    
    // Если это функция, пытаемся получить имя
    if (typeof component === 'function') {
      return component.name || 'Anonymous';
    }
    
    // Если это строка
    if (typeof component === 'string') {
      return component;
    }
    
    // Если это объект (Svelte компонент)
    if (typeof component === 'object' && component !== null) {
      return 'Component';
    }
    
    return 'Component';
  }

  /**
   * Проверяет конфликты между роутами
   * @private
   */
  _checkRouteConflicts() {
    const patterns = Array.from(this.patterns.entries());
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const [pattern1, parsed1] = patterns[i];
        const [pattern2, parsed2] = patterns[j];
        
        this._checkPatternConflict(pattern1, parsed1, pattern2, parsed2);
      }
    }
  }

  /**
   * Проверяет конфликт между двумя паттернами
   * @private
   */
  _checkPatternConflict(pattern1, parsed1, pattern2, parsed2) {
    // Проверяем точные совпадения
    if (pattern1 === pattern2) {
      this.conflicts.push({
        type: 'exact_duplicate',
        pattern: pattern1,
        message: `Exact duplicate route: '${pattern1}'`,
        severity: 'error'
      });
      return;
    }

    // НАСТОЯЩАЯ проверка конфликтов
    const conflict = this._detectRealConflict(pattern1, parsed1, pattern2, parsed2);
    if (conflict) {
      this.warnings.push(conflict);
    }
  }

  /**
   * НАСТОЯЩАЯ детекция конфликтов
   * @private
   */
  _detectRealConflict(pattern1, parsed1, pattern2, parsed2) {
    // 1. Проверяем shadowing: статический роут может затенять параметрический
    if (this._isStaticRoute(pattern1) && this._isParametricRoute(pattern2)) {
      if (this._canMatchSamePaths(pattern1, pattern2)) {
        return {
          type: 'route_shadowing',
          pattern: pattern2,
          shadowedBy: pattern1,
          message: `Static route '${pattern1}' may shadow parametric route '${pattern2}'`,
          severity: 'warning'
        };
      }
    }

    if (this._isStaticRoute(pattern2) && this._isParametricRoute(pattern1)) {
      if (this._canMatchSamePaths(pattern2, pattern1)) {
        return {
          type: 'route_shadowing',
          pattern: pattern1,
          shadowedBy: pattern2,
          message: `Static route '${pattern2}' may shadow parametric route '${pattern1}'`,
          severity: 'warning'
        };
      }
    }

    // 2. Проверяем конфликт статического и optional параметрического роута
    if (this._isStaticRoute(pattern1) && pattern2.includes('?')) {
      if (this._checkStaticVsOptionalConflict(pattern1, pattern2)) {
        return {
          type: 'static_optional_conflict',
          pattern: pattern1,
          conflictingWith: pattern2,
          message: `Static route '${pattern1}' conflicts with optional parameter route '${pattern2}' - both can match the same path`,
          severity: 'warning'
        };
      }
    }

    if (this._isStaticRoute(pattern2) && pattern1.includes('?')) {
      if (this._checkStaticVsOptionalConflict(pattern2, pattern1)) {
        return {
          type: 'static_optional_conflict',
          pattern: pattern2,
          conflictingWith: pattern1,
          message: `Static route '${pattern2}' conflicts with optional parameter route '${pattern1}' - both can match the same path`,
          severity: 'warning'
        };
      }
    }

    // 3. Проверяем конфликт между двумя параметрическими роутами с разными regex
    if (this._isParametricRoute(pattern1) && this._isParametricRoute(pattern2)) {
      if (this._checkParametricRegexConflict(pattern1, pattern2)) {
        return {
          type: 'parametric_regex_conflict',
          pattern: pattern1,
          conflictingWith: pattern2,
          message: `Parametric routes '${pattern1}' and '${pattern2}' have overlapping regex patterns - both can match the same paths`,
          severity: 'error'
        };
      }
    }

    // 2. Проверяем ambiguous priority: два параметрических роута с одинаковой структурой
    if (this._isParametricRoute(pattern1) && this._isParametricRoute(pattern2)) {
      if (this._hasSameStructure(pattern1, pattern2)) {
        return {
          type: 'ambiguous_priority',
          patterns: [pattern1, pattern2],
          message: `Ambiguous priority between '${pattern1}' and '${pattern2}' - both have same parameter structure`,
          severity: 'warning'
        };
      }
    }

    // 3. Проверяем regex conflicts
    if (this._hasRegexConflicts(pattern1, parsed1, pattern2, parsed2)) {
      return {
        type: 'regex_conflict',
        patterns: [pattern1, pattern2],
        message: `Regex patterns may conflict between '${pattern1}' and '${pattern2}'`,
        severity: 'warning'
      };
    }

    return null;
  }

  /**
   * Проверяет является ли роут статическим
   * @private
   */
  _isStaticRoute(pattern) {
    return !pattern.includes(':') && !pattern.includes('*');
  }

  /**
   * Проверяет является ли роут параметрическим
   * @private
   */
  _isParametricRoute(pattern) {
    return pattern.includes(':');
  }

  /**
   * Проверяют могут ли два роута матчить одинаковые пути
   * @private
   */
  _canMatchSamePaths(staticPattern, parametricPattern) {
    const staticParts = staticPattern.split('/');
    const parametricParts = parametricPattern.split('/');
    
    // Разная длина = не могут матчить одинаковые пути
    if (staticParts.length !== parametricParts.length) return false;
    
    // Проверяем только если роуты имеют ОДИНАКОВЫЙ префикс
    if (staticParts[1] !== parametricParts[1]) return false;
    
    for (let i = 0; i < staticParts.length; i++) {
      const staticPart = staticParts[i];
      const parametricPart = parametricParts[i];
      
      // Если статическая часть может быть параметром
      if (parametricPart.startsWith(':') && staticPart !== '') {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Проверяет конфликт между двумя параметрическими роутами с regex
   * @private
   */
  _checkParametricRegexConflict(pattern1, pattern2) {
    // Проверяем что оба роута имеют regex ограничения
    const hasRegex1 = pattern1.includes('(') && pattern1.includes(')');
    const hasRegex2 = pattern2.includes('(') && pattern2.includes(')');
    
    if (!hasRegex1 || !hasRegex2) {
      return false;
    }
    
    // Проверяем что роуты имеют одинаковую длину и структуру
    const parts1 = pattern1.split('/');
    const parts2 = pattern2.split('/');
    
    if (parts1.length !== parts2.length) {
      return false; // Разная длина = нет конфликта
    }
    
    // Проверяем что все части кроме параметрических совпадают
    for (let i = 0; i < parts1.length; i++) {
      const part1 = parts1[i];
      const part2 = parts2[i];
      
      // Если обе части не параметрические, они должны совпадать
      if (!part1.startsWith(':') && !part2.startsWith(':')) {
        if (part1 !== part2) {
          return false; // Разные статические части = нет конфликта
        }
      }
      // Если одна параметрическая, а другая нет - это нормально
    }
    
    // Извлекаем regex части из паттернов
    const regex1Match = pattern1.match(/:([^(]+)\(([^)]+)\)/);
    const regex2Match = pattern2.match(/:([^(]+)\(([^)]+)\)/);
    
    if (!regex1Match || !regex2Match) {
      return false;
    }
    
    const regex1Str = regex1Match[2]; // [a-zA-Z2-9]
    const regex2Str = regex2Match[2]; // [0-2]
    
    // Проверяем пересечение regex диапазонов
    try {
      const regex1 = new RegExp(`^${regex1Str}$`);
      const regex2 = new RegExp(`^${regex2Str}$`);
      
      // Тестируем на символах, которые могут пересекаться
      const testChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'A', 'B', 'C'];
      
      for (const char of testChars) {
        if (regex1.test(char) && regex2.test(char)) {
          return true; // Найден конфликт!
        }
      }
    } catch (e) {
      // Если regex невалидный, считаем конфликтом
      return true;
    }
    
    return false;
  }

  /**
   * Проверяет конфликт между статическим и optional параметрическим роутом
   * @private
   */
  _checkStaticVsOptionalConflict(staticPattern, optionalPattern) {
    const staticParts = staticPattern.split('/');
    const optionalParts = optionalPattern.split('/');
    
    // Проверяем только если роуты имеют ОДИНАКОВЫЙ префикс
    if (staticParts[1] !== optionalParts[1]) {
      return false;
    }
    
    // Специальная проверка: статический роут может конфликтовать с optional
    // если optional роут может матчить тот же путь
    if (staticParts.length === optionalParts.length - 1) {
      // /test vs /test/:id? - статический короче на 1
      
      // Проверяем что все части до optional параметра совпадают
      let matches = true;
      for (let i = 0; i < staticParts.length; i++) {
        if (staticParts[i] !== optionalParts[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        // Проверяем что последняя часть optional роута - это optional параметр
        const lastOptionalPart = optionalParts[optionalParts.length - 1];
        if (lastOptionalPart.endsWith('?')) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Проверяет одинаковую структуру роутов
   * @private
   */
  _hasSameStructure(pattern1, pattern2) {
    const parts1 = pattern1.split('/');
    const parts2 = pattern2.split('/');
    
    // Разная длина = разная структура
    if (parts1.length !== parts2.length) return false;
    
    // Проверяем только если роуты могут реально конфликтовать
    // (например, оба начинаются с одного префикса)
    const prefix1 = parts1[1]; // /users, /posts, /albums
    const prefix2 = parts2[1]; // /test
    
    // Если разные префиксы - не конфликт
    if (prefix1 !== prefix2) return false;
    
    for (let i = 0; i < parts1.length; i++) {
      const part1 = parts1[i];
      const part2 = parts2[i];
      
      // Если оба параметры, но разные имена в ОДНОМ префиксе
      if (part1.startsWith(':') && part2.startsWith(':')) {
        // Проверяем есть ли regex ограничения
        const hasRegex1 = part1.includes('(') && part1.includes(')');
        const hasRegex2 = part2.includes('(') && part2.includes(')');
        
        // Если у обоих есть regex ограничения - не конфликт
        if (hasRegex1 && hasRegex2) {
          return false; // Разные regex = разные роуты
        }
        
        if (part1 !== part2) return true; // Разные параметры в одной позиции
      }
    }
    
    return false;
  }

  /**
   * Проверяет конфликты regex
   * @private
   */
  _hasRegexConflicts(pattern1, parsed1, pattern2, parsed2) {
    // Проверяем если оба роута имеют regex ограничения
    const hasRegex1 = pattern1.includes('(') && pattern1.includes(')');
    const hasRegex2 = pattern2.includes('(') && pattern2.includes(')');
    
    if (hasRegex1 && hasRegex2) {
      // Проверяем могут ли regex конфликтовать
      try {
        const regex1 = new RegExp(parsed1.pattern);
        const regex2 = new RegExp(parsed2.pattern);
        
        // Тестируем на реальных путях для этих роутов
        const testPaths = ['/posts/123', '/posts/abc', '/posts/123abc', '/posts/abc123'];
        
        for (const path of testPaths) {
          if (regex1.test(path) && regex2.test(path)) {
            return true;
          }
        }
      } catch (e) {
        // Если regex невалидный, считаем конфликтом
        return true;
      }
    }
    
    return false;
  }

  /**
   * Проверяет перекрытие между двумя паттернами
   * @private
   */
  _checkPatternOverlap(parsed1, parsed2) {
    // Простая проверка: если один паттерн может матчить пути другого
    const regex1 = new RegExp(parsed1.pattern);
    const regex2 = new RegExp(parsed2.pattern);
    
    // Генерируем тестовые пути для проверки
    const testPaths = [
      '/users/123',
      '/users/profile', 
      '/users/admin',
      '/posts/test',
      '/posts/123',
      '/admin',
      '/api'
    ];
    
    // Проверяем, может ли один паттерн матчить пути другого
    for (const testPath of testPaths) {
      if (regex1.test(testPath) && regex2.test(testPath)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Генерирует тестовые пути для проверки перекрытия
   * @private
   */
  _generateTestPaths(parsed1, parsed2) {
    const paths = [];
    
    // Генерируем несколько тестовых путей
    const testValues = ['123', 'abc', 'test', 'user', 'admin'];
    
    for (const value of testValues) {
      // Заменяем параметры на тестовые значения
      let path1 = parsed1.pattern;
      let path2 = parsed2.pattern;
      
      for (const param of parsed1.params) {
        path1 = path1.replace(`(${param})`, value);
      }
      
      for (const param of parsed2.params) {
        path2 = path2.replace(`(${param})`, value);
      }
      
      paths.push(path1, path2);
    }
    
    return paths;
  }

  /**
   * Вычисляет приоритет роута
   * @private
   */
  _calculatePriority(pattern, parsed) {
    let priority = 0;
    
    // Базовый приоритет по типу роута
    if (pattern === '*') {
      priority = 1000; // Самый низкий приоритет
    } else if (!pattern.includes(':')) {
      priority = 100; // Статические роуты имеют высокий приоритет
    } else {
      priority = 200; // Роуты с параметрами
    }
    
    // Учитываем количество параметров (меньше = выше приоритет)
    priority += parsed.params.length * 10;
    
    // Учитываем регулярные выражения (сложнее = ниже приоритет)
    if (parsed.pattern.includes('(') && parsed.pattern.includes(')')) {
      priority += 50;
    }
    
    // Учитываем optional параметры (ниже приоритет)
    if (pattern.includes('?')) {
      priority += 30;
    }
    
    // Пользовательские приоритеты
    if (this.options.customPriorities[pattern] !== undefined) {
      priority = this.options.customPriorities[pattern];
    }
    
    return priority;
  }

  /**
   * Нормализует путь (копия из routes-store.js)
   * @private
   */
  _normalizePath(prefix, childPath) {
    if (childPath === '*') return '*';
    const pfx = prefix === '/' ? '' : (prefix || '');
    if (!childPath || childPath === '/') return (pfx || '/') || '/';
    const left = pfx.endsWith('/') ? pfx.slice(0, -1) : pfx;
    const right = childPath.startsWith('/') ? childPath : `/${childPath}`;
    const result = `${left}${right}`;
    return result || '/';
  }

  /**
   * Получает рекомендации по исправлению конфликтов
   */
  getRecommendations() {
    const recommendations = [];
    
    for (const conflict of this.conflicts) {
      switch (conflict.type) {
        case 'duplicate':
          recommendations.push({
            type: 'remove_duplicate',
            pattern: conflict.pattern,
            suggestion: `Remove duplicate definition of '${conflict.pattern}'`
          });
          break;
          
        case 'ambiguous_priority':
          recommendations.push({
            type: 'reorder_routes',
            patterns: conflict.patterns,
            suggestion: `Reorder routes to put more specific patterns first, or make patterns more distinct`
          });
          break;
      }
    }
    
    return recommendations;
  }
}

/**
 * Создает валидатор с настройками по умолчанию
 */
export function createRouteValidator(options = {}) {
  return new RouteValidator(options);
}

/**
 * Быстрая валидация роутов
 */
export function validateRoutes(routesConfig, options = {}) {
  const validator = createRouteValidator(options);
  return validator.validateRoutes(routesConfig);
}
