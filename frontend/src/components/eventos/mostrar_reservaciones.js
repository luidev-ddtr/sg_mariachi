// mostrar_reservaciones.js

// 1. Importar la función.
import { GetReservaciones } from '../../api/api_reservacion_read.js';

// --- Funciones auxiliares para formatear ---
const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

// --- Función principal ---
const renderReservationsTable = async () => {
  
  const tbody = document.querySelector('#tabla-eventos tbody'); 
  
  if (!tbody) {
    console.error('Error: No se encontró el elemento <tbody> de #tabla-eventos');
    return;
  }

  tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Cargando reservaciones...</td></tr>';

  try {
    const reservaciones = await GetReservaciones(new Date());
    console.log(reservaciones);
    if (reservaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No hay reservaciones para mostrar.</td></tr>';
      return;
    }

    const filasHtml = reservaciones.map((item, index) => {
      
      const estado = (item.DIM_StatusName || 'desconocido').toLowerCase();
      const estadoCapitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);

      return `
        <tr>
          <td>${index + 1 /* Indice */}</td> 
          <td>${item.DIM_fullname /* Nombre completo */}</td>
          <td>${item.DIM_PhoneNumber /* Número de teléfono */}</td>
          <td>${formatDate(item.DIM_StartDate) /* Fecha de inicio */}</td>
          <td>${formatTime(item.DIM_StartDate) /* Hora de inicio */}</td>
          <td>${formatTime(item.DIM_EndDate) /* Hora de fin */}</td>
          <td>${formatCurrency(item.DIM_TotalAmount) /* Cantidad total */}</td>
          
          <td>
            <span class="estado ${estado}">${estadoCapitalizado}</span>
          </td>
          
          <td>
            <div class="dropdown">
              
              <button class="acciones js-dropdown-toggle" type="button">
                <span class="material-symbols-outlined acciones">more_horiz</span>
              </button>

              <div class="dropdown-menu" style="display: none;">
                <a class="dropdown-item" href="#">Ver detalles</a>
                <a class="dropdown-item" href="#">Archivar</a>
                <a class="dropdown-item" href="#">Pagar</a>
                
                <a class="dropdown-item js-edit-trigger" href="#" data-id="${item.DIM_DateId}">
                  Actualizar</a>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join(''); 

    tbody.innerHTML = filasHtml;

  } catch (error) {
    console.error('Error al cargar las reservaciones:', error);
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: red;">Error al cargar los datos.</td></tr>';
  }
};


// --- Lógica para manejar los clics del Dropdown (¡ACTUALIZADA!) ---
const setupDropdownListeners = () => {
  const tbody = document.querySelector('#tabla-eventos tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (event) => {
    
    // --- ¡CAMBIO AQUÍ! (Check 1: Clic en "Actualizar o editar") ---
    const editButton = event.target.closest('.js-edit-trigger');
    if (editButton) {
      event.preventDefault(); // Evita que el link '#' navegue

      // 1. Obtener el ID que guardamos en 'data-id'
      const eventId = editButton.dataset.id;
      const url = `../src/components/eventos/formulario_edit_evento.html?id=${eventId}`;

      // 2. Buscar los elementos del modal que YA EXISTEN en registro-evento.html
      const modalOverlay = document.getElementById('modalOverlay');
      const modalFrame = document.getElementById('modalFrame');

      // 3. Activar el modal
      if (modalOverlay && modalFrame) {
        modalFrame.src = url; // Carga el formulario en el iframe
        modalOverlay.classList.add('visible'); // Muestra el modal
      } else {
        console.error('No se encontraron los elementos del modal (modalOverlay o modalFrame)');
      }
      return; // Fin
    }

    // --- (Check 2: Clic en el botón de toggle '...') ---
    const toggleButton = event.target.closest('.js-dropdown-toggle');
    if (toggleButton) {
      event.preventDefault(); 
      const menu = toggleButton.nextElementSibling; 

      // Cerrar todos los OTROS menús
      const allOpenMenus = tbody.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        if (openMenu !== menu && openMenu.style.display === 'block') {
          openMenu.style.display = 'none';
        }
      });

      // Abrir/cerrar el menú actual
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
      return; // Fin
    }
    
    // --- (Check 3: Clic en cualquier otro item del menú, como "Archivar") ---
    if (event.target.closest('.dropdown-item')) {
      // Es un link diferente, deja que navegue (si tiene href)
      // y cierra todos los menús
      const allOpenMenus = tbody.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });

  // Cerrar menús si se hace clic fuera de la tabla
  window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      const allOpenMenus = document.querySelectorAll('.dropdown-menu');
      allOpenMenus.forEach(openMenu => {
        openMenu.style.display = 'none';
      });
    }
  });
};


// 2. Ejecutar la función cuando el contenido del HTML esté listo
document.addEventListener('DOMContentLoaded', () => {
  renderReservationsTable(); 
  setupDropdownListeners();  
});