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
        // --- NUEVO MODAL DE ERROR ---
        await mostrarModalCustom("Error crítico", "No hay ID de evento para editar.", "error");
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

    // VALIDACIÓN ESTRICTA (Solo Números)
    const inputsTelefonos = [
        document.getElementById('telefono'),
        document.getElementById('telefono_secundario')
    ];

    inputsTelefonos.forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                const valorOriginal = this.value;
                let valorLimpio = valorOriginal.replace(/[^0-9]/g, '');

                if (valorLimpio.length > 10) {
                    valorLimpio = valorLimpio.slice(0, 10);
                }

                if (valorOriginal !== valorLimpio) {
                    this.value = valorLimpio;
                }
            });
            
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const textoPegado = (e.clipboardData || window.clipboardData).getData('text');
                const textoLimpio = textoPegado.replace(/[^0-9]/g, '').slice(0, 10);
                document.execCommand('insertText', false, textoLimpio);
            });
        }
    });

    // =======================================================
    // NUEVO: Validación para el MONTO (evitar negativos)
    // =======================================================
    const inputMonto = document.getElementById('dim_totalamount');
    if (inputMonto) {
        inputMonto.addEventListener('input', function() {
            if (this.value < 0) this.value = '';
        });
    }

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
            
            DIM_EventAddress: document.getElementById('direccion').value, 
            DIM_Notes: document.getElementById('descripcion').value,      
            
            DIM_TotalAmount: document.getElementById('dim_totalamount').value,
            DIM_NHours: parseInt(totalHoras) || 0
        };

        try {
            console.log("Enviando actualización...", datosParaEnviar);
            await updateReservation(datosParaEnviar);
            
            // --- NUEVO MODAL DE ÉXITO (Espera a que el usuario de clic) ---
            await mostrarModalCustom("¡Éxito!", "¡Evento actualizado correctamente!", "success");
            
            if (window.parent && window.parent.finalizarEdicionExitoso) {
                window.parent.finalizarEdicionExitoso();
            } else {
                window.history.back();
            }
            
        } catch (error) {
            console.error(error);
            await mostrarModalCustom("Error", "Hubo un problema al actualizar el evento.", "error");
        }
    });
});

// --- FUNCIONES AUXILIARES ---

async function cargarDatosEnFormulario(id) {
    try {
        const respuesta = await GetContractInfo(id);
        const datos = Array.isArray(respuesta) ? respuesta[0] : respuesta;

        if (!datos) {
            // --- NUEVO MODAL DE ADVERTENCIA ---
            await mostrarModalCustom("Atención", "No se encontraron datos para este evento.", "warning");
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
        document.getElementById('direccion').value = datos.DIM_EventAddress || datos.evento_lugar || "";
        document.getElementById('descripcion').value = datos.servicio_notas || "";
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

// =======================================================
// NUEVO: Sistema de Notificaciones basado en tu diseño
// =======================================================
function mostrarModalCustom(titulo, mensaje, tipo = 'info') {
    return new Promise((resolve) => {
        // Colores según el tipo (Éxito verde, Error rojo, etc)
        let colorBoton = "#0d6efd"; // azul por defecto
        if (tipo === 'success') colorBoton = "#198754"; // verde
        if (tipo === 'error') colorBoton = "#dc3545"; // rojo
        if (tipo === 'warning') colorBoton = "#fd7e14"; // naranja

        // Crear contenedor del fondo oscuro (Overlay)
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
        `;

        // Crear la caja del modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 8px; width: 400px; max-width: 90%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
            transform: translateY(-20px); transition: transform 0.3s ease;
        `;

        // Estructura HTML del modal
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: bold;">${titulo}</h3>
                <button id="btn-cerrar-x" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888;">&times;</button>
            </div>
            <div style="padding: 25px 20px; text-align: center; color: #555; font-size: 1rem;">
                ${mensaje}
            </div>
            <div style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                <button id="btn-aceptar" style="background: ${colorBoton}; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Aceptar</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animación de entrada
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);

        // Función para cerrar y resolver la promesa
        const cerrarModal = (resultado) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(resultado);
            }, 300); // Esperar a que termine la animación
        };

        // Eventos de los botones
        modal.querySelector('#btn-cerrar-x').onclick = () => cerrarModal(false);
        modal.querySelector('#btn-aceptar').onclick = () => cerrarModal(true);
    });
}