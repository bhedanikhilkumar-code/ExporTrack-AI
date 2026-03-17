import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['logo.png', 'pwa-icons/*.png'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,svg,woff2}', 'pwa-icons/*.png'],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
                        handler: 'NetworkOnly',
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                            cacheableResponse: { statuses: [0, 200] },
                            networkTimeoutSeconds: 10,
                        },
                    },
                ],
                navigateFallback: 'index.html',
                navigateFallbackDenylist: [/^\/api/],
            },
            manifest: {
                name: 'ExporTrack AI',
                short_name: 'ExporTrack',
                description: 'AI-powered logistics intelligence platform for enterprise shipment tracking.',
                start_url: '/',
                display: 'standalone',
                background_color: '#020617',
                theme_color: '#020617',
                orientation: 'portrait',
                categories: ['business', 'logistics', 'productivity'],
                icons: [
                    {
                        src: '/pwa-icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/pwa-icons/icon-384.png',
                        sizes: '384x384',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/pwa-icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: '/pwa-icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'Track Shipments',
                        url: '/shipments',
                        icons: [{ src: '/pwa-icons/icon-192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'Dashboard',
                        url: '/dashboard',
                        icons: [{ src: '/pwa-icons/icon-192.png', sizes: '192x192' }],
                    },
                ],
            },
        }),
    ],
    css: {
        postcss: './postcss.config.js',
    },
});