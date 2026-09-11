// Config de Playwright para MultaClara — tests E2E del flujo de búsqueda.
// Uso: npx playwright test
// Contra producción: BASE_URL=https://mugu-gt.pages.dev npx playwright test
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    viewport: { width: 390, height: 844 }, // móvil (público objetivo)
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['list']],
})