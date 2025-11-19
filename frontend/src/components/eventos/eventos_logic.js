// ✅ event_logic.js
// (TODA LA LÓGICA DE DATOS Y RENDERIZADO)

import { GetReservaciones } from '../../api/api_reservacion_read.js';

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

// AÑADIMOS 'export' PARA QUE EL OTRO ARCHIVO PUEDA USARLA
export const renderReservationsTable = async (dateParam, statusParam) => {
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
          <!-- Convertido a un select -->
          <center><select class="btn-actions js-action-select" data-id="${item.DIM_ReservationId}">
            <option value="" selected disabled></option>
            <option value="details">Ver detalles</option>
            <option value="archive">Archivar</option>
            <option value="pay">Pagar</option>
            <option value="edit">Actualizar</option>
          </select></center>
        </td>
      </tr> 
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
  }
};