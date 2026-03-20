// edit-admin.js

// 🔥 IMPORTAMOS TUS FUNCIONES REALES DE LA API
import { getAdministrators } from '../../api/api_serviceOwnersRead.js';
import { updateAdministrator } from '../../api/api_serviceOwnersUpdate.js';

document.addEventListener('DOMContentLoaded', async () => {

  const form    = document.getElementById('edit-admin-form');
  const message = document.getElementById('form-message');

  // Leer ID de la URL
  const params  = new URLSearchParams(window.location.search);
  const adminId = params.get('id');

  if (!adminId) {
    console.error('ID no encontrado en la URL');
    mostrarMensaje('Error: No se proporcionó un ID válido.', 'error');
    return;
  }

  // 1. Cargar datos del admin y autocompletar el formulario
  await cargarDatos(adminId);

  // Validación teléfono (solo números y 10 dígitos)
  const inputTel = document.getElementById('admin_telefono');
  if (inputTel) {
    inputTel.addEventListener('input', function () {
      const limpio = this.value.replace(/[^0-9]/g, '').slice(0, 10);
      if (this.value !== limpio) this.value = limpio;
    });

    inputTel.addEventListener('paste', function (e) {
      e.preventDefault();
      const texto  = (e.clipboardData || window.clipboardData).getData('text');
      const limpio = texto.replace(/[^0-9]/g, '').slice(0, 10);
      document.execCommand('insertText', false, limpio);
    });
  }

  // 2. Submit: Guardar los cambios
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Recopilamos los datos tal cual los necesita tu API updateAdministrator
    const datos = {
      nombre:           document.getElementById('admin_nombre').value.trim(),
      apellido_paterno: document.getElementById('admin_apellido_paterno').value.trim(),
      apellido_materno: document.getElementById('admin_apellido_materno').value.trim(),
      telefono:         document.getElementById('admin_telefono').value.trim(),
      email:            document.getElementById('admin_email').value.trim(),
      direccion:        document.getElementById('admin_direccion').value.trim(),
      usuario:          document.getElementById('admin_usuario').value.trim(),
      rol:              document.getElementById('admin_rol').value,
    };

    mostrarMensaje('Guardando cambios...', 'info');

    try {
      // Llamada real a tu base de datos mediante la API que creaste
      await updateAdministrator(datos, adminId);
      
      mostrarMensaje('Administrador actualizado correctamente.', 'success');
      
      // Avisamos a la tabla padre que ya se actualizó para que recargue la vista
      setTimeout(() => window.parent.postMessage('adminActualizado', '*'), 1000);
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      mostrarMensaje('Error al guardar. Verifica la consola o tu conexión.', 'error');
    }
  });


  // ==========================================
  // FUNCIÓN PARA AUTOCOMPLETAR LOS DATOS
  // ==========================================
  async function cargarDatos(id) {
    try {
      // Traemos todos los admins y buscamos el que coincida con el ID
      const admins = await getAdministrators();
      const adminData = admins.find(a => String(a.DIM_EmployeeId || a.id) === String(id));

      if (!adminData) {
        mostrarMensaje('No se encontraron los datos de este administrador.', 'error');
        return;
      }

      // Autocompletamos los inputs del HTML con lo que viene de la BD
      document.getElementById('admin_nombre').value           = adminData.DIM_Name || '';
      document.getElementById('admin_apellido_paterno').value = adminData.DIM_LastName || '';
      document.getElementById('admin_apellido_materno').value = adminData.DIM_SecondLastName || '';
      document.getElementById('admin_telefono').value         = adminData.DIM_PhoneNumber || '';
      document.getElementById('admin_email').value            = adminData.DIM_Email || adminData.Email || '';
      document.getElementById('admin_direccion').value        = adminData.DIM_Address || '';
      document.getElementById('admin_usuario').value          = adminData.DIM_Username || '';
      
      // Si tienes un select de rol, se selecciona automáticamente si coincide el valor
      const rolInput = document.getElementById('admin_rol');
      if (rolInput) {
          rolInput.value = adminData.DIM_Position || '';
      }

    } catch (error) {
      console.error('Error cargando datos del admin:', error);
      mostrarMensaje('Error al cargar los datos desde el servidor.', 'error');
    }
  }

  // Función de apoyo para alertas visuales
  function mostrarMensaje(texto, tipo) {
    if(message) {
        message.textContent = texto;
        message.className   = tipo;
    }
  }

});