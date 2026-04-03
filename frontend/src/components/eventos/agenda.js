/**
 * Agenda del sistema para el Mariachi San Nicolás
 * Preparada para navegación completa y eventos reales con panel lateral de detalles
 */
import { GetReservationStatsCalendar } from "../../api/api_reservation_stats_calendar.js";
import { GetReservaciones } from "../../api/api_reservacion_read.js";

const buscarEventoPorNombre = async (nombre) => {
  try {
    const response = await axios.get(`/api/reservations/search?name=${encodeURIComponent(nombre)}`);
    return response.data.body || response.data;
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
  const spinnerEl = document.getElementById('loading-spinner'); // Referencia al spinner

  // 🔥 NUEVO: Memoria caché para no descargar 2 veces el mismo mes
  const cacheEventos = {};
  const cacheEstadisticas = {};

  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'timeGridWeek',
    allDaySlot: true,
    height: 'auto',
    headerToolbar: false,
    slotMinTime: "08:00:00",
    slotMaxTime: "23:59:00",

    // 🔥 NUEVO: Control del Spinner nativo de FullCalendar
    loading: function(isLoading) {
      if (spinnerEl) {
        if (isLoading) spinnerEl.classList.remove('spinner-oculto');
        else spinnerEl.classList.add('spinner-oculto');
      }
    },

    events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const start = fetchInfo.start;
        const end = fetchInfo.end;
       
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        const isDetailView = diffDays < 60;
        const isYearView = !isDetailView;

        const midDate = new Date((start.getTime() + end.getTime()) / 2);
        const year = midDate.getFullYear();
        let formattedEvents = [];

        // --- VISTA DE SEMANA, DÍA O MES ---
        if (isDetailView) {
          const monthsToFetch = new Set();
          let current = new Date(start);
         
          while (current < end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            monthsToFetch.add(`${y}-${m}`);
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
          }

          // 🔥 OPTIMIZACIÓN: Solo consulta la API si no está en la memoria caché
          const promises = Array.from(monthsToFetch).map(async (dateParam) => {
             if (cacheEventos[dateParam]) return cacheEventos[dateParam]; // Retorna desde caché
             const data = await GetReservaciones(dateParam);
             cacheEventos[dateParam] = data; // Guarda en caché para la próxima
             return data;
          });

          const results = await Promise.all(promises);
          const data = results.flat();
         
          const uniqueEvents = new Map();
          data.forEach(item => uniqueEvents.set(item.DIM_ReservationId, item));

          formattedEvents = Array.from(uniqueEvents.values()).map(item => {
            return {
              id: `evt-${item.DIM_ReservationId}`,
              title: item.DIM_fullname || "Cliente",
              start: item.DIM_StartDate,
              end: item.DIM_EndDate,
              backgroundColor: '#00b050',
              extendedProps: {
                isDetail: true,
                client: item.DIM_fullname || "Sin Nombre",
                phone: item.DIM_PhoneNumber,
                address: item.DIM_EventAddress || "Dirección no disponible",
                time: item.DIM_StartDate ? new Date(item.DIM_StartDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''
              }
            };
          });
        }
        // --- VISTA DE AÑO O MES (Estadísticas) ---
        else {
          let rawData = [];
          if (isYearView) {
            const promesas = [];
            for (let m = 1; m <= 12; m++) {
              const cacheKey = `stats-${year}-${m}`;
              // 🔥 OPTIMIZACIÓN: Solo consulta la API si no está en la memoria caché
              if (cacheEstadisticas[cacheKey]) {
                  promesas.push(Promise.resolve(cacheEstadisticas[cacheKey]));
              } else {
                  promesas.push(
                      GetReservationStatsCalendar('month', year, m).then(data => {
                          cacheEstadisticas[cacheKey] = data;
                          return data;
                      }).catch(() => [])
                  );
              }
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
     BÚSQUEDA DINÁMICA DE CLIENTE
     ======================================================= */
  const searchInput = document.querySelector('input[type="search"]');

  if (searchInput) {
    searchInput.addEventListener('keypress', async function (e) {
      if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (!query) return;

        try {
          const resultados = await buscarEventoPorNombre(query);

          if (resultados && resultados.length > 0) {
            const eventoEncontrado = resultados[0];
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