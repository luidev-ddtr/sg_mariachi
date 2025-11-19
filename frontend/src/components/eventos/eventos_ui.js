// ✅ eventos_ui.js
// (TODA LA LÓGICA DE INTERFAZ Y LISTENERS)

// IMPORTAMOS LA FUNCIÓN DEL OTRO ARCHIVO
import { renderReservationsTable } from './eventos_logic.js';
import { TableDropdownManager } from './dropdown_manajer.js';

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
    // Guardamos el ID en el botón de confirmación
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

  // Botón de cerrar (X)
  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeArchiveModal);
  }

  // Botón de cancelar
  const cancelBtn = modal.querySelector('#btn-cancel-archive');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeArchiveModal);
  }

  // Botón de confirmar
  const confirmBtn = modal.querySelector('#btn-confirm-archive');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const reservationId = confirmBtn.dataset.id;
      if (reservationId) {
        console.log('Archivando reservación:', reservationId);
        // Aquí va tu lógica de archivado
        // Por ejemplo: archivarReservacion(reservationId);
        closeArchiveModal();
      }
    });
  }

  // Cerrar al hacer clic fuera del modal
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeArchiveModal();
    }
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
      const fecha = dateInput.value;
      const estado = statusSelect.value;
      renderReservationsTable(fecha, estado);
    });
  } else {
    console.error("No se encontraron los elementos del filtro. Revisa los IDs.");
  }
};

// === INICIO DE LA APLICACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');
  
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;

  // 1. Carga inicial de la tabla
  renderReservationsTable(today, statusSelect?.value || 'todos');
  
  // 2. Configurar listeners de modales y filtros
  setupConfirmationModalListeners();
  setupFilterListener();

  // 3. 🔥 NUEVO: Inicializar el dropdown manager
  new TableDropdownManager('#tabla-eventos tbody', {
    onEdit: (id) => {
      console.log('Editando reservación:', id);
      openEditModal(id);
    },
    onArchive: (id) => {
      console.log('Solicitando archivar reservación:', id);
      openArchiveModal(id);
    },
    onDetails: (id) => {
      console.log('Ver detalles de reservación:', id);
      // Aquí puedes agregar la lógica para ver detalles
      // Por ejemplo: abrirModalDetalles(id);
    },
    onPay: (id) => {
      console.log('Procesando pago de reservación:', id);
      // Aquí puedes agregar la lógica para pagar
      // Por ejemplo: abrirModalPago(id);
    }
  });

  // 4. Listener para recarga automática
  document.addEventListener('evento-actualizado', () => {
    console.log("🔄 Recibida señal de actualización: Repintando tabla...");
    
    const fechaActual = dateInput ? dateInput.value : today;
    const estadoActual = statusSelect ? statusSelect.value : 'todos';

    renderReservationsTable(fechaActual, estadoActual);
  });
});