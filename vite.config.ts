import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'АвтоСервис — Запись',
        short_name: 'АвтоСервис',
        description: 'Запись в автосервис или детейлинг-студию',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#4690FF',
        lang: 'ru',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Кэшируем только статику, БЕЗ html
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        // SPA: при заходе на /s/studio-abc/ отдаём index.html только при офлайне
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/rest/, /^\/storage/, /^\/auth/],
        // Новый service worker активируется сразу, без перезагрузки
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // HTML-страницы: сначала сеть, кэш только при офлайне
            // networkTimeoutSeconds: 3 — если сеть медленнее 3 сек, отдаём из кэша
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 },
            },
          },
          {
            // Supabase REST API: свежие данные при любой возможности
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 },
            },
          },
          {
            // Фото из Storage: кэшируем надолго (они редко меняются)
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});