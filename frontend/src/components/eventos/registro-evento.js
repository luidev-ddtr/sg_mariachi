/*
 * Este archivo (registro-evento.js) maneja la lógica
 * del formulario en 'registro-evento.html'.
 */
// Asegúrate que esta ruta sea correcta
import { crear_reservacion } from '../../api/api_reservacion.js'; 

const DIM_ServiceOwnersId = 'f07e69a4-4e80-527e';

document.addEventListener('DOMContentLoaded', () => {

  // 1. Seleccionamos los elementos del formulario
  const eventForm = document.getElementById('event-form');
  // Ya no usaremos messageEl, pero lo dejamos por si acaso tenías estilos que dependían de él
  const messageEl = document.getElementById('form-message'); 
  
  const fechaInput = document.getElementById('fecha');
  const horaInicioEl = document.getElementById('hora_inicio');
  const horaFinalEl = document.getElementById('hora_final');
  const totalHorasEl = document.getElementById('total_horas'); 

  if (!eventForm) {
    return;
  }
  
  // 2. Lógica de inicialización
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
  
  // 3. Añadimos los 'listeners'
  eventForm.addEventListener('submit', handleSubmit);
  horaInicioEl.addEventListener('change', calcularTotalHoras);
  horaFinalEl.addEventListener('change', calcularTotalHoras);

  // VALIDACIÓN DE TELÉFONOS (Solo Números, Max 10)
  const inputsTelefonos = [
      document.getElementById('telefono'),
      document.getElementById('telefono_secundario')
  ];

  inputsTelefonos.forEach(input => {
      if (input) {
          input.addEventListener('input', function(e) {
              let valorLimpio = this.value.replace(/[^0-9]/g, '');
              
              if (valorLimpio.length > 10) {
                  valorLimpio = valorLimpio.slice(0, 10);
              }

              if (this.value !== valorLimpio) {
                  this.value = valorLimpio;
              }
          });
      }
  });

  // Validación para el MONTO (evitar negativos)
  const inputMonto = document.getElementById('dim_totalamount');
  if (inputMonto) {
      inputMonto.addEventListener('input', function() {
          if (this.value < 0) this.value = '';
      });
  }

  /**
   * 4. Función principal para manejar el envío del formulario
   */
  async function handleSubmit(event) {
    event.preventDefault(); 
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = '';
    }

    // --- OBTENER VALORES ---
    const dim_name = document.getElementById('nombre').value.trim();
    const dim_secondname = document.getElementById('segundo_nombre').value.trim();
    const dim_lastname = document.getElementById('apellido_paterno').value.trim();
    const dim_secondlastname = document.getElementById('apellido_materno').value.trim();
    const dim_phonenumber = document.getElementById('telefono').value.trim();
    const dim_address = document.getElementById('direccion').value.trim();
    const dim_secondphonenumber = document.getElementById('telefono_secundario').value.trim();
    const municipio = document.getElementById('municipio').value.trim();
    const estado = document.getElementById('estado').value.trim();

    // Evento
    const fecha = fechaInput.value;
    const horaInicio = horaInicioEl.value;
    const horaFinal = horaFinalEl.value;
    const totalHorasString = totalHorasEl.value;
    const dim_notes = document.getElementById('descripcion').value.trim();
    const montoInput = document.getElementById('dim_totalamount');
    const dim_totalamount_raw = montoInput ? montoInput.value : '0';

    // --- VALIDACIÓN BÁSICA ---
    if (!dim_name || !dim_lastname || !dim_phonenumber || !dim_address || !fecha || !horaInicio || !horaFinal || !dim_totalamount_raw) {
      // REEMPLAZO: Modal en lugar de texto
      await mostrarModalCustom("Campos incompletos", "Por favor, completa todos los campos obligatorios.", "warning");
      return; 
    }

    // Validar longitud exacta de 10 dígitos
    if (dim_phonenumber.length !== 10) {
        // REEMPLAZO: Modal en lugar de texto
        await mostrarModalCustom("Teléfono inválido", "El teléfono principal debe tener 10 dígitos exactos.", "warning");
        return;
    }

    // --- TRANSFORMACIÓN DE DATOS ---
    const [horas, minutos] = totalHorasString.split(':').map(Number);
    const dim_nhours = horas + (minutos / 60);
    const dim_totalamount = parseFloat(dim_totalamount_raw);
    const dim_startdate = `${fecha} ${horaInicio}:00`;
    const dim_enddate = `${fecha} ${horaFinal}:00`;

    // --- CREAR EL OBJETO PARA LA API ---
    const datosParaAPI = {
      DIM_EventAddress: `${dim_address}, ${municipio}, ${estado}`,
      DIM_StartDate: dim_startdate,
      DIM_EndDate: dim_enddate,
      DIM_NHours: dim_nhours, 
      DIM_TotalAmount: dim_totalamount, 
      DIM_Notes: dim_notes,
      DIM_Name: dim_name,
      DIM_SecondName: dim_secondname,
      DIM_LastName: dim_lastname,
      DIM_SecondLastName: dim_secondlastname,
      DIM_PhoneNumber: dim_phonenumber,
      DIM_SecondPhoneNumber: dim_secondphonenumber,
      DIM_Address: dim_address,
      DIM_ServiceOwnersId: DIM_ServiceOwnersId
    };

    console.log("Enviando a la API:", datosParaAPI);

    // --- ENVIAR A LA API ---
    const submitButton = eventForm.querySelector('button[type="submit"]');
    const textoOriginalBoton = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Guardando..."; // Damos feedback visual en el botón

    try {
        console.log("Entrando al try");
        const respuesta = await crear_reservacion(datosParaAPI);
        console.log("Respuesta de la API:", respuesta);

        if (respuesta.success) {
            // ✅ CASO DE ÉXITO: Modal verde bonito
            await mostrarModalCustom("¡Excelente!", "¡Reservación creada con éxito!", "success");
            eventForm.reset(); 
            totalHorasEl.value = "00:00";
            
            // AVISAR A LA PÁGINA PRINCIPAL PARA CERRAR EL MODAL
            window.parent.postMessage('eventoRegistrado', '*');

        } else {
            // ❌ CASO DE ERROR: Fechas ocupadas
            const errorMsg = (respuesta.message || '').toLowerCase();

            if (errorMsg.includes('ocupad') || errorMsg.includes('cruce') || errorMsg.includes('overlap') || errorMsg.includes('existe')) {
                await mostrarModalCustom("Fecha Ocupada", "Ya existe un evento agendado en este horario.", "error");
            } else {
                await mostrarModalCustom("Error al guardar", respuesta.message || "Ocurrió un error desconocido.", "error");
            }
        }
    } catch (error) {
        // ❌ ERROR DE CONEXIÓN O EXCEPCIÓN
        console.error("Error al enviar el formulario:", error);
        
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('ocupad') || errorMsg.includes('409')) {
             await mostrarModalCustom("Horario no disponible", "Por favor revisa la fecha y hora seleccionada.", "warning");
        } else {
             await mostrarModalCustom("Error de conexión", `Fallo al conectar con el servidor: ${error.message}`, "error");
        }
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = textoOriginalBoton;
    }
  }
  
  /**
   * 6. Función para calcular el total de horas
   */
  function calcularTotalHoras() {
    const inicio = horaInicioEl.value;
    const final = horaFinalEl.value;
 
    if (inicio && final) {
      const inicioH = parseInt(inicio.split(':')[0], 10);
      const finalH = parseInt(final.split(':')[0], 10);
 
      let diffHoras = finalH - inicioH;
 
      if (diffHoras < 0) {
        diffHoras += 24;
      }
 
      const hh = String(diffHoras).padStart(2, '0');
      totalHorasEl.value = `${hh}:00`;
      
    } else {
      totalHorasEl.value = "00:00";
    }
  }

    // Ejemplo de integración de GEOLOCALIZACIÓN con Google Maps (Requiere que maps.js esté incluido en el HTML)
    ['direccion', 'municipio', 'estado'].forEach(id => {
        document.getElementById(id)?.addEventListener('blur', () => {
            if (typeof window.buscarDireccion === 'function') {
                window.buscarDireccion();
            }
        });
    });

});

