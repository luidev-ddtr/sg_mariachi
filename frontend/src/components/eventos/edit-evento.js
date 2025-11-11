/**
 * @file edit-evento.js
 * @description ¡Versión CONECTADA A LA API REAL!
 * Carga datos desde GetReservacionPorId y descompone el 'fullname'.
 * (Versión sin campos de localidad)
 */

// --- PASO 1: IMPORTACIONES ---
import { 
  GetReservacionPorId
} from '../../api/api_reservacion_read.js'; // (Ajusta esta ruta)

// --- ¡NUEVA FUNCIÓN! ---
function descomponerNombre(fullname) {
  const nombreLimpio = (fullname || '').replace(/_\d+/, '').trim();
  const partes = nombreLimpio.split(' ');
  let nombre = "", segundoNombre = "", apellidoP = "", apellidoM = "";

  if (partes.length === 4) {
    nombre = partes[0];
    segundoNombre = partes[1];
    apellidoP = partes[2];
    apellidoM = partes[3];
  } else if (partes.length === 3) {
    nombre = partes[0];
    segundoNombre = ""; 
    apellidoP = partes[1];
    apellidoM = partes[2];
  } else if (partes.length === 2) {
    nombre = partes[0];
    segundoNombre = "";
    apellidoP = partes[1];
    apellidoM = "";
  } else {
    nombre = partes[0] || '';
  }
  return { nombre, segundoNombre, apellidoP, apellidoM };
}


