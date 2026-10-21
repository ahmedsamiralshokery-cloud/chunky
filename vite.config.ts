import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/*.jpg', 'images/*.jfif'],
      manifest: {
        name: 'CHUNKY - Fried Chicken & Burger',
        short_name: 'CHUNKY',
        description: 'تشانكي كفر الدوار - 6 سنين قرمشة! اطلب البروست والاستريبس والبرجر أونلاين',
        lang: 'ar',
        dir: 'rtl',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#ffd000',
        icons: [
          { src: 'images/logo.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
          { src: 'images/logo.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jfif,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'chunky-cache-v1',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
});
