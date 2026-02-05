import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        login: resolve(__dirname, 'src/login/login.html'),
        register: resolve(__dirname, 'src/register/register.html'),
        dashboard: resolve(__dirname, 'src/dashboard/dashboard.html'),
        editProfile: resolve(__dirname, 'src/edit-profile/edit-profile.html')
      }
    }
  }
});
