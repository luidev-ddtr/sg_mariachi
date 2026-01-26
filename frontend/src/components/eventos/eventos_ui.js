// ✅ eventos_ui.js
import { ArchivarReservacion } from '../../api/api_reservacion_archivar.js';
import { CancelarReservacion } from '../../api/api_reservacion_cancelar.js'; 
import { renderReservationsTable } from './eventos_logic.js';
import { TableDropdownManager } from './dropdown_manajer.js';

// === FUNCIÓN PARA ABRIR EL CONTRATO (DETALLES) ===
const openContractModal = (eventId) => {
  const url = `../src/components/eventos/formulario_contrato.html?id=${eventId}`;
  const modalOverlay = document.getElementById('modalOverlay');
  const modalFrame = document.getElementById('modalFrame');
  if (modalOverlay && modalFrame) {
    modalFrame.src = url;
    modalOverlay.classList.add('visible');
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
  }
};

// === FUNCIÓN PARA ABRIR MODAL DE PAGOS ===
const openPaymentModal = (eventId) => {
  // Se asume que modal_pago1.html está en la misma carpeta que los otros formularios
  const url = `../src/components/eventos/modal_pago1.html?id=${eventId}`;
  const modalOverlay = document.getElementById('modalOverlay');
  const modalFrame = document.getElementById('modalFrame');
  
  if (modalOverlay && modalFrame) {
    modalFrame.src = url;
    modalOverlay.classList.add('visible');
  } else {
    console.error('No se encontró el modalOverlay o modalFrame para pagos');
  }
};

// === FUNCIÓN PARA CANCELAR RESERVACIÓN ===
const handleCancelation = async (reservationId) => {
  if (confirm("¿Estás seguro de que deseas cancelar esta reservación?")) {
    try {
      await CancelarReservacion(reservationId); 
      alert("Reservación cancelada correctamente.");
      document.dispatchEvent(new CustomEvent('evento-actualizado'));
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert(`No se pudo cancelar la reservación: ${error.message}`);
    }
  }
};

// === GESTIÓN DE MODAL ARCHIVAR ===
const openArchiveModal = (reservationId) => {
  const modal = document.getElementById('confirmArchiveModal');
  if (modal) {
    const confirmBtn = modal.querySelector('#btn-confirm-archive');
    if (confirmBtn) confirmBtn.dataset.id = reservationId;
    modal.style.display = 'block';
  }
};

const closeArchiveModal = () => {
  const modal = document.getElementById('confirmArchiveModal');
  if (modal) modal.style.display = 'none';
};

const setupConfirmationModalListeners = () => {
  const modal = document.getElementById('confirmArchiveModal');
  if (!modal) return;

  modal.querySelector('.close-modal')?.addEventListener('click', closeArchiveModal);
  modal.querySelector('#btn-cancel-archive')?.addEventListener('click', closeArchiveModal);

  const confirmBtn = modal.querySelector('#btn-confirm-archive');
  confirmBtn?.addEventListener('click', async () => {
    const id = confirmBtn.dataset.id;
    if (id) {
      try {
        await ArchivarReservacion(id);
        closeArchiveModal();
        document.dispatchEvent(new CustomEvent('evento-actualizado'));
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  });
};

const setupFilterListener = () => {
  const filterButton = document.getElementById('btnFiltrar');
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');

  filterButton?.addEventListener('click', (e) => {
    e.preventDefault();
    renderReservationsTable(dateInput.value, statusSelect.value);
  });
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

  // 🔥 VINCULACIÓN CON EL DROPDOWN MANAGER
  new TableDropdownManager('#tabla-eventos tbody', {
    onEdit: (id) => openEditModal(id),
    onArchive: (id) => openArchiveModal(id),
    onDetails: (id) => openContractModal(id),
    onPay: (id) => openPaymentModal(id), // 👈 Vinculado a la nueva modal
    onCancel: (id) => handleCancelation(id) 
  });

  document.addEventListener('evento-actualizado', () => {
    renderReservationsTable(dateInput?.value || today, statusSelect?.value || 'todos');
  });
});