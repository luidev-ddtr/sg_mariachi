import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base:'/', //Asegura que las rutas sean relativas al dominio raíz
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Alias para importar desde src fácilmente
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        control_panel: resolve(__dirname, 'pages/control_panel.html'),
        'registro-evento': resolve(__dirname, 'pages/registro-evento.html'),
        agenda: resolve(__dirname, 'pages/agenda.html'),
        generate_reports: resolve(__dirname, 'pages/generate_reports.html'),
        // AÑADIMOS EL FORMULARIO DEL MODAL COMO PUNTO DE ENTRADA
        'formulario-nvo-evento': resolve(__dirname, 'pages/formulario_nvo_evento.html'),
        // AÑADIMOS EL RESTO DE MODALES Y PÁGINAS INDEPENDIENTES
        'formulario-edit-evento': resolve(__dirname, 'pages/formulario_edit_evento.html'),
        'modal-pago': resolve(__dirname, 'pages/modal_pago1.html'),
        'formulario-contrato': resolve(__dirname, 'pages/formulario_contrato.html'),
      },
    },
  },
  // SECCIÓN AGREGADA PARA PERMITIR HOSTS ESPECÍFICOS EN MODO PREVIEW DE VITE:
  preview: {
    allowedHosts: ['https://sg-mariachi.vercel.app'],
  },
});