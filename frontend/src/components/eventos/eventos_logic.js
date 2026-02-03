// ✅ eventos_logic.js (VERSIÓN ACTUALIZADA)
import { GetReservaciones } from '../../api/api_reservacion_read.js';

// Funciones de formato (mantén las que ya tienes)
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
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

// Función para calcular estadísticas
export const calcularEstadisticas = (reservaciones) => {
  const total = reservaciones.length;
  const completados = reservaciones.filter(r => 
    (r.DIM_StatusName || '').toLowerCase() === 'completado'
  ).length;
  const pendientes = reservaciones.filter(r => {
    const status = (r.DIM_StatusName || '').toLowerCase();
    return status === 'pendiente' || status === 'confirmado' || status === 'programado';
  }).length;
  
  // También puedes calcular cancelados si lo necesitas
  const cancelados = reservaciones.filter(r => 
    (r.DIM_StatusName || '').toLowerCase() === 'cancelado'
  ).length;
  
  return { total, completados, pendientes, cancelados };
};

// Función para actualizar las cards en el DOM
export const actualizarCardsEstadisticas = (estadisticas) => {
  const totalCompletados = document.getElementById('totalCompletados');
  const totalPendientes = document.getElementById('totalPendientes');
  const totalEventos = document.getElementById('totalEventos');
  
  if (totalCompletados) totalCompletados.textContent = estadisticas.completados;
  if (totalPendientes) totalPendientes.textContent = estadisticas.pendientes;
  if (totalEventos) totalEventos.textContent = estadisticas.total;
};

// Función principal para renderizar la tabla
export const renderReservationsTable = async (dateParam, statusParam) => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando...</td></tr>';

  try {
    const reservaciones = await GetReservaciones(dateParam);
    
    // Calcular y actualizar estadísticas globales
    const estadisticasGlobales = calcularEstadisticas(reservaciones);
    actualizarCardsEstadisticas(estadisticasGlobales);
    
    // Filtrar para la tabla según el estado seleccionado
    let reservacionesFiltradas = statusParam.toLowerCase() !== 'todos'
      ? reservaciones.filter(r => (r.DIM_StatusName || 'pendiente').toLowerCase() === statusParam.toLowerCase())
      : reservaciones;
    
    // Calcular estadísticas de los eventos filtrados
    const estadisticasFiltradas = calcularEstadisticas(reservacionesFiltradas);
    
    // Actualizar cards con estadísticas filtradas
    // (Si quieres que muestren solo las estadísticas filtradas, descomenta la siguiente línea)
    // actualizarCardsEstadisticas(estadisticasFiltradas);

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
        <td>${formatDate(item.DIM_StartDate)}</td>
        <td>${formatTime(item.DIM_StartDate)}</td>
        <td>${formatTime(item.DIM_EndDate)}</td>
        <td>${formatCurrency(item.DIM_TotalAmount)}</td>
        <td><span class="status ${item.DIM_StatusName?.toLowerCase() || 'pendiente'}">${item.DIM_StatusName || 'Pendiente'}</span></td>
        <td>
          <center><select class="btn-actions js-action-select" data-id="${item.DIM_ReservationId}">
            <option value="" selected disabled></option>
            <option value="details">Ver detalles</option>
            <option value="archive">Archivar</option>
            <option value="pay">Pagar</option>
            <option value="edit">Actualizar</option>
            <option value="cancel">Cancelar</option>
          </select></center>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
  }
};