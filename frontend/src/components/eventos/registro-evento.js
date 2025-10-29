/*
 * Este archivo (registro-evento.js) maneja la lógica
 * del formulario en 'registro-evento.html'.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Seleccionamos los elementos del formulario
  const eventForm = document.getElementById('event-form');
  const messageEl = document.getElementById('form-message');
  
  // Elementos de Fecha y Hora
  const fechaInput = document.getElementById('fecha');
  const horaInicioEl = document.getElementById('hora_inicio');
  const horaFinalEl = document.getElementById('hora_final');
  const totalHorasEl = document.getElementById('total_horas_display'); // Renombrado

  if (!eventForm) {
    return;
  }
  
  // 2. Lógica de inicialización del formulario
  
  // Asigna la fecha mínima al input de fecha
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
    event.preventDefault(); // Evitamos que la página se recargue
    messageEl.textContent = '';
    messageEl.className = '';

    // --- OBTENER VALORES ---
    // Leemos todos los valores de los inputs
    
    // Cliente
    const dim_name = document.getElementById('dim_name').value.trim();
    const dim_secondname = document.getElementById('dim_secondname').value.trim();
    const dim_lastname = document.getElementById('dim_lastname').value.trim();
    const dim_secondlastname = document.getElementById('dim_secondlastname').value.trim();
    const dim_phonenumber = document.getElementById('dim_phonenumber').value.trim();
    const dim_secondphonenumber = document.getElementById('dim_secondphonenumber').value.trim();
    const dim_address = document.getElementById('dim_address').value.trim();

    // Evento
    const fecha = fechaInput.value;
    const horaInicio = horaInicioEl.value;
    const horaFinal = horaFinalEl.value;
    const totalHorasString = totalHorasEl.value; // ej. "05:00"
    const dim_totalamount_raw = document.getElementById('dim_totalamount').value;
    const dim_eventaddress = document.getElementById('dim_eventaddress').value.trim();
    const dim_notes = document.getElementById('dim_notes').value.trim();

    // --- VALIDACIÓN BÁSICA ---
    if (!dim_name || !dim_lastname || !dim_phonenumber || !dim_address || !fecha || !horaInicio || !horaFinal || !dim_totalamount_raw || !dim_eventaddress) {
      showFormMessage('Por favor, completa todos los campos obligatorios.', 'error');
      return; 
    }

    // --- TRANSFORMACIÓN DE DATOS ---
    // Convertimos los datos al formato exacto del JSON
    
    // 1. Convertir "HH:MM" a número decimal para DIM_NHours
    const [horas, minutos] = totalHorasString.split(':').map(Number);
    const dim_nhours = horas + (minutos / 60);

    // 2. Convertir monto a número (float)
    const dim_totalamount = parseFloat(dim_totalamount_raw);

    // 3. Crear fechas en formato YYYY-MM-DD HH:MM:SS
    const dim_startdate = `${fecha} ${horaInicio}:00`;
    const dim_enddate = `${fecha} ${horaFinal}:00`;

    // --- CREAR EL "DICCIONARIO" ---
    const formData = {
      DIM_EventAddress: dim_eventaddress,
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
      DIM_Address: dim_address
    };

    // CUMPLE CON LOS REQUISITOS
    // 1. Imprimimos el "diccionario" en la consola
    console.log("Diccionario del formulario (Formato JSON):");
    console.log(formData);
    
    // 2. Mostramos un mensaje de éxito en el formulario
    showFormMessage('¡Datos impresos en la consola! Revisa con F12.', 'success');
    
    // 3. Limpiamos el formulario
    eventForm.reset(); 
    totalHorasEl.value = "00:00"; 
  }
  
  /**
   * 5. Función para mostrar mensajes en el formulario
   */
  function showFormMessage(message, type) {
    messageEl.textContent = message;
    messageEl.className = type; // 'success' o 'error'
  }
  
  /**
   * 6. Función para calcular el total de horas (Sin cambios)
   */
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
      }

      const horas = Math.floor(diffMinutos / 60);
      const minutos = diffMinutos % 60;

      const hh = String(horas).padStart(2, '0');
      const mm = String(minutos).padStart(2, '0');

      totalHorasEl.value = `${hh}:${mm}`;
      
    } else {
      totalHorasEl.value = "00:00";
    }
  }

});