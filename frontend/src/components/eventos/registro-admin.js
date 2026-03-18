//registro-admin.js
// para: formulario_nvo_admin.html

// 🔥 IMPORTANTE: Traemos tu función real de la API
import { registerNewAdministrator } from '../../api/api_serviceOwners.js';

document.addEventListener('DOMContentLoaded', () => {

  const form    = document.getElementById('admin-form');
  const message = document.getElementById('form-message');

  // Validación para teléfono (Se queda igual, tu compañero lo hizo muy bien)
  const inputTelefono = document.getElementById('admin_telefono');
  if (inputTelefono) {
    inputTelefono.addEventListener('input', function () {
      const limpio = this.value.replace(/[^0-9]/g, '').slice(0, 10);
      if (this.value !== limpio) this.value = limpio;
    });
 
    inputTelefono.addEventListener('paste', function (e) {
      e.preventDefault();
      const texto  = (e.clipboardData || window.clipboardData).getData('text');
      const limpio = texto.replace(/[^0-9]/g, '').slice(0, 10);
      document.execCommand('insertText', false, limpio);
    });
  }

  // Submit registrar nuevo admin
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Validar que las contraseñas coincidan antes de ir al backend
    const pass = document.getElementById('admin_password').value;
    const confirmPass = document.getElementById('admin_confirm_password').value;

    if (pass !== confirmPass) {
      mostrarMensaje('Las contraseñas no coinciden.', 'error');
      return;
    }
 
    // 2. Mapeamos los datos al formato exacto que espera tu api_serviceOwners.js
    const formData = {
      firstName:      document.getElementById('admin_nombre').value.trim(),
      secondName:     document.getElementById('admin_segundo_nombre').value.trim(),
      lastName:       document.getElementById('admin_apellido_paterno').value.trim(),
      secondLastName: document.getElementById('admin_apellido_materno').value.trim(),
      phone:          document.getElementById('admin_telefono').value.trim(),
      address:        document.getElementById('admin_direccion').value.trim(),
      username:       document.getElementById('admin_usuario').value.trim(),
      password:       pass,
      role:           document.getElementById('admin_rol').value,
      email:          document.getElementById('admin_email').value.trim(),
      secondPhone:    '' // Por si la API lo pide
    };
 
    // 3. Desactivamos botón temporalmente para evitar dobles envíos
    const btnSubmit = form.querySelector('button[type="submit"]');
    if(btnSubmit) btnSubmit.disabled = true;

    mostrarMensaje('Registrando administrador en la base de datos...', 'info');

    try {
      // 4. 🔥 LLAMADA REAL A TU API 🔥
      console.log('Enviando datos a la API:', formData);
      const respuesta = await registerNewAdministrator(formData);

      if (respuesta.success) {
        mostrarMensaje('¡Administrador registrado correctamente!', 'success');
        
        // Avisamos a la tabla que se actualice después de 1 segundo
        setTimeout(() => window.parent.postMessage('adminRegistrado', '*'), 1000);
      } else {
        mostrarMensaje(`Error al registrar: ${respuesta.message}`, 'error');
      }

    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el servidor. Intenta de nuevo.', 'error');
    } finally {
      if(btnSubmit) btnSubmit.disabled = false;
    }
  });
 
  // Función para inyectar mensajes visuales
  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }
 
});