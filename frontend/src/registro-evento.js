/*
 * Este archivo (registro-evento.js) maneja únicamente
 * la lógica del formulario en 'registro-evento.html'.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Seleccionamos los elementos del formulario
  const eventForm = document.getElementById('event-form');
  const messageEl = document.getElementById('form-message');
  const fechaInput = document.getElementById('fecha');
  const horaInicioEl = document.getElementById('hora_inicio');
  const horaFinalEl = document.getElementById('hora_final');
  const totalHorasEl = document.getElementById('total_horas');

  // Si no encontramos el formulario en esta página, no hacemos nada.
  if (!eventForm) {
    return;
  }
  
  // 2. Lógica de inicialización del formulario
  
  // Asigna la fecha mínima al input de fecha (no se pueden seleccionar días pasados)
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0'); // +1 porque Enero es 0
  const dd = String(hoy.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
  
  // 3. Añadimos los 'listeners'
  
  // Listener principal para el envío (submit)
  eventForm.addEventListener('submit', handleSubmit);
  
  // Listeners para calcular el total de horas automáticamente
  horaInicioEl.addEventListener('change', calcularTotalHoras);
  horaFinalEl.addEventListener('change', calcularTotalHoras);


  /**
   * 4. Función principal para manejar el envío del formulario
   */
  async function handleSubmit(event) {
    event.preventDefault(); // Evitamos que la página se recargue

    // Limpia mensajes anteriores
    messageEl.textContent = '';
    messageEl.className = '';

    // --- VALIDACIÓN ---
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fecha = fechaInput.value;
    const horaInicio = horaInicioEl.value;
    const horaFinal = horaFinalEl.value;
    
    // Validación básica (campos vacíos)
    if (!nombre || !apellido || !telefono || !fecha || !horaInicio || !horaFinal) {
      showFormMessage('Por favor, completa todos los campos obligatorios.', 'error');
      return; 
    }

    // Validación específica (teléfono)
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
      showFormMessage('El teléfono debe tener 10 dígitos.', 'error');
      return; 
    }

    // --- PREPARACIÓN DE DATOS ---
    const formData = {
      nombre: nombre,
      apellido: apellido,
      telefono: telefono,
      fecha: fecha,
      localidad: document.getElementById('localidad').value.trim(),
      municipio: document.getElementById('municipio').value,
      estado: document.getElementById('estado').value,
      direccion: document.getElementById('direccion').value.trim(),
      hora_inicio: horaInicio,
      hora_final: horaFinal,
      descripcion: document.getElementById('descripcion').value.trim(),
      total_horas: totalHorasEl.value // Se incluye el total calculado
    };

    // --- ENVÍO AL BACKEND ---
    try {
      // !! RECUERDA CAMBIAR ESTA URL por la de tu backend !!
      const response = await fetch('http://127.0.0.1:5000/api/reservation', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (response.ok) {
        const result = await response.json(); 
        showFormMessage('¡Evento registrado con éxito!', 'success');
        eventForm.reset(); // Limpiamos el formulario
        totalHorasEl.value = "00:00"; // Reseteamos el total
        console.log('Respuesta del servidor:', result);
      } else {
        const errorData = await response.json();
        showFormMessage(`Error: ${errorData.message || 'No se pudo registrar'}`, 'error');
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      showFormMessage('Error de conexión. Revisa que el backend esté funcionando.', 'error');
    }
  }
  
  /**
   * 5. Función para mostrar mensajes en el formulario
   */
  function showFormMessage(message, type) {
    messageEl.textContent = message;
    messageEl.className = type; // 'success' o 'error'
  }
  
  /**
   * 6. Función para calcular el total de horas
   */
  function calcularTotalHoras() {
    const inicio = horaInicioEl.value;
    const final = horaFinalEl.value;

    // Solo calculamos si ambos campos tienen un valor
    if (inicio && final) {
      // Convertimos las horas "HH:MM" a minutos
      const [inicioH, inicioM] = inicio.split(':').map(Number);
      const totalMinInicio = (inicioH * 60) + inicioM;
      
      const [finalH, finalM] = final.split(':').map(Number);
      const totalMinFinal = (finalH * 60) + finalM;

      // Calculamos la diferencia
      let diffMinutos = totalMinFinal - totalMinInicio;

      // Si es negativo, asumimos que termina al día siguiente
      if (diffMinutos < 0) {
        diffMinutos += 24 * 60; // 1440 minutos en un día
      }

      // Convertimos los minutos de diferencia a "HH:MM"
      const horas = Math.floor(diffMinutos / 60);
      const minutos = diffMinutos % 60;

      // Formateamos para que siempre tengan dos dígitos
      const hh = String(horas).padStart(2, '0');
      const mm = String(minutos).padStart(2, '0');

      // Asignamos el valor al campo
      totalHorasEl.value = `${hh}:${mm}`;
      
    } else {
      totalHorasEl.value = "00:00"; // Resetea si falta un valor
    }
  }

});