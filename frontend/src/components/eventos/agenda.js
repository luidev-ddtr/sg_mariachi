/**
 * Agenda del sistema para el Mariachi San Nicolás
 * Preparada para navegación completa y eventos reales con panel lateral de detalles
 */
import { GetReservationStatsCalendar } from "../../api/api_reservation_stats_calendar.js";
// IMPORTANTE: Necesitarás importar tu función que trae los detalles reales de las reservas
// import { GetReservationsDetails } from "../../api/api_reservations.js"; 

document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');
  const detailPanel = document.getElementById('detailPanel');
  const panelContent = document.getElementById('panelContent');
  const closePanelBtn = document.getElementById('closePanel');

  // Inicialización del calendario
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'es',
    initialView: 'timeGridWeek',
    allDaySlot: true, 
    height: 'auto',
    headerToolbar: false,
    slotMinTime: "08:00:00", // Opcional: ajustar horario de inicio visible
    slotMaxTime: "23:59:00", // Opcional: ajustar horario de fin visible

events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const start = fetchInfo.start;
        const end = fetchInfo.end;
        
        // Redondeamos para evitar decimales extraños por zonas horarias
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        
        // ¡LA SOLUCIÓN DEFINITIVA!: 
        // Si el calendario pide 10 días o menos (1 o 7), estamos en Día o Semana.
        const isDetailView = diffDays <= 10; 
        // Si pide más de 100 días, estamos en Año.
        const isYearView = diffDays > 100;

        const midDate = new Date((start.getTime() + end.getTime()) / 2);
        const year = midDate.getFullYear();
        let formattedEvents = [];

        // --- VISTA DE SEMANA O DÍA (Eventos individuales con nombre de cliente) ---
        if (isDetailView) {
          // MOCK DE DATOS (Bórralo y usa tu API real más adelante):
          const data = [
            { id: 1, client_name: 'Juan Pérez', date: '2026-03-12', time: '14:00', phone: '555-1234', address: 'Calle Falsa 123' },
            { id: 2, client_name: 'María García', date: '2026-03-14', time: '19:30', phone: '555-9876', address: 'Salón de Fiestas Los Pinos' }
          ];

          formattedEvents = data.map(item => {
            return {
              id: `evt-${item.id}`,
              title: item.client_name, 
              start: `${item.date}T${item.time}`, 
              backgroundColor: '#198754', 
              extendedProps: {
                isDetail: true, 
                client: item.client_name,
                phone: item.phone,
                address: item.address,
                time: item.time
              }
            };
          });
        } 
        // --- VISTA DE AÑO O MES (Estadísticas agrupadas) ---
        else {
          let rawData = [];

          if (isYearView) {
            const promesas = [];
            for (let m = 1; m <= 12; m++) {
              promesas.push(GetReservationStatsCalendar('month', year, m).catch(() => []));
            }
            const resultadosMeses = await Promise.all(promesas);
            
            resultadosMeses.forEach((mesData, index) => {
              if (mesData && mesData.length > 0) {
                mesData.forEach(item => rawData.push({ ...item, monthForDate: index + 1 }));
              }
            });
          } else {
            const month = midDate.getMonth() + 1; 
            const data = await GetReservationStatsCalendar('month', year, month);
            if (data && data.length > 0) {
              data.forEach(item => rawData.push({ ...item, monthForDate: month }));
            }
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
              extendedProps: {
                isDetail: false,
                total: item.total_events
              }
            };
          });
        }

        successCallback(formattedEvents);
      } catch (error) {
        console.error("Error al cargar las reservas:", error);
        failureCallback(error);
      }
    },
    // --- ACCIÓN AL HACER CLIC EN EL EVENTO ---
    eventClick: function(info) {
      const isDetail = info.event.extendedProps.isDetail;

      if (!isDetail) {
        // Si hicieron clic en "X reservas" (estadística), los llevamos a la vista de Día
        calendar.changeView('timeGridDay', info.event.start);
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('day').classList.add('active');
      } else {
        // Si hicieron clic en un cliente (vista semana/día), abrimos el panel con sus datos
        openClientDetailPanel(info.event);
      }
    },

    views: {
      multiMonthYear: {
        type: 'multiMonth',
        duration: { years: 1 },
        buttonText: 'Año'
      }
    },

    datesSet: function () {
      updateCurrentDate(calendar);
    }
  });

  calendar.render();
  updateCurrentDate(calendar);

  /* --- FUNCIONES PARA MANEJAR EL PANEL DE DETALLES --- */
  
  // ¡NUEVO!: Panel adaptado para mostrar datos del cliente
  function openClientDetailPanel(event) {
    const props = event.extendedProps;
    const date = event.start;
    
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = date.toLocaleDateString('es-ES', opcionesFecha).toUpperCase();
    
    // Formatear la hora si existe
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
          <div>
            <small style="color: #666;">Cliente</small>
            <h4 style="margin: 0;">${props.client}</h4>
          </div>
        </div>

        <div class="detail-item" style="display: flex; align-items: center; margin-bottom: 15px;">
          <span class="material-icons" style="margin-right: 10px; color: #555;">phone</span>
          <div>
            <small style="color: #666;">Teléfono</small>
            <p style="margin: 0;">${props.phone || 'No registrado'}</p>
          </div>
        </div>

        <div class="detail-item" style="display: flex; align-items: center; margin-bottom: 15px;">
          <span class="material-icons" style="margin-right: 10px; color: #555;">location_on</span>
          <div>
            <small style="color: #666;">Dirección</small>
            <p style="margin: 0;">${props.address || 'No registrada'}</p>
          </div>
        </div>
      </div>
    `;

    panelContent.innerHTML = htmlContent;
    detailPanel.classList.add('open');
  }

  closePanelBtn.onclick = function() {
    detailPanel.classList.remove('open');
  }

  /* BOTONES DE NAVEGACIÓN */
  document.getElementById('prev').onclick = () => calendar.prev();
  document.getElementById('next').onclick = () => calendar.next();
  document.getElementById('today').onclick = () => calendar.today();

  /* CAMBIO DE VISTAS */
  function changeView(view, button) {
    calendar.changeView(view);
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }

  document.getElementById('day').onclick = function () { changeView('timeGridDay', this); };
  document.getElementById('week').onclick = function () { changeView('timeGridWeek', this); };
  document.getElementById('month').onclick = function () { changeView('dayGridMonth', this); };
  document.getElementById('year').onclick = function () { changeView('multiMonthYear', this); };
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