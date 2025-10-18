// Тест конфликта regex роутов
const { validateRoutes } = require('./src/core/route-validator.js');

const testRoutes = {
  '/posts/:slug([a-zA-Z0-9])': 'PostDetail',
  '/posts/:id([0-9])': 'PostDetail'
};

console.log('🧪 Тестируем конфликт regex роутов...');
const result = validateRoutes(testRoutes);

console.log('\n📊 Результат:');
console.log('✅ Валидны:', result.isValid);
console.log('🚨 Конфликты:', result.conflicts.length);
console.log('⚠️ Предупреждения:', result.warnings.length);

if (result.conflicts.length > 0) {
  console.log('\n🚨 КОНФЛИКТЫ:');
  result.conflicts.forEach(c => {
    console.log(`  - ${c.type}: ${c.message}`);
  });
}

if (result.warnings.length > 0) {
  console.log('\n⚠️ ПРЕДУПРЕЖДЕНИЯ:');
  result.warnings.forEach(w => {
    console.log(`  - ${w.type}: ${w.message}`);
  });
}
