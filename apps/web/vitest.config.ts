import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/login/page.tsx',
        'app/forgot-password/page.tsx',
        'features/admin/screens/DashboardScreen.tsx',
        'features/admin/screens/PaymentsScreen.tsx',
        'features/admin/screens/ProfileScreen.tsx',
        'features/admin/lib/payments-api.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
