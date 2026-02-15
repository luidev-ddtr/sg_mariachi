// ✅ eventos_logic.js (VERSIÓN OPTIMIZADA)
import { GetReservaciones } from '../../api/api_reservacion_read.js';

// --- Funciones de Formato ---
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

// --- Funciones de Estadísticas ---
// En eventos_logic.js
export const calcularEstadisticas = (reservaciones) => {
  const total = reservaciones.length;
  
  // 🔥 AQUÍ ESTÁ EL FIX: Cambiamos 'completado' por 'completo'
  const completados = reservaciones.filter(r => 
    (r.DIM_StatusName || '').toLowerCase() === 'completo'
  ).length;
  
  const pendientes = reservaciones.filter(r => {
    const status = (r.DIM_StatusName || '').toLowerCase();
    return ['pendiente', 'confirmado', 'programado'].includes(status);
  }).length;
  
  const cancelados = reservaciones.filter(r => 
    (r.DIM_StatusName || '').toLowerCase() === 'cancelado'
  ).length;
  
  return { total, completados, pendientes, cancelados };
};
export const actualizarCardsEstadisticas = (estadisticas) => {
  const totalCompletados = document.getElementById('totalCompletados');
  const totalPendientes = document.getElementById('totalPendientes');
  const totalEventos = document.getElementById('totalEventos');
  
  if (totalCompletados) totalCompletados.textContent = estadisticas.completados;
  if (totalPendientes) totalPendientes.textContent = estadisticas.pendientes;
  if (totalEventos) totalEventos.textContent = estadisticas.total;
};

// --- Renderizado Principal ---
export const renderReservationsTable = async (dateParam, statusParam) => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando eventos...</td></tr>';

  try {
    // 1. Obtenemos TODOS los datos de la fecha
    const reservaciones = await GetReservaciones(dateParam);
    
    // 2. Calculamos estadísticas SIEMPRE sobre el total real del día (sin importar el filtro de estado)
    const estadisticasGlobales = calcularEstadisticas(reservaciones);
    actualizarCardsEstadisticas(estadisticasGlobales);
    
    // 3. Filtramos solo para lo que se va a mostrar en la tabla
    const reservacionesFiltradas = statusParam.toLowerCase() !== 'todos'
      ? reservaciones.filter(r => (r.DIM_StatusName || 'pendiente').toLowerCase() === statusParam.toLowerCase())
      : reservaciones;

    // 4. Renderizamos la tabla
    if (reservacionesFiltradas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay reservaciones para los filtros seleccionados.</td></tr>';
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
          <center>
            <select class="btn-actions js-action-select" data-id="${item.DIM_ReservationId}">
              <option value="" selected disabled>Acciones</option>
              <option value="details">Ver detalles</option>
              <option value="archive">Archivar</option>
              <option value="pay">Pagar</option>
              <option value="edit">Actualizar</option>
              <option value="cancel">Cancelar</option>
            </select>
          </center>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error al renderizar tabla:", error);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Error al cargar datos. Verifica tu conexión.</td></tr>`;
    // Reseteamos las cards en caso de error
    actualizarCardsEstadisticas({ total: 0, completados: 0, pendientes: 0 });
  }
};