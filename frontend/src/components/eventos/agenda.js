/**
 * Agenda del sistema
 * Preparada para navegación completa y eventos reales
 */

document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');

  // Inicialización del calendario
  const calendar = new FullCalendar.Calendar(calendarEl, {
  locale: 'es',
  initialView: 'timeGridWeek',
  allDaySlot: false,
  height: 'auto',
  headerToolbar: false,
//para el backend
  events: [],

  //actualiza el título al cambiar fecha o vista
  datesSet: function () {
    updateCurrentDate(calendar);
  }
});

  calendar.render();
  updateCurrentDate(calendar);

  /* BOTONES DE NAVEGACIÓN*/
  document.getElementById('prev').onclick = () => calendar.prev();
  document.getElementById('next').onclick = () => calendar.next();
  document.getElementById('today').onclick = () => calendar.today();

  /* CAMBIO DE VISTAS */

  /**
   * Cambia la vista y resalta el botón activo
   * @param {string} view
   * @param {HTMLElement} button
   */
  function changeView(view, button) {
    calendar.changeView(view);

    // Quitar estado activo
    document.querySelectorAll('.view-btn')
      .forEach(btn => btn.classList.remove('active'));

    // Activar botón seleccionado
    button.classList.add('active');
  }

  document.getElementById('day').onclick = function () {
    changeView('timeGridDay', this);
  };

  document.getElementById('week').onclick = function () {
    changeView('timeGridWeek', this);
  };

  document.getElementById('month').onclick = function () {
    changeView('dayGridMonth', this);
  };

  document.getElementById('year').onclick = function () {
    changeView('dayGridYear', this);
  };

});



/**
 * Actualiza el título según la vista actual
 * Mes / semana / día/ Año
 */
function updateCurrentDate(calendar) {
  const date = calendar.getDate();
  const viewType = calendar.view.type;
  let text = '';

  if (viewType === 'dayGridYear') {
    // Vista año solo el año
    text = date.getFullYear();
  } else {
    // Otras vistas  mes + año
    const options = { month: 'long', year: 'numeric' };
    text = date.toLocaleDateString('es-ES', options);
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  document.getElementById('currentDate').textContent = text;
}