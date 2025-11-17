// ✅ eventos_ui.js
// (TODA LA LÓGICA DE INTERFAZ Y LISTENERS)

// IMPORTAMOS LA FUNCIÓN DEL OTRO ARCHIVO
import { renderReservationsTable } from './eventos_logic.js';

// === DROPDOWN CON CIERRE PERFECTO ===
const setupDropdownListeners = () => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');

    // 1. CIERRE INMEDIATO AL HACER CLIC EN CUALQUIER OPCIÓN
    if (target && target.closest('.dropdown-item')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }

    // 2. Actualizar → abre modal
    const editButton = event.target.closest('.js-edit-trigger');
    if (editButton) {
      event.preventDefault();
      const eventId = editButton.dataset.id;
      const url = `../src/components/eventos/formulario_edit_evento.html?id=${eventId}`;
      const modalOverlay = document.getElementById('modalOverlay');
      const modalFrame = document.getElementById('modalFrame');
      if (modalOverlay && modalFrame) {
        modalFrame.src = url;
        modalOverlay.classList.add('visible');
      }
      return;
    }

    // 3. Archivar
    const archiveButton = event.target.closest('.js-archive-trigger');
    if (archiveButton) {
      event.preventDefault();
      const reservationId = archiveButton.dataset.id;
      const modal = document.getElementById('confirmArchiveModal');
      if (modal) {
        modal.querySelector('#btn-confirm-archive').dataset.id = reservationId;
        modal.style.display = 'block';
      }
      return;
    }

    // 4. Botón de tres puntos
    const toggleButton = event.target.closest('.js-dropdown-toggle');
    if (toggleButton) {
      event.preventDefault();
      const menu = toggleButton.nextElementSibling;
      tbody.querySelectorAll('.dropdown-menu.show').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
    }
  });

  // Cierre al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
};

// === Resto de funciones (sin cambios) ===
const setupConfirmationModalListeners = () => { /* ... tu código original ... */ };
const setupFilterListener = () => { 
    // 1. Obtenemos los elementos del DOM (IDs de tu HTML)
  const filterButton = document.getElementById('btnFiltrar');
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');

  // 2. Nos aseguramos que todo exista antes de agregar el listener
  if (filterButton && dateInput && statusSelect) {
    
    filterButton.addEventListener('click', (event) => {
      event.preventDefault(); // Previene que la página se recargue

      // 3. Obtenemos los valores ACTUALES de los filtros
      const fecha = dateInput.value;
      const estado = statusSelect.value;

      // 4. Usamos la función importada para repintar la tabla
      renderReservationsTable(fecha, estado);
    });
  } else {
    console.error("No se encontraron los elementos del filtro. Revisa los IDs.");
  }
};

// === INICIO DE LA APLICACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('inputFecha');
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;

  // Llama a la función que IMPORTAMOS
  renderReservationsTable(today, document.getElementById('selectEstado')?.value || 'todos');
  
  // Configura todos los listeners
  setupDropdownListeners();
  setupConfirmationModalListeners();
  setupFilterListener();
});