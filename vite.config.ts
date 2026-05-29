import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string
}

export default defineConfig({
  base: '/Monete/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Monete',
        short_name: 'Monete',
        description: 'RSVP for kids birthday parties',
        theme_color: '#f59e0b',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/Monete/',
        scope: '/Monete/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/Monete/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // REST only — never intercept the Realtime WebSocket or auth endpoints.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { sourcemap: true, target: 'es2022' },
})
