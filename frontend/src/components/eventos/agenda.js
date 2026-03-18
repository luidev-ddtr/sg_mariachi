/**
 * Agenda del sistema para el Mariachi San Nicolás
 * Preparada para navegación completa y eventos reales con panel lateral de detalles
 */
import { GetReservationStatsCalendar } from "../../api/api_reservation_stats_calendar.js";

// IMPORTANTE: Agregamos una función sencilla para buscar eventos en la base de datos
// (Asegúrate de importar axios en tu HTML de la agenda si no lo tienes)
const buscarEventoPorNombre = async (nombre) => {
  try {
    // 🔥 Reemplaza '/api/reservations/search' por la ruta real que Alec te indique
    const response = await axios.get(`/api/reservations/search?name=${encodeURIComponent(nombre)}`);
    return response.data.body || response.data; // Ajusta según la estructura de tu backend
  } catch (error) {
    console.error("Error al buscar el evento en la API:", error);
    return null;
  }
};

document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');
  const detailPanel = document.getElementById('detailPanel');
  const panelContent = document.getElementById('panelContent');
  const closePanelBtn = document.getElementById('closePanel');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'timeGridWeek',
    allDaySlot: true, 
    height: 'auto',
    headerToolbar: false,
    slotMinTime: "08:00:00", 
    slotMaxTime: "23:59:00", 

    events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const start = fetchInfo.start;
        const end = fetchInfo.end;
        
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        const isDetailView = diffDays <= 10; 
        const isYearView = diffDays > 100;

        const midDate = new Date((start.getTime() + end.getTime()) / 2);
        const year = midDate.getFullYear();
        let formattedEvents = [];

        // --- VISTA DE SEMANA O DÍA (Nombres reales de la API) ---
        if (isDetailView) {
          // 🔥 LLAMADA A LA API REAL PARA OBTENER LOS DETALLES DE LA SEMANA/DÍA 🔥
          // (Alec necesita habilitar un endpoint que devuelva las reservas en un rango de fechas)
          // Ejemplo de cómo se vería: 
          // const response = await axios.get(`/api/reservations/range?start=${start.toISOString()}&end=${end.toISOString()}`);
          // const data = response.data.body || [];

          // Mientras Alec termina eso, dejamos un array vacío (la tabla se verá en blanco)
          // Una vez que el backend esté listo, borra "const data = [];" y descomenta lo de arriba.
          const data = []; 

          formattedEvents = data.map(item => {
            return {
              id: `evt-${item.id || item.DIM_ReservationId}`,
              title: item.client_name || item.DIM_Name, 
              start: `${item.date || item.DIM_StartDate.split(' ')[0]}T${item.time || item.DIM_StartDate.split(' ')[1]}`, 
              backgroundColor: '#198754', 
              extendedProps: {
                isDetail: true, 
                client: item.client_name || `${item.DIM_Name} ${item.DIM_LastName}`,
                phone: item.phone || item.DIM_PhoneNumber,
                address: item.address || item.DIM_EventAddress,
                time: item.time || item.DIM_StartDate.split(' ')[1]
              }
            };
          });
        } 
        // --- VISTA DE AÑO O MES (Estadísticas - ¡Esto ya lo tienes funcionando!) ---
        else {
          let rawData = [];
          if (isYearView) {
            const promesas = [];
            for (let m = 1; m <= 12; m++) {
              promesas.push(GetReservationStatsCalendar('month', year, m).catch(() => []));
            }
            const resultadosMeses = await Promise.all(promesas);
            resultadosMeses.forEach((mesData, index) => {
              if (mesData && mesData.length > 0) mesData.forEach(item => rawData.push({ ...item, monthForDate: index + 1 }));
            });
          } else {
            const month = midDate.getMonth() + 1; 
            const data = await GetReservationStatsCalendar('month', year, month);
            if (data && data.length > 0) data.forEach(item => rawData.push({ ...item, monthForDate: month }));
          }

          formattedEvents = rawData.map(item => {
            const mesFormateado = String(item.monthForDate).padStart(2, '0');
            const diaFormateado = String(item.label).padStart(2, '0');
            const dateString = `${year}-${mesFormateado}-${diaFormateado}`;

            return {
              id: `stat-${dateString}`, 
              title: `${item.total_events} reserva(s)`, 
              start: dateString,
              allDay: true, 
              backgroundColor: '#0d6efd',
              extendedProps: { isDetail: false, total: item.total_events }
            };
          });
        }

        successCallback(formattedEvents);
      } catch (error) {
        console.error("Error al cargar las reservas:", error);
        failureCallback(error);
      }
    },
    
    eventClick: function(info) {
      const isDetail = info.event.extendedProps.isDetail;
      if (!isDetail) {
        calendar.changeView('timeGridDay', info.event.start);
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('day').classList.add('active');
      } else {
        openClientDetailPanel(info.event);
      }
    },
    views: { multiMonthYear: { type: 'multiMonth', duration: { years: 1 }, buttonText: 'Año' } },
    datesSet: function () { updateCurrentDate(calendar); }
  });

  calendar.render();
  updateCurrentDate(calendar);

  /* --- FUNCIONES PARA MANEJAR EL PANEL DE DETALLES --- */
  function openClientDetailPanel(event) {
    const props = event.extendedProps;
    const date = event.start;
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = date.toLocaleDateString('es-ES', opcionesFecha).toUpperCase();
    const horaFormateada = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
      <div class="date-summary">
        <span class="material-icons date-icon">event</span>
        <div>
          <h3>${fechaFormateada}</h3>
          <p>Hora del evento: <strong>${horaFormateada} hrs</strong></p>
        </div>
      </div>
      <hr>
      <div class="client-details" style="margin-top: 20px;">
        <div class="detail-item" style="display: flex; align-items: center; margin-bottom: 15px;">
          <span class="material-icons" style="margin-right: 10px; color: #555;">person</span>
          <div><small style="color: #666;">Cliente</small><h4 style="margin: 0;">${props.client}</h4></div>
        </div>
        <div class="detail-item" style="display: flex; align-items: center; margin-bottom: 15px;">
          <span class="material-icons" style="margin-right: 10px; color: #555;">phone</span>
          <div><small style="color: #666;">Teléfono</small><p style="margin: 0;">${props.phone || 'No registrado'}</p></div>
        </div>
        <div class="detail-item" style="display: flex; align-items: center; margin-bottom: 15px;">
          <span class="material-icons" style="margin-right: 10px; color: #555;">location_on</span>
          <div><small style="color: #666;">Dirección</small><p style="margin: 0;">${props.address || 'No registrada'}</p></div>
        </div>
      </div>
    `;
    panelContent.innerHTML = htmlContent;
    detailPanel.classList.add('open');
  }

  closePanelBtn.onclick = function() { detailPanel.classList.remove('open'); }

  /* BOTONES DE NAVEGACIÓN Y VISTAS */
  document.getElementById('prev').onclick = () => calendar.prev();
  document.getElementById('next').onclick = () => calendar.next();
  document.getElementById('today').onclick = () => calendar.today();
  
  function changeView(view, button) {
    calendar.changeView(view);
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }
  
  document.getElementById('day').onclick = function () { changeView('timeGridDay', this); };
  document.getElementById('week').onclick = function () { changeView('timeGridWeek', this); };
  document.getElementById('month').onclick = function () { changeView('dayGridMonth', this); };
  document.getElementById('year').onclick = function () { changeView('multiMonthYear', this); };

  /* =======================================================
     BÚSQUEDA DINÁMICA DE CLIENTE (SIN DATOS FALSOS)
     ======================================================= */
  const searchInput = document.querySelector('input[type="search"]');

  if (searchInput) {
    searchInput.addEventListener('keypress', async function (e) {
      if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (!query) return; 

        try {
          // Ya no hay mockDB. Usamos la función real que consulta al backend.
          const resultados = await buscarEventoPorNombre(query);

          if (resultados && resultados.length > 0) {
            const eventoEncontrado = resultados[0]; 
            
            // Extraemos la fecha (Aseguramos formato ISO YYYY-MM-DDTHH:MM:SS)
            // Esto asume que el backend devuelve un string como "2026-03-24 10:00:00"
            const fechaString = eventoEncontrado.DIM_StartDate || eventoEncontrado.date; 
            const separador = fechaString.includes('T') ? '' : 'T';
            const fechaDelEvento = fechaString.replace(' ', separador);

            calendar.changeView('timeGridDay', fechaDelEvento);
            
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('day').classList.add('active');
            this.value = ''; 

          } else {
            alert(`No se encontró ningún evento agendado para: "${query}"`);
          }

        } catch (error) {
          console.error("Error en la búsqueda:", error);
          alert("Ocurrió un error al buscar en la base de datos.");
        }
      }
    });
  }
});

function updateCurrentDate(calendar) {
  const date = calendar.getDate();
  const viewType = calendar.view.type;
  let text = '';
  if (viewType === 'multiMonthYear' || viewType === 'dayGridYear') {
    text = date.getFullYear();
  } else {
    const options = { month: 'long', year: 'numeric' };
    text = date.toLocaleDateString('es-ES', options);
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }
  document.getElementById('currentDate').textContent = text;
}