// =======================================================
// NUEVO: Sistema de Notificaciones (Soporta Confirmaciones)
// =======================================================
function mostrarModalCustom(titulo, mensaje, tipo = 'info', textoAceptar = 'Aceptar', mostrarCancelar = false) {
    return new Promise((resolve) => {
        let colorBoton = "#0d6efd"; // azul por defecto
        if (tipo === 'success') colorBoton = "#198754"; // verde
        if (tipo === 'error') colorBoton = "#dc3545"; // rojo
        if (tipo === 'warning') colorBoton = "#fd7e14"; // naranja

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 8px; width: 400px; max-width: 90%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
            transform: translateY(-20px); transition: transform 0.3s ease;
        `;

        const btnCancelarHTML = mostrarCancelar 
            ? `<button id="btn-cancelar" style="background: #e9ecef; color: #333; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Cancelar</button>` 
            : '';

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: bold;">${titulo}</h3>
                <button id="btn-cerrar-x" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888;">&times;</button>
            </div>
            <div style="padding: 25px 20px; text-align: center; color: #555; font-size: 1rem;">
                ${mensaje}
            </div>
            <div style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                ${btnCancelarHTML}
                <button id="btn-aceptar" style="background: ${colorBoton}; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">${textoAceptar}</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);

        const cerrarModal = (resultado) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(resultado);
            }, 300);
        };

        modal.querySelector('#btn-cerrar-x').onclick = () => cerrarModal(false);
        modal.querySelector('#btn-aceptar').onclick = () => cerrarModal(true);
        if (mostrarCancelar) {
            modal.querySelector('#btn-cancelar').onclick = () => cerrarModal(false);
        }
    });
}