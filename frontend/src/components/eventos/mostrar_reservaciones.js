// mostrar_reservaciones.js

// 1. Importar las funciones de la API
import { GetReservaciones } from '../../api/api_reservacion_read.js';
import { ArchiveReservacion } from '../../api/api_reservacion_update.js';

// --- Funciones de formato ---

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  // Sumar un día porque a veces la conversión de zona horaria resta uno
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

// --- Lógica para renderizar la tabla ---

const renderReservationsTable = async () => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) {
    console.error('No se encontró el cuerpo de la tabla (tbody).');
    return;
  }

  // Mostrar estado de carga
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando reservaciones...</td></tr>';

  try {
    // Usamos la fecha actual por defecto, podrías conectarlo a un filtro de fecha
    const fechaFiltro = new Date().toISOString().split('T')[0];
    const reservaciones = await GetReservaciones(fechaFiltro);

    if (reservaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay reservaciones para mostrar.</td></tr>';
      return;
    }

    let counter = 1;
    tbody.innerHTML = reservaciones.map(item => `
      <tr>
        <td>${counter++}</td>
        <td>${item.DIM_fullname || 'N/A'}</td>
        <td>${item.DIM_PhoneNumber || 'N/A'}</td>
        <td>${formatDate(item.FullDate)}</td>
        <td>${formatTime(item.DIM_StartDate)}</td>
        <td>${formatTime(item.DIM_EndDate)}</td>
        <td>${formatCurrency(item.DIM_TotalAmount)}</td>
        <td>
          <span class="status ${item.DIM_StatusName?.toLowerCase() || 'pendiente'}">
            ${item.DIM_StatusName || 'Pendiente'}
          </span>
        </td>
        <td>
          <div class="dropdown">
            <button class="btn-actions js-dropdown-toggle" type="button">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
            <div class="dropdown-menu" style="display: none;">
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
    console.error('Error al renderizar las reservaciones:', error);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: red;">Error al cargar los datos: ${error.message}</td></tr>`;
  }
};

// --- Lógica para manejar los clics del Dropdown (¡ACTUALIZADA!) ---
const setupDropdownListeners = () => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (event) => {
    
    // --- (Check 1: Clic en "Actualizar o editar") ---
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
      } else {
        console.error('No se encontraron los elementos del modal (modalOverlay o modalFrame)');
      }
      return; 
    }

    // --- (¡NUEVO! Check 2: Clic en "Archivar") ---
    const archiveButton = event.target.closest('.js-archive-trigger');
    if (archiveButton) {
        event.preventDefault(); // Evita que el link '#' navegue
        const reservationId = archiveButton.dataset.id;
        console.log('ID a archivar:', reservationId);
        // Mostrar el modal de confirmación
        const modal = document.getElementById('confirmArchiveModal');
        if (modal) {
            // Guardamos el ID en el botón de confirmar, para usarlo después
            modal.querySelector('#btn-confirm-archive').dataset.id = reservationId;
            modal.style.display = 'block'; // Mostramos el modal
        } else {
            console.error('No se encontró el modal #confirmArchiveModal');
        }
        return; // Importante para no seguir propagando el clic
    }


    // --- (Check 3: Clic en el botón de toggle '...') ---
    const toggleButton = event.target.closest('.js-dropdown-toggle');
    if (toggleButton) {
      // ... (El resto de esta lógica sigue igual que antes) ...
      event.preventDefault(); 
      const menu = toggleButton.nextElementSibling; 

      const allOpenMenus = tbody.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        if (openMenu !== menu && openMenu.style.display === 'block') {
          openMenu.style.display = 'none';
        }
      });

      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
      return; 
    }
    
    // --- (Check 4: Clic en cualquier otro item del menú) ---
    if (event.target.closest('.dropdown-item')) {
      // ... (Esta lógica sigue igual) ...
      const allOpenMenus = tbody.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });

  // ... (Tu lógica de window.addEventListener('click') para cerrar menús sigue igual) ...
  window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      const allOpenMenus = document.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });
};


// --- (¡NUEVA FUNCIÓN! para manejar el modal de confirmación) ---
const setupConfirmationModalListeners = () => {
    const modal = document.getElementById('confirmArchiveModal');
    if (!modal) return;

    const btnCancel = modal.querySelector('#btn-cancel-archive');
    const btnConfirm = modal.querySelector('#btn-confirm-archive');
    const btnClose = modal.querySelector('.modal-close');

    // Función para cerrar el modal
    const closeModal = () => {
        modal.style.display = 'none';
        // Limpiamos el ID del botón de confirmar
        btnConfirm.removeAttribute('data-id');
        // Restauramos el botón por si se quedó en "Archivando..."
        btnConfirm.textContent = 'Sí, Archivar';
        btnConfirm.disabled = false;
    };

    // Asignamos los clics para cerrar
    btnCancel.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);
    
    // Cerrar si se hace clic fuera del diálogo (en el overlay)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- ¡ACCIÓN PRINCIPAL! Clic en "Sí, Archivar" ---
    btnConfirm.addEventListener('click', async () => {
        const reservationId = btnConfirm.dataset.id;
        if (!reservationId) return;

        console.log(`Iniciando archivado para ID: ${reservationId}`);

        try {
            // 1. Opcional: Mostrar un "cargando"
            btnConfirm.textContent = 'Archivando...';
            btnConfirm.disabled = true;

            // 2. Llamada real a la API para archivar
            const response = await ArchiveReservacion(reservationId);
            console.log(`Respuesta de la API de archivado:`, response);

            // 3. Si todo salió bien, cerramos modal
            closeModal();
            
            // 4. Opcional: Recargar la tabla para que se vea el cambio
            // (Quita la fila o actualiza el estado visualmente sin recargar todo)
            renderReservationsTable(); 

        } catch (error) {
            console.error('Error al archivar la reservación:', error);
            alert('Hubo un error al archivar la reservación.');
            // Restaura el botón incluso si hay error
            btnConfirm.textContent = 'Sí, Archivar';
            btnConfirm.disabled = false;
        }
    });
};


// --- Ejecución inicial ---
document.addEventListener('DOMContentLoaded', () => {
  renderReservationsTable(); 
  setupDropdownListeners(); 
  setupConfirmationModalListeners(); // <-- ¡AÑADIR ESTA LÍNEA!
});