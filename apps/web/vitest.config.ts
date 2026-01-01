import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    // Handle CSS imports for tests - must have both load AND transform
    {
      name: 'css-handler',
      enforce: 'pre',
      load(id) {
        if (/\.(css|scss|sass)$/.test(id)) {
          return 'export default {}'
        }
      },
      transform(code, id) {
        if (/\.(css|scss|sass)$/.test(id)) {
          return {
            code: 'export default {}',
            map: null,
          }
        }
      },
    },
  ],
  // Use Vite's cache dir for faster subsequent runs
  cacheDir: 'node_modules/.vite',
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,js}'],
    passWithNoTests: true,
    // Note: happy-dom may show `--localstorage-file` warnings from Node.js
    // These are harmless and can be safely ignored

    // Critical: inline vuetify to handle its CSS imports
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/mockData/**'],
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  assetsInclude: ['**/*.css'],
  optimizeDeps: {
    exclude: ['vuetify'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  css: {
    modules: {
      // CSS modules configuration
    },
  },
})
