import { updateReservation } from '../../api/api_reservacion_update.js';
import { GetContractInfo } from '../../api/api_reservacion_read.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('event-form');
    const horaInicioInput = document.getElementById('hora_inicio');
    const horaFinalInput = document.getElementById('hora_final');
    
    // 1. OBTENER ID DE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        console.error("ID no encontrado en la URL");
        alert("Error crítico: No hay ID de evento para editar.");
        return;
    }

    // 2. CARGAR DATOS
    await cargarDatosEnFormulario(eventId);

    // 3. ARREGLO DEL MODAL (STOP PROPAGATION)
    const stopAndCalculate = (e) => {
        e.stopPropagation(); 
        calcularTotalHoras();
    };

    // Listeners corregidos
    horaInicioInput.addEventListener('change', stopAndCalculate);
    horaInicioInput.addEventListener('click', (e) => e.stopPropagation()); 

    horaFinalInput.addEventListener('change', stopAndCalculate);
    horaFinalInput.addEventListener('click', (e) => e.stopPropagation());

    // 4. ENVIAR CAMBIOS (UPDATE)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation(); 

        // --- PREPARACIÓN DE DATOS ---
        const nombreInput = document.getElementById('nombre').value.trim();
        const partesNombre = nombreInput.split(/\s+/);
        const primerNombre = partesNombre[0] || "";
        const segundoNombre = partesNombre.slice(1).join(" ") || ""; 

        const paterno = document.getElementById('apellido_paterno').value;
        const materno = document.getElementById('apellido_materno').value;

        const fecha = document.getElementById('fecha').value; 
        const horaInicio = document.getElementById('hora_inicio').value; 
        const horaFin = document.getElementById('hora_final').value;
        const totalHoras = document.getElementById('total_horas').value.split(':')[0];

        // --- OBJETO SQL ---
        const datosParaEnviar = {
            DIM_ReservationId: eventId,
            
            DIM_Name: primerNombre,
            DIM_SecondName: segundoNombre,
            DIM_LastName: paterno,
            DIM_SecondLastName: materno,
            DIM_PhoneNumber: document.getElementById('telefono').value,
            DIM_SecondPhoneNumber: document.getElementById('telefono_secundario').value,

            DIM_StartDate: `${fecha} ${horaInicio}:00`,
            DIM_EndDate: `${fecha} ${horaFin}:00`,
            
             // --- CORRECCIÓN: Leer de los inputs correctos ---
            DIM_EventAddress: document.getElementById('direccion').value, // Lee del input Dirección
            DIM_Notes: document.getElementById('descripcion').value,      // Lee del textarea Descripción
            
            DIM_TotalAmount: document.getElementById('dim_totalamount').value,
            DIM_NHours: parseInt(totalHoras) || 0
        };
        // En edit-evento.js, dentro del form.addEventListener('submit'...)
        try {
            console.log("Enviando actualización...", datosParaEnviar);
            await updateReservation(datosParaEnviar);
            
            alert("¡Evento actualizado correctamente!");
            
            // --- CAMBIO AQUÍ ---
            // Verificamos si el padre tiene la función puente
            if (window.parent && window.parent.finalizarEdicionExitoso) {
                window.parent.finalizarEdicionExitoso();
            } else {
                // Fallback por si se abrió en pestaña nueva
                window.history.back();
            }
            
        } catch (error) {
            // ... error handling
        }
    });
});

// --- FUNCIONES AUXILIARES ---

async function cargarDatosEnFormulario(id) {
    try {
        const respuesta = await GetContractInfo(id);
        const datos = Array.isArray(respuesta) ? respuesta[0] : respuesta;

        if (!datos) {
            alert("No se encontraron datos para este evento.");
            return;
        }

        // NOMBRES
        if (datos.DIM_Name) {
             document.getElementById('nombre').value = (datos.DIM_Name + " " + (datos.DIM_SecondName || "")).trim();
             document.getElementById('apellido_paterno').value = datos.DIM_LastName || "";
             document.getElementById('apellido_materno').value = datos.DIM_SecondLastName || "";
        } else {
            const nombreCompleto = datos.contratante_nombre || datos.nombre || '';
            if (nombreCompleto) {
                const partes = nombreCompleto.trim().split(/\s+/); 
                if (partes.length > 0) document.getElementById('nombre').value = partes[0];
                if (partes.length > 1) document.getElementById('apellido_paterno').value = partes[1];
                if (partes.length > 2) document.getElementById('apellido_materno').value = partes.slice(2).join(' '); 
            }
        }

        document.getElementById('telefono').value = datos.DIM_PhoneNumber || datos.contratante_telefono || "";
        document.getElementById('telefono_secundario').value = datos.DIM_SecondPhoneNumber || datos.contratante_segundo_telefono || "";

        // FECHA
        let fechaParaInput = "";
        if (datos.DIM_StartDate) {
            const separador = datos.DIM_StartDate.includes('T') ? 'T' : ' ';
            fechaParaInput = datos.DIM_StartDate.split(separador)[0];
        } 
        else if (datos.DIM_DateId) {
            const fechaStr = String(datos.DIM_DateId);
            if (fechaStr.length === 8) {
                const y = fechaStr.substring(0, 4);
                const m = fechaStr.substring(4, 6);
                const d = fechaStr.substring(6, 8);
                fechaParaInput = `${y}-${m}-${d}`;
            }
        }
        else if (datos.evento_anio && datos.evento_mes && datos.evento_dia) {
            fechaParaInput = `${datos.evento_anio}-${String(datos.evento_mes).padStart(2,'0')}-${String(datos.evento_dia).padStart(2,'0')}`;
        }
        document.getElementById('fecha').value = fechaParaInput;

        // HORAS
        let horaInicioStr = datos.DIM_StartDate || datos.evento_hora_inicio || "";
        let horaFinStr = datos.DIM_EndDate || datos.evento_hora_fin || "";

        document.getElementById('hora_inicio').value = extraerHora(horaInicioStr);
        document.getElementById('hora_final').value = extraerHora(horaFinStr);

        // OTROS
        // --- CORRECCIÓN: Asignar cada cosa a su input correspondiente ---
        // 1. Dirección al input nuevo
        document.getElementById('direccion').value = datos.DIM_EventAddress || datos.evento_lugar || "";

        // 2. Descripción (Notas) al textarea de descripción
        document.getElementById('descripcion').value = datos.DIM_Notes || "";
        document.getElementById('dim_totalamount').value = datos.DIM_TotalAmount || datos.pago_total || 0;

        calcularTotalHoras();

    } catch (error) {
        console.error("Error cargando:", error);
    }
}

function extraerHora(valor) {
    if (!valor) return '';
    if (valor.includes(' ')) return valor.split(' ')[1].substring(0, 5);
    if (valor.includes('T')) return valor.split('T')[1].substring(0, 5);
    if (valor.includes(':')) return valor.substring(0, 5);
    return valor;
}

function calcularTotalHoras() {
    const inicio = document.getElementById('hora_inicio').value;
    const fin = document.getElementById('hora_final').value;

    if (inicio && fin) {
        const dateInicio = new Date(`2000-01-01T${inicio}:00`);
        const dateFin = new Date(`2000-01-01T${fin}:00`);
        let diff = dateFin - dateInicio;
        if (diff < 0) diff += 24 * 60 * 60 * 1000;

        const horas = Math.floor(diff / 1000 / 60 / 60);
        const minutos = Math.floor((diff / 1000 / 60) % 60);

        document.getElementById('total_horas').value = 
            `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }
}