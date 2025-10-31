module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Directorios donde Jest buscará pruebas
  roots: ['<rootDir>'],

  // Patrones de archivos de prueba
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'Dominio/**/*.ts',
    'aplicacion/**/*.ts',
    'infraestructura/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  // Umbral mínimo de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Directorio para reportes de cobertura
  coverageDirectory: 'coverage',

  // Reportes de cobertura
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Limpiar mocks automáticamente entre pruebas
  clearMocks: true,

  // Verbose output
  verbose: true
};