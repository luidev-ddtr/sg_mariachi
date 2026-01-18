// ✅ eventos_ui.js
// (TODA LA LÓGICA DE INTERFAZ Y LISTENERS)

// IMPORTAMOS LA FUNCIÓN DEL OTRO ARCHIVO
import { ArchivarReservacion } from '../../api/api_reservacion_archivar.js';
import { renderReservationsTable } from './eventos_logic.js';
import { TableDropdownManager } from './dropdown_manajer.js';

// === FUNCIÓN PARA ABRIR EL CONTRATO (DETALLES) ===
const openContractModal = (eventId) => {
  // La ruta debe ser relativa al panel de control que está en /pages
  const url = `../src/components/eventos/formulario_contrato.html?id=${eventId}`;
  const modalOverlay = document.getElementById('modalOverlay');
  const modalFrame = document.getElementById('modalFrame');
  
  if (modalOverlay && modalFrame) {
    modalFrame.src = url;
    modalOverlay.classList.add('visible');
  } else {
    console.error('No se encontró el modal para el contrato');
  }
};

// === FUNCIÓN PARA ABRIR MODAL DE EDICIÓN ===
const openEditModal = (eventId) => {
  const url = `../src/components/eventos/formulario_edit_evento.html?id=${eventId}`;
  const modalOverlay = document.getElementById('modalOverlay');
  const modalFrame = document.getElementById('modalFrame');
  
  if (modalOverlay && modalFrame) {
    modalFrame.src = url;
    modalOverlay.classList.add('visible');
  } else {
    console.error('No se encontró el modal de edición');
  }
};

// === FUNCIÓN PARA ABRIR MODAL DE ARCHIVAR === 
const openArchiveModal = (reservationId) => {
  const modal = document.getElementById('confirmArchiveModal');
  
  if (modal) {
    const confirmBtn = modal.querySelector('#btn-confirm-archive');
    if (confirmBtn) {
      confirmBtn.dataset.id = reservationId;
    }
    modal.style.display = 'block';
  } else {
    console.error('No se encontró el modal de confirmación de archivo');
  }
};

// === FUNCIÓN PARA CERRAR MODAL DE ARCHIVAR ===
const closeArchiveModal = () => {
  const modal = document.getElementById('confirmArchiveModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// === CONFIGURAR LISTENERS DEL MODAL DE CONFIRMACIÓN ===
const setupConfirmationModalListeners = () => {
  const modal = document.getElementById('confirmArchiveModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeArchiveModal);

  const cancelBtn = modal.querySelector('#btn-cancel-archive');
  if (cancelBtn) cancelBtn.addEventListener('click', closeArchiveModal);

  const confirmBtn = modal.querySelector('#btn-confirm-archive');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const reservationId = confirmBtn.dataset.id;
      if (reservationId) {
        try {
          await ArchivarReservacion(reservationId);
          closeArchiveModal();
          document.dispatchEvent(new CustomEvent('evento-actualizado', { detail: 'archivado' }));
        } catch (error) {
          console.error('Error al intentar archivar:', error);
          alert(`No se pudo archivar la reservación: ${error.message}`);
        }
      }
    });
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) closeArchiveModal();
  });
};

// === CONFIGURAR FILTRO ===
const setupFilterListener = () => {
  const filterButton = document.getElementById('btnFiltrar');
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');

  if (filterButton && dateInput && statusSelect) {
    filterButton.addEventListener('click', (event) => {
      event.preventDefault();
      renderReservationsTable(dateInput.value, statusSelect.value);
    });
  }
};

// === INICIO DE LA APLICACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');
  
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;

  renderReservationsTable(today, statusSelect?.value || 'todos');
  
  setupConfirmationModalListeners();
  setupFilterListener();

  // 3. 🔥 VINCULACIÓN CON EL DROPDOWN MANAGER
  new TableDropdownManager('#tabla-eventos tbody', {
    onEdit: (id) => openEditModal(id),
    onArchive: (id) => openArchiveModal(id),
    onDetails: (id) => openContractModal(id), // <--- Llama a la función del contrato
    onPay: (id) => console.log('Procesando pago de reservación:', id)
  });

  document.addEventListener('evento-actualizado', () => {
    const fechaActual = dateInput ? dateInput.value : today;
    const estadoActual = statusSelect ? statusSelect.value : 'todos';
    renderReservationsTable(fechaActual, estadoActual);
  });
});