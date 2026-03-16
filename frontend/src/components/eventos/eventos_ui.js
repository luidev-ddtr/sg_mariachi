// ✅ eventos_ui.js (VERSIÓN OPTIMIZADA CON BUSCADOR Y MODALES CUSTOM)
import { ArchivarReservacion } from '../../api/api_reservacion_archivar.js';
import { CancelarReservacion } from '../../api/api_reservacion_cancelar.js';
import { renderReservationsTable } from './eventos_logic.js';
import { TableDropdownManager } from './dropdown_manajer.js';

// === FUNCIONES DE MODALES HTML ===
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

const openContractModal = (eventId) => openModal(`/pages/formulario_contrato.html?id=${eventId}`);
const openEditModal = (eventId) => openModal(`/pages/formulario_edit_evento.html?id=${eventId}`);
const openPaymentModal = (eventId) => openModal(`/pages/modal_pago1.html?id=${eventId}`);

// === NUEVO SISTEMA DE MODALES (Notificaciones) ===
function mostrarModalCustom(titulo, mensaje, tipo = 'info', textoAceptar = 'Aceptar', mostrarCancelar = false) {
    return new Promise((resolve) => {
        let colorBoton = "#0d6efd"; 
        if (tipo === 'success') colorBoton = "#198754"; 
        if (tipo === 'error') colorBoton = "#dc3545"; 
        if (tipo === 'warning') colorBoton = "#fd7e14"; 

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 8px; width: 400px; max-width: 90%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
            transform: translateY(-20px); transition: transform 0.3s ease;
        `;

        const btnCancelarHTML = mostrarCancelar 
            ? `<button id="btn-cancelar" style="background: #e9ecef; color: #333; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Cancelar</button>` 
            : '';

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: bold;">${titulo}</h3>
                <button id="btn-cerrar-x" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888;">&times;</button>
            </div>
            <div style="padding: 25px 20px; text-align: center; color: #555; font-size: 1rem;">
                ${mensaje}
            </div>
            <div style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                ${btnCancelarHTML}
                <button id="btn-aceptar" style="background: ${colorBoton}; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">${textoAceptar}</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);

        const cerrarModal = (resultado) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(resultado);
            }, 300);
        };

        modal.querySelector('#btn-cerrar-x').onclick = () => cerrarModal(false);
        modal.querySelector('#btn-aceptar').onclick = () => cerrarModal(true);
        if (mostrarCancelar) {
            modal.querySelector('#btn-cancelar').onclick = () => cerrarModal(false);
        }
    });
}

// === ACCIONES DIRECTAS ===
const handleCancelation = async (reservationId) => {
  // 🔥 Usamos nuestro modal custom en lugar de confirm()
  const confirmar = await mostrarModalCustom(
      "Cancelar Reservación", 
      "¿Estás seguro de que deseas cancelar esta reservación?", 
      "error", 
      "Sí, Cancelar", 
      true
  );

  if (confirmar) {
    try {
      await CancelarReservacion(reservationId);
      await mostrarModalCustom("¡Cancelada!", "Reservación cancelada correctamente.", "success");
      document.dispatchEvent(new CustomEvent('evento-actualizado'));
    } catch (error) {
      console.error('Error al cancelar:', error);
      await mostrarModalCustom("Error", `No se pudo cancelar la reservación: ${error.message}`, "error");
    }
  }
};

// === GESTIÓN DE MODAL ARCHIVAR ===
const openArchiveModal = async (reservationId) => {
  // 🔥 Usamos nuestro modal custom en lugar del modal viejo del DOM
  const confirmar = await mostrarModalCustom(
      "Confirmar Acción", 
      "¿Estás seguro de que deseas archivar este evento?", 
      "warning", 
      "Sí, Archivar", 
      true
  );

  if (confirmar) {
      try {
        await ArchivarReservacion(reservationId);
        await mostrarModalCustom("¡Archivado!", "El evento se ha archivado correctamente.", "success");
        document.dispatchEvent(new CustomEvent('evento-actualizado'));
      } catch (error) {
        await mostrarModalCustom("Error", `Hubo un problema: ${error.message}`, "error");
      }
  }
};

// === LISTENERS GLOBALES ===
const setupFilterListener = () => {
  const filterButton = document.getElementById('btnFiltrar');
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');
  // 🔥 Capturamos el input del buscador (Asegúrate de poner este ID en tu HTML)
  const searchInput = document.getElementById('inputBuscarNombre');

  filterButton?.addEventListener('click', (e) => {
    e.preventDefault();
    // Enviamos la fecha, el estado y el texto a buscar
    renderReservationsTable(
        dateInput?.value, 
        statusSelect?.value || 'todos',
        searchInput?.value || ''
    );
  });
};

// === INICIO DE LA APLICACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('inputFecha');
  const statusSelect = document.getElementById('selectEstado');
  const searchInput = document.getElementById('inputBuscarNombre');
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  if (dateInput) {
    dateInput.type = 'month'; 
    dateInput.value = currentMonth;
  }
  
  renderReservationsTable(currentMonth, statusSelect?.value || 'todos', searchInput?.value || '');
  
  setupFilterListener();

  new TableDropdownManager('#tabla-eventos tbody', {
    onEdit: (id) => openEditModal(id),
    onArchive: (id) => openArchiveModal(id),
    onDetails: (id) => openContractModal(id),
    onPay: (id) => openPaymentModal(id),
    onCancel: (id) => handleCancelation(id)
  });

  document.addEventListener('evento-actualizado', () => {
    renderReservationsTable(
        dateInput?.value || currentMonth, 
        statusSelect?.value || 'todos',
        searchInput?.value || ''
    );
  });
});

// BÚSQUEDA EN TIEMPO REAL

inputBuscar.addEventListener("input", () => {
  const term = inputBuscar.value.toLowerCase();
  document.querySelectorAll("#tbodyEvents tr").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});