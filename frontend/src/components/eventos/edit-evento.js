/**
 * @file edit-evento.js
 * @description Versión de SIMULACIÓN LIMPIA.
 * Este script importa datos de prueba desde 'datos_tabla.js' y simula el envío.
 */

// --- PASO 1: IMPORTACIONES ---
// Comentamos las importaciones reales de la API
/*
import { 
    get_reservacion_por_id, 
    actualizar_reservacion 
} from '../../api/api_reservacion.js';
*/

// ¡Importamos los datos de prueba constantes!
// CORRECCIÓN: La ruta es './' porque está en la misma carpeta.
import { EVENTO_PRUEBA } from './datos_tabla.js';


document.addEventListener('DOMContentLoaded', () => {

    // --- PASO 2: SELECCIÓN DE ELEMENTOS DEL DOM ---
    const eventForm = document.getElementById('event-form');
    const messageEl = document.getElementById('form-message');
    const DIM_ServiceOwnersId = 'f07e69a4-4e80-527e';
    const DIM_PeopleId = 'ce037ec9-32c2-58f1';
    
    // (Selección de todos los campos... sin cambios)
    const nombreEl = document.getElementById('nombre');
    const segundoNombreEl = document.getElementById('segundo_nombre');
    const apellidoPaternoEl = document.getElementById('apellido_paterno');
    const apellidoMaternoEl = document.getElementById('apellido_materno');
    const telefonoEl = document.getElementById('telefono');
    const telefonoSecundarioEl = document.getElementById('telefono_secundario');
    const fechaEl = document.getElementById('fecha');
    const localidadEl = document.getElementById('localidad');
    const municipioEl = document.getElementById('municipio');
    const estadoEl = document.getElementById('estado');
    const direccionEl = document.getElementById('direccion');
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

    // --- PASO 3: LÓGICA DE CARGA DE DATOS (SIMULADA) ---
    
    async function cargarDatosDelEvento() {
        const urlParams = new URLSearchParams(window.location.search);
        eventoId = urlParams.get('id'); // Leemos el ID (no lo usamos, pero es bueno tenerlo)

        try {
            showFormMessage('Cargando datos de prueba...', 'info');
            
            // === INICIO DE LA SIMULACIÓN ===
            // 1. Comentamos la llamada real
            // const evento = await get_reservacion_por_id(eventoId); 
            
            // 2. Usamos la constante importada
            const evento = EVENTO_PRUEBA;
            // === FIN DE LA SIMULACIÓN ===

            if (evento) {
                poblarFormulario(evento);
                showFormMessage('', 'info'); // Limpia el mensaje
            } else {
                showFormMessage('Error: No se encontró el evento de prueba.', 'error');
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            showFormMessage(`Error al cargar datos: ${error.message}`, 'error');
        }
    }

    /**
     * Rellena todos los campos del formulario con los datos de un objeto de evento.
     */
    function poblarFormulario(evento) {
        // (Esta función no cambia)
        nombreEl.value = evento.DIM_Name || '';
        segundoNombreEl.value = evento.DIM_SecondName || '';
        apellidoPaternoEl.value = evento.DIM_LastName || '';
        apellidoMaternoEl.value = evento.DIM_SecondLastName || '';
        telefonoEl.value = evento.DIM_PhoneNumber || '';
        telefonoSecundarioEl.value = evento.DIM_SecondPhoneNumber || ''; // <-- El campo que faltaba
        direccionEl.value = evento.DIM_Address || '';
        localidadEl.value = evento.DIM_EventAddress || '';
        municipioEl.value = evento.DIM_EventMunicipality || '';
        estadoEl.value = evento.DIM_EventState || '';
        montoEl.value = evento.DIM_TotalAmount || '';
        descripcionEl.value = evento.DIM_Notes || '';

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
        
        // Recolecta los datos actualizados del formulario
        const datosActualizados = {
            // (Tu lógica de enviar solo los campos editables)
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

        // === INICIO DE LA SIMULACIÓN ===
        // Imprimimos en consola lo que se "enviaría"
        console.log("SIMULACIÓN: Datos que se enviarían a la API:", datosActualizados);

        // 1. Comentamos el bloque try...catch...finally real
        /*
        try {
            const respuesta = await actualizar_reservacion(eventoId, datosActualizados); 

            if (respuesta.success) {
                showFormMessage('¡Evento actualizado con éxito!', 'success');
                setTimeout(() => {
                    window.parent.postMessage('eventoRegistrado', '*');
                }, 1500);
            } else {
                showFormMessage(`Error: ${respuesta.message || 'Error desconocido'}`, 'error');
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            showFormMessage(`Error al conectar con el servidor: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
        }
        */

        // 2. Simulamos una respuesta exitosa
        setTimeout(() => {
            showFormMessage('¡Simulación Exitosa! Revisa la consola (F12).', 'success');
            submitButton.disabled = false;
        }, 1000);
        // === FIN DE LA SIMULACIÓN ===
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

            if (diffMinutos < 0) { 
                diffMinutos += 24 * 60;
a         }

            const horas = Math.floor(diffMinutos / 60);
            const minutos = diffMinutos % 60;

            const hh = String(horas).padStart(2, '0');
            const mm = String(minutos).padStart(2, '0');

            totalHorasEl.value = `${hh}:${mm}`;
        } else {
            totalHorasEl.value = "00:00";
        }
    }

    function calcularNHours() {
        const [horas, minutos] = totalHorasEl.value.split(':').map(Number);
        return horas + (minutos / 60);
    }

    // --- PASO 6: INICIALIZACIÓN Y ASIGNACIÓN DE EVENTOS ---
    
    horaInicioEl.addEventListener('change', calcularTotalHoras);
    horaFinalEl.addEventListener('change', calcularTotalHoras);
    eventForm.addEventListener('submit', handleSubmit);
     
    // Carga los datos (simulados) del evento
    cargarDatosDelEvento();

});