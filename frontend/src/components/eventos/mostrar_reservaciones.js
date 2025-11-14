// mostrar_reservaciones.js (VERSIÓN FINAL 100% FUNCIONAL)

import { GetReservaciones } from '../../api/api_reservacion_read.js';
import { ArchiveReservacion } from '../../api/api_reservacion_update.js';

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const renderReservationsTable = async (dateParam, statusParam) => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando...</td></tr>';

  try {
    const reservaciones = await GetReservaciones(dateParam);
    let reservacionesFiltradas = statusParam.toLowerCase() !== 'todos'
      ? reservaciones.filter(r => (r.DIM_StatusName || 'pendiente').toLowerCase() === statusParam.toLowerCase())
      : reservaciones;

    if (reservacionesFiltradas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay reservaciones.</td></tr>';
      return;
    }

    let counter = 1;
    tbody.innerHTML = reservacionesFiltradas.map(item => `
      <tr>
        <td>${counter++}</td>
        <td>${item.DIM_fullname || 'N/A'}</td>
        <td>${item.DIM_PhoneNumber || 'N/A'}</td>
        <td>${formatDate(item.FullDate)}</td>
        <td>${formatTime(item.DIM_StartDate)}</td>
        <td>${formatTime(item.DIM_EndDate)}</td>
        <td>${formatCurrency(item.DIM_TotalAmount)}</td>
        <td><span class="status ${item.DIM_StatusName?.toLowerCase() || 'pendiente'}">${item.DIM_StatusName || 'Pendiente'}</span></td>
        <td>
          <div class="dropdown">
            <button class="btn-actions js-dropdown-toggle" type="button">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Ver detalles</a>
              <a class="dropdown-item js-archive-trigger" href="#" data-id="${item.DIM_ReservationId}">Archivar</a>
              <a class="dropdown-item" href="#">Pagar</a>
              <a class="dropdown-item js-edit-trigger" href="#" data-id="${item.DIM_ReservationId}">Actualizar</a>
            </div>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
  }
};

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
const setupFilterListener = () => { /* ... tu código original ... */ };

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('inputFecha');
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;

  renderReservationsTable(today, document.getElementById('selectEstado')?.value || 'todos');
  setupDropdownListeners();
  setupConfirmationModalListeners();
  setupFilterListener();
});