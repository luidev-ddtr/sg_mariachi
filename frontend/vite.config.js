import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Agregamos todas las páginas que necesitas
        login: resolve(__dirname, 'pages/login.html'),
        control_panel: resolve(__dirname, 'pages/control_panel.html'),
        'registro-evento': resolve(__dirname, 'pages/registro-evento.html'),
        agenda: resolve(__dirname, 'pages/agenda.html'),
        generate_reports: resolve(__dirname, 'pages/generate_reports.html'),
      },
    },
  },
});