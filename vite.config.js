import { defineConfig } from 'vite';

export default defineConfig({
    root: './',  // Root of your project where the index.html file is located
    publicDir: 'public',  // Folder for static files
    server: {
        host: '0.0.0.0',
        port: 3001,
        open: true,
    },
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});