import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const EXTERNAL_URL = process.env.E2E_BASE_URL
const BASE_URL = EXTERNAL_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Dois workers evitam a disputa de CPU que deixava os fluxos de checkout instáveis.
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    // Trace de toda falha (inclusive local, sem retry) para diagnóstico.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: EXTERNAL_URL
    ? undefined
    : {
        // E2E no mesmo build servido pelo deploy, não no dev server.
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 180_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['mobile-flows.spec.ts'],
    },
    {
      // Fluxos principais também no viewport mobile (Chromium).
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
      testMatch: [
        'checkout.spec.ts',
        'realtime.spec.ts',
        'catalog.spec.ts',
        'a11y.spec.ts',
        'mobile-flows.spec.ts',
      ],
    },
    {
      // 768 px é a largura de tablet exigida pelo enunciado.
      name: 'tablet-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true },
      testMatch: ['catalog.spec.ts', 'a11y.spec.ts', 'checkout.spec.ts'],
    },
  ],
})