document.addEventListener('DOMContentLoaded', () => {

    // --- PASO 2: SELECCIÓN DE ELEMENTOS DEL DOM ---
    // ¡HEMOS BORRADO LOS CAMPOS DE DIRECCIÓN DE AQUÍ!
    const eventForm = document.getElementById('event-form');
    const messageEl = document.getElementById('form-message');
    const DIM_ServiceOwnersId = 'f07e69a4-4e80-527e';
    const DIM_PeopleId = 'ce037ec9-32c2-58f1';
    
    const nombreEl = document.getElementById('nombre');
    const segundoNombreEl = document.getElementById('segundo_nombre');
    const apellidoPaternoEl = document.getElementById('apellido_paterno');
    const apellidoMaternoEl = document.getElementById('apellido_materno');
    const telefonoEl = document.getElementById('telefono');
    const telefonoSecundarioEl = document.getElementById('telefono_secundario');
    const fechaEl = document.getElementById('fecha');
    // const localidadEl = ... (ELIMINADO)
    // const municipioEl = ... (ELIMINADO)
    // const estadoEl = ... (ELIMINADO)
    // const direccionEl = ... (ELIMINADO)
    const horaInicioEl = document.getElementById('hora_inicio');
    const horaFinalEl = document.getElementById('hora_final');
    const descripcionEl = document.getElementById('descripcion');
    const totalHorasEl = document.getElementById('total_horas');
    const montoEl = document.getElementById('dim_totalamount');
    
    let eventoId = null;

    if (!eventForm) {
        console.error("Formulario no encontrado");
        return;
    }

    // --- PASO 3: LÓGICA DE CARGA DE DATOS ---
    
    async function cargarDatosDelEvento() {
        const urlParams = new URLSearchParams(window.location.search);
        eventoId = urlParams.get('id');

        if (!eventoId) {
            showFormMessage('Error: No se proporcionó un ID de evento.', 'error');
            return;
        }

        try {
            showFormMessage('Cargando datos del evento...', 'info');
            const evento = await GetReservacionPorId(eventoId); 

            if (evento) {
                poblarFormulario(evento);
                showFormMessage('Datos cargados.', 'success');
            } else {
                showFormMessage(`Error: No se encontró el evento con ID: ${eventoId}.`, 'error');
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            showFormMessage(`Error al cargar datos: ${error.message}`, 'error');
        }
    }

    /**
     * Rellena todos los campos del formulario.
     * ¡ESTA FUNCIÓN ESTÁ ACTUALIZADA!
     */
    function poblarFormulario(evento) {
        
        // --- Tarea 1: Descomponer el nombre ---
        const { nombre, segundoNombre, apellidoP, apellidoM } = descomponerNombre(evento.DIM_fullname);

        nombreEl.value = nombre;
        segundoNombreEl.value = segundoNombre;
        apellidoPaternoEl.value = apellidoP;
        apellidoMaternoEl.value = apellidoM;

        // --- Poblar campos que sí vienen ---
        telefonoEl.value = evento.DIM_PhoneNumber || '';
        montoEl.value = evento.DIM_TotalAmount || '';
        descripcionEl.value = evento.DIM_Notes || '';
        telefonoSecundarioEl.value = ''; // Este campo no viene en la API
        // 'direccionEl.value = ...' (ELIMINADO)

        // --- Tarea 2: Manejar Localidad (Mostrar Mensaje) ---
        // "y que se muestre un mensaje asi como, no se puede modificar la localidad..."
        // Insertamos el mensaje después del campo "teléfono secundario"
        const contenedorTelefono = telefonoSecundarioEl.closest('.form-group');
        if (contenedorTelefono && !document.getElementById('localidad-warning')) {
            const warningMsg = document.createElement('p');
            warningMsg.id = 'localidad-warning';
            warningMsg.textContent = 'La localidad del evento no se puede modificar.';
            warningMsg.style.color = '#777';
            warningMsg.style.fontSize = '0.9em';
            warningMsg.style.marginTop = '5px';
            // Insertamos el mensaje después del contenedor del teléfono
            contenedorTelefono.parentNode.insertBefore(warningMsg, contenedorTelefono.nextSibling);
        }

        // --- Formateo de Fechas y Horas ---
        try {
            const fechaInicio = new Date(evento.DIM_StartDate);
            fechaEl.value = fechaInicio.toISOString().split('T')[0]; 
            horaInicioEl.value = fechaInicio.toTimeString().split(' ')[0].substring(0, 5); 
            
            const fechaFin = new Date(evento.DIM_EndDate);
            horaFinalEl.value = fechaFin.toTimeString().split(' ')[0].substring(0, 5);
        } catch (e) {
            console.error("Error al formatear fechas", e);
            showFormMessage("Error al interpretar fechas del evento.", "error");
        }
        
        calcularTotalHoras();
    }

    // --- PASO 4: LÓGICA DE ACTUALIZACIÓN (SIMULADA) ---
    async function handleSubmit(event) {
        event.preventDefault(); 
        
        // ¡ACTUALIZADO! Se quitan los campos de dirección
        const datosActualizados = {
            DIM_TotalAmount: parseFloat(montoEl.value) || 0,
            DIM_Notes: descripcionEl.value.trim(),
            DIM_SecondPhoneNumber: telefonoSecundarioEl.value.trim(),
            DIM_StartDate: `${fechaEl.value} ${horaInicioEl.value}:00`,
            DIM_EndDate: `${fechaEl.value} ${horaFinalEl.value}:00`,
            DIM_NHours: calcularNHours(),
            DIM_ServiceOwnersId: DIM_ServiceOwnersId,
            DIM_PeopleId: DIM_PeopleId
        };

        const submitButton = eventForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        showFormMessage('Actualizando evento...', 'info');

        console.log("SIMULACIÓN: Datos que se enviarían a la API:", datosActualizados);
        setTimeout(() => {
            showFormMessage('¡Simulación Exitosa! Revisa la consola (F12).', 'success');
            submitButton.disabled = false;
        }, 1000);
    }

    // --- PASO 5: FUNCIONES AUXILIARES (Sin cambios) ---
    
    function showFormMessage(message, type) {
        messageEl.textContent = message;
        messageEl.className = type;
    }

    function calcularTotalHoras() {
        const inicio = horaInicioEl.value;
        const final = horaFinalEl.value;
        if (inicio && final) {
            const [inicioH, inicioM] = inicio.split(':').map(Number);
            const totalMinInicio = (inicioH * 60) + inicioM;
            
            const [finalH, finalM] = final.split(':').map(Number);
            const totalMinFinal = (finalH * 60) + finalM;

            let diffMinutos = totalMinFinal - totalMinInicio;
            if (diffMinutos < 0) { diffMinutos += 24 * 60; }

            const horas = Math.floor(diffMinutos / 60);
            const minutos = diffMinutos % 60;
            totalHorasEl.value = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        } else {
            totalHorasEl.value = "00:00";
        }
    }

    function calcularNHours() {
        const [horas, minutos] = totalHorasEl.value.split(':').map(Number);
        return horas + (minutos / 60);
    }

    // --- PASO 6: INICIALIZACIÓN ---
    horaInicioEl.addEventListener('change', calcularTotalHoras);
    horaFinalEl.addEventListener('change', calcularTotalHoras);
    eventForm.addEventListener('submit', handleSubmit);
    
    cargarDatosDelEvento();

});