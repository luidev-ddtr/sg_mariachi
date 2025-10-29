import './styles/form.css'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Página Principal - Menú de Navegación</h1>
    <nav>
      <ul>
        <li><a href="/pages/login.html">Login</a></li>
        <li><a href="/pages/control_panel.html">Panel de Control</a></li>
        <li><a href="/pages/registro-evento.html">Registro de Evento</a></li>
        <li><a href="/pages/agenda.html">Agenda</a></li>
        <li><a href="/pages/generate_reports.html">Generar Reportes</a></li>
      </ul>
    </nav>
  </div>
`
