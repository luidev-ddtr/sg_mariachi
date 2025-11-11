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
// ---------------------------------


// --- Lógica para renderizar la tabla (¡FILTRADO EN FRONTEND!) ---
const renderReservationsTable = async (dateParam, statusParam) => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) {
    console.error('No se encontró el cuerpo de la tabla (tbody).');
    return;
  }

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Cargando reservaciones...</td></tr>';

  try {
    // 1. Llamamos a la API SOLO CON LA FECHA
    // (statusParam se usará después para filtrar)
    const reservaciones = await GetReservaciones(dateParam);

    // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA DE FILTRADO! ---
    // 2. Filtramos el array en JavaScript (Frontend)
    let reservacionesFiltradas;
    const statusLower = statusParam.toLowerCase();
    
    if (statusLower !== 'todos') {
        // Si el filtro NO es "todos"
        reservacionesFiltradas = reservaciones.filter(item => {
            // Obtenemos el estado del item, con 'pendiente' como default
            const itemStatus = (item.DIM_StatusName || 'pendiente').toLowerCase();
            // Comparamos con el estado del filtro
            return itemStatus === statusLower;
        });
    } else {
        // Si el filtro es "todos", mostramos todas
        reservacionesFiltradas = reservaciones;
    }
    // ---------------------------------------------

    if (reservacionesFiltradas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay reservaciones para mostrar.</td></tr>';
      return;
    }

    // 3. Usamos el array FILTRADO para el .map()
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

// --- Lógica para manejar los clics del Dropdown ---
// (Esta es tu función original completa, que sí funciona)
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

    // --- (Check 2: Clic en "Archivar") ---
    const archiveButton = event.target.closest('.js-archive-trigger');
    if (archiveButton) {
        event.preventDefault();
        const reservationId = archiveButton.dataset.id;
        console.log('ID a archivar:', reservationId);
        const modal = document.getElementById('confirmArchiveModal');
        if (modal) {
            modal.querySelector('#btn-confirm-archive').dataset.id = reservationId;
            modal.style.display = 'block';
        } else {
            console.error('No se encontró el modal #confirmArchiveModal');
        }
        return;
    }


    // --- (Check 3: Clic en el botón de toggle '...') ---
    const toggleButton = event.target.closest('.js-dropdown-toggle');
    if (toggleButton) {
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
      const allOpenMenus = tbody.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });

  // --- (Check 5: Clic fuera del dropdown) ---
  window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      const allOpenMenus = document.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });
};


// --- Lógica del modal de confirmación (¡MODIFICADA!) ---
const setupConfirmationModalListeners = () => {
    const modal = document.getElementById('confirmArchiveModal');
    if (!modal) return;

    const btnCancel = modal.querySelector('#btn-cancel-archive');
    const btnConfirm = modal.querySelector('#btn-confirm-archive');
    const btnClose = modal.querySelector('.modal-close');

    // (Tu función closeModal original)
    const closeModal = () => {
        modal.style.display = 'none';
        btnConfirm.removeAttribute('data-id');
        btnConfirm.textContent = 'Sí, Archivar';
        btnConfirm.disabled = false;
    };

    btnCancel.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    btnConfirm.addEventListener('click', async () => {
        const reservationId = btnConfirm.dataset.id;
        if (!reservationId) return;

        console.log(`Iniciando archivado para ID: ${reservationId}`);

        try {
            btnConfirm.textContent = 'Archivando...';
            btnConfirm.disabled = true;

            const response = await ArchiveReservacion(reservationId);
            console.log(`Respuesta de la API de archivado:`, response);

            closeModal();
            
            // --- ¡CAMBIO AQUÍ! ---
            // Recargamos la tabla usando los valores que están en los filtros
            // (Usamos los IDs de tu HTML: "inputFecha", "selectEstado")
            const dateInput = document.getElementById('inputFecha');
            const statusInput = document.getElementById('selectEstado');
            
            // Usamos la fecha del filtro, o la de hoy si está vacío
            const dateValue = dateInput.value || new Date().toISOString().split('T')[0];
            const statusValue = statusInput.value || 'todos';

            // Volvemos a renderizar, y la función filtrará por nosotros
            renderReservationsTable(dateValue, statusValue); 

        } catch (error) {
            console.error('Error al archivar la reservación:', error);
            alert('Hubo un error al archivar la reservación.');
            btnConfirm.textContent = 'Sí, Archivar';
            btnConfirm.disabled = false;
        }
    });
};


// --- (¡NUEVA FUNCIÓN! para manejar el botón de filtrar) ---
const setupFilterListener = () => {
    // Usamos los IDs de tu HTML: "inputFecha", "selectEstado", "btnFiltrar"
    const dateInput = document.getElementById('inputFecha');
    const statusInput = document.getElementById('selectEstado');
    const filterButton = document.getElementById('btnFiltrar');

    if (!dateInput || !statusInput || !filterButton) {
        console.error('No se encontraron los elementos de filtro (inputFecha, selectEstado, o btnFiltrar)');
        return;
    }

    filterButton.addEventListener('click', (event) => {
        event.preventDefault(); // Previene recarga si estuviera en un <form>

        // 1. Obtener los valores actuales de los filtros
        const dateValue = dateInput.value;
        const statusValue = statusInput.value;

        // 2. Validar que la fecha no esté vacía
        // (El backend filtra por semana, por lo que siempre necesita una fecha)
        if (!dateValue) {
            alert('Por favor, selecciona una fecha para filtrar la semana.');
            return;
        }

        console.log(`Filtrando por: Fecha=${dateValue}, Estado=${statusValue}`);

        // 3. Volver a renderizar la tabla con esos valores
        // La función render... se encargará de filtrar por estado
        renderReservationsTable(dateValue, statusValue);
    });
};


// --- Ejecución inicial (¡MODIFICADA!) ---
// Reemplaza tu 'DOMContentLoaded' original por este:
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Poner la fecha de "hoy" en el filtro de fecha por defecto
    // (Usamos el ID de tu HTML: "inputFecha")
    const dateInput = document.getElementById('inputFecha');
    const initialDate = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = initialDate;
    }

    // 2. Cargar la tabla con los valores por defecto (semana de hoy, todos los estados)
    // (Usamos el ID de tu HTML: "selectEstado")
    const initialStatus = document.getElementById('selectEstado')?.value || 'todos';
    renderReservationsTable(initialDate, initialStatus); 
    
    // 3. Activar el resto de listeners (estos ya los tenías)
    setupDropdownListeners(); 
    setupConfirmationModalListeners();
    
    // 4. Activar el nuevo listener del filtro
    setupFilterListener(); 
});