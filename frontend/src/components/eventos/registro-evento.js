/*
 * Este archivo (registro-evento.js) maneja la lógica
 * del formulario en 'registro-evento.html'.
 */
// Asegúrate que esta ruta sea correcta
import { crear_reservacion } from '../../api/api_reservacion.js'; 

document.addEventListener('DOMContentLoaded', () => {

  // 1. Seleccionamos los elementos del formulario
  const eventForm = document.getElementById('event-form');
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


  /**
   * 4. Función principal para manejar el envío del formulario
   */
  async function handleSubmit(event) {
    event.preventDefault(); 
    messageEl.textContent = '';
    messageEl.className = '';

    // --- OBTENER VALORES (SECCIÓN MODIFICADA) ---
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
    // Modificado para incluir apellido_paterno
    if (!dim_name || !dim_lastname || !dim_phonenumber || !dim_address || !fecha || !horaInicio || !horaFinal) {
      showFormMessage('Por favor, completa todos los campos obligatorios.', 'error');
      return; 
    }

    // --- TRANSFORMACIÓN DE DATOS ---
    const [horas, minutos] = totalHorasString.split(':').map(Number);
    const dim_nhours = horas + (minutos / 60);
    const dim_totalamount = parseFloat(dim_totalamount_raw);
    const dim_startdate = `${fecha} ${horaInicio}:00`;
    const dim_enddate = `${fecha} ${horaFinal}:00`;

    // --- CREAR EL "DICCIONARIO" (SECCIÓN MODIFICADA) ---
    const datosParaAPI = {
      DIM_EventAddress: `${dim_address}, ${municipio}, ${estado}`, // Combinamos dirección, municipio y estado
      DIM_StartDate: dim_startdate,
      DIM_EndDate: dim_enddate,
      DIM_NHours: dim_nhours, 
      DIM_TotalAmount: dim_totalamount, 
      DIM_Notes: dim_notes,
      DIM_Name: dim_name,
      DIM_SecondName: dim_secondname, // <-- CAMPO ACTUALIZADO
      DIM_LastName: dim_lastname,
      DIM_SecondLastName: dim_secondlastname, // <-- CAMPO ACTUALIZADO
      DIM_PhoneNumber: dim_phonenumber,
      DIM_SecondPhoneNumber: dim_secondphonenumber, // Tu HTML aún no tiene teléfono secundario
      DIM_Address: dim_address // Mantenemos la dirección de calle por separado si la API lo requiere
    };

    console.log("Enviando a la API:", datosParaAPI);

    // --- ENVIAR A LA API ---
    const submitButton = eventForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showFormMessage('Guardando reservación...', 'info');

    try {
        console.log("Entrando al try");
        const respuesta = await crear_reservacion(datosParaAPI);
        console.log("Respuesta de la API:", respuesta);
        if (respuesta.success) {
            showFormMessage('¡Reservación creada con éxito!', 'success');
            eventForm.reset(); 
            totalHorasEl.value = "00:00";
            
            // AVISAR A LA PÁGINA PRINCIPAL PARA CERRAR EL MODAL
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
  }
  
  /**
   * 5. Función para mostrar mensajes en el formulario
   */
  function showFormMessage(message, type) {
    messageEl.textContent = message;
    messageEl.className = type; 
  }
  
  /**
   * 6. Función para calcular el total de horas
   */
  function calcularTotalHoras() {
    const inicio = horaInicioEl.value;
    const final = horaFinalEl.value;
 
    if (inicio && final) {
      // Extraemos solo la parte de la hora (ej: "14" de "14:00")
      const inicioH = parseInt(inicio.split(':')[0], 10);
      const finalH = parseInt(final.split(':')[0], 10);
 
      let diffHoras = finalH - inicioH;
 
      // Si la hora final es menor (ej: de 22:00 a 02:00), es un evento que cruza la medianoche
      if (diffHoras < 0) {
        diffHoras += 24;
      }
 
      const hh = String(diffHoras).padStart(2, '0');
      totalHorasEl.value = `${hh}:00`;
      
    } else {
      totalHorasEl.value = "00:00";
    }
  }

});