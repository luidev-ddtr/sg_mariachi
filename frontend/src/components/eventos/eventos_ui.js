// ✅ eventos_ui.js (VERSIÓN OPTIMIZADA PARA MES)
import { ArchivarReservacion } from '../../api/api_reservacion_archivar.js';
import { CancelarReservacion } from '../../api/api_reservacion_cancelar.js';
import { renderReservationsTable } from './eventos_logic.js';
import { TableDropdownManager } from './dropdown_manajer.js';

// === FUNCIONES DE MODALES ===
const openModal = (url) => {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalFrame = document.getElementById('modalFrame');
  if (modalOverlay && modalFrame) {
    modalFrame.src = url;
    modalOverlay.classList.add('visible');
  } else {
    console.error('No se encontró el modalOverlay o modalFrame en el DOM');
  }
};

const openContractModal = (eventId) => openModal(`../src/components/eventos/formulario_contrato.html?id=${eventId}`);
const openEditModal = (eventId) => openModal(`../src/components/eventos/formulario_edit_evento.html?id=${eventId}`);
const openPaymentModal = (eventId) => openModal(`../src/components/eventos/modal_pago1.html?id=${eventId}`);

// === ACCIONES DIRECTAS ===
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

// === LISTENERS GLOBALES ===
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
  
  // 🔥 Extraemos solo el Año y el Mes (Ej. "2026-02")
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  if (dateInput) {
    // Forzamos a que el input sea de tipo mes
    dateInput.type = 'month'; 
    dateInput.value = currentMonth;
  }
  
  // Renderizar tabla inicial con el MES actual
  renderReservationsTable(currentMonth, statusSelect?.value || 'todos');
  
  setupConfirmationModalListeners();
  setupFilterListener();

  // 🔥 VINCULACIÓN CON EL DROPDOWN MANAGER
  new TableDropdownManager('#tabla-eventos tbody', {
    onEdit: (id) => openEditModal(id),
    onArchive: (id) => openArchiveModal(id),
    onDetails: (id) => openContractModal(id),
    onPay: (id) => openPaymentModal(id),
    onCancel: (id) => handleCancelation(id)
  });

  // Escuchar evento de actualización para refrescar todo
  document.addEventListener('evento-actualizado', () => {
    renderReservationsTable(dateInput?.value || currentMonth, statusSelect?.value || 'todos');
  });
});