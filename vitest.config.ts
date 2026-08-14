import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Los tests que leen dist/ exigen compilar antes. El script `verify`
    // ya encadena build antes de test.
  },
});
