/**
 * @file edit-evento.js
 * @description ¡Versión CONECTADA A LA API REAL!
 * Carga datos desde GetReservacionPorId y descompone el 'fullname'.
 * Utiliza updateReservation para guardar cambios.
 * (Versión sin campos de localidad)
 */

// --- PASO 1: IMPORTACIONES (ACTUALIZADO) ---
import { 
    GetReservacionPorId
} from '../../api/api_reservacion_read.js'; // (Ajusta esta ruta)

// ¡NUEVO! Importamos la función de actualización
import { 
    updateReservation 
} from '../../api/api_reservacion_update.js'; // (Ajusta esta ruta si es necesario)


// --- ¡NUEVA FUNCIÓN! ---
function descomponerNombre(fullname) {
    // ... (Esta función auxiliar se mantiene igual que la tuya)
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
    // (Esta sección se mantiene igual que la tuya)
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
    const horaInicioEl = document.getElementById('hora_inicio');
    const horaFinalEl = document.getElementById('hora_final');
    const descripcionEl = document.getElementById('descripcion');
    const totalHorasEl = document.getElementById('total_horas');
    const montoEl = document.getElementById('dim_totalamount');
    
    // Esta variable guardará el ID de la URL
    let eventoId = null;

    if (!eventForm) {
        console.error("Formulario no encontrado");
        return;
    }

    // --- PASO 3: LÓGICA DE CARGA DE DATOS ---
    // (Esta sección se mantiene igual que la tuya)
    
    async function cargarDatosDelEvento() {
        const urlParams = new URLSearchParams(window.location.search);
        eventoId = urlParams.get('id'); // Asignamos el ID a la variable global

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
     * (Esta función se mantiene igual que la tuya)
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
        
        // --- Tarea 2: Manejar Localidad (Mostrar Mensaje) ---
        const contenedorTelefono = telefonoSecundarioEl.closest('.form-group');
        if (contenedorTelefono && !document.getElementById('localidad-warning')) {
            const warningMsg = document.createElement('p');
            warningMsg.id = 'localidad-warning';
            warningMsg.textContent = 'La localidad del evento no se puede modificar.';
            warningMsg.style.color = '#777';
            warningMsg.style.fontSize = '0.9em';
            warningMsg.style.marginTop = '5px';
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

    // --- PASO 4: LÓGICA DE ACTUALIZACIÓN (¡CONECTADA!) ---
    /**
     * ¡FUNCIÓN ACTUALIZADA!
     * Llama a la API 'updateReservation' en lugar de simular.
     */
    async function handleSubmit(event) {
        event.preventDefault(); 
        
        // ¡IMPORTANTE! 
        // Añadimos el 'eventoId' (que obtuvimos de la URL) al objeto
        // que enviaremos a la API. Tu backend lo necesitará.
        // Asegúrate de que el backend espera el ID como "id".
        const datosActualizados = {
            DIM_ReservationId: eventoId, // <-- ¡NOMBRE CORREGIDO!
            DIM_StartDate: `${fechaEl.value} ${horaInicioEl.value}:00`,
            DIM_EndDate: `${fechaEl.value} ${horaFinalEl.value}:00`,
            DIM_NHours: calcularNHours(),
            DIM_TotalAmount: parseFloat(montoEl.value) || 0,
            DIM_Notes: descripcionEl.value.trim(),
            DIM_SecondPhoneNumber: telefonoSecundarioEl.value.trim()
            // DIM_ServiceOwnersId -> ELIMINADO
            // DIM_PeopleId -> ELIMINADO
        };

        const submitButton = eventForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        showFormMessage('Actualizando evento...', 'info');

        try {
            // ¡Llamada real a la API!
            console.log ("datos actualizados",datosActualizados);
            const resultado = await updateReservation(datosActualizados);
            
            console.log("Respuesta del servidor (updateReservation):", resultado);
            showFormMessage('¡Evento actualizado exitosamente!', 'success');
            
            // Opcional: puedes redirigir al usuario después de un éxito
            // setTimeout(() => {
            //     window.location.href = 'pagina_anterior.html'; // Redirigir
            // }, 1500);

        } catch (error) {
            // El error.message vendrá formateado desde tu archivo de API
            console.error('Error al actualizar el evento:', error);
            showFormMessage(`Error al actualizar: ${error.message}`, 'error');
        
        } finally {
            // Esto se ejecuta siempre, ya sea éxito o error,
            // para reactivar el botón.
            submitButton.disabled = false;
        }
    }

    // --- PASO 5: FUNCIONES AUXILIARES (Sin cambios) ---
    // (Esta sección se mantiene igual que la tuya)
    
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
    // (Esta sección se mantiene igual que la tuya)
    horaInicioEl.addEventListener('change', calcularTotalHoras);
    horaFinalEl.addEventListener('change', calcularTotalHoras);
    eventForm.addEventListener('submit', handleSubmit);
    
    cargarDatosDelEvento();

});