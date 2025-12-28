import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Fonts from 'unplugin-fonts/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
// Utilities
import { defineConfig } from 'vite'

import Layouts from 'vite-plugin-vue-layouts-next'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      dts: 'src/typed-router.d.ts',
    }),
    Layouts(),
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        {
          pinia: ['defineStore', 'storeToRefs'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 8080,
    headers: {
      // Match legacy app CSP headers - allows connecting to external services
      'Content-Security-Policy':
        "default-src 'self' data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' maps.googleapis.com cdnjs.cloudflare.com; " +
        'connect-src *; ' +
        "frame-src 'self' *.factssquared.com:* data: blob:; " +
        "style-src 'self' 'unsafe-inline' data: blob: fonts.googleapis.com cdn.jsdelivr.net; " +
        "img-src 'self' data: blob: *.gstatic.com; " +
        "font-src 'self' data: blob: fonts.gstatic.com cdn.jsdelivr.net;",
    },
    // Proxy for Identity Server to avoid CORS issues in local development
    proxy: {
      // Proxy OIDC metadata and token endpoints
      '/ids': {
        target: 'https://cloud-dev-auth.factssquared.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ids/, ''),
        secure: true,
      },
    },
  },
})
