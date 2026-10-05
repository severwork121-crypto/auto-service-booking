import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← добавили
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'АвтоСервис',
        short_name: 'АвтоСервис',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#4690FF',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}']
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});
