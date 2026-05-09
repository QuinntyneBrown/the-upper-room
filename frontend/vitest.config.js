// traces_to: L2-101
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text'],
      thresholds: {
        branches: 80,
        lines: 80,
        functions: 80,
        statements: 80,
      },
      include: [
        'projects/api/src/**',
        'projects/components/src/**',
        'projects/domain/src/**',
        'projects/the-upper-room/src/app/**',
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.stories.ts',
        '**/index.ts',
        '**/*.module.ts',
      ],
    },
  },
});
