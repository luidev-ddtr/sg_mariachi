// edit-admin.js

document.addEventListener('DOMContentLoaded', async () => {

  const form    = document.getElementById('edit-admin-form');
  const message = document.getElementById('form-message');

  // Leer ID de la URL
  const params  = new URLSearchParams(window.location.search);
  const adminId = params.get('id');

  if (!adminId) {
    console.error('ID no encontrado en la URL');
    return;
  }

  //Cargar datos del admin
  await cargarDatos(adminId);

  // Validación teléfono 
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

  // Submit 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const datos = {
      adminId,
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

    // ── Conecta aquí con tu API ──
    // try {
    //   await axios.put(`/api/admins/${adminId}`, datos);
    //   mostrarMensaje('Administrador actualizado correctamente.', 'success');
    //   setTimeout(() => {
    //     if (window.parent && window.parent.finalizarEdicionAdmin) {
    //       window.parent.finalizarEdicionAdmin();
    //     } else {
    //       window.parent.postMessage('adminActualizado', '*');
    //     }
    //   }, 1000);
    // } catch (error) {
    //   const msg = error.response?.data?.message || 'Error al guardar. Intenta de nuevo.';
    //   mostrarMensaje(msg, 'error');
    // }

    // Simulación visual:----EDITAR
    console.log('Actualizar admin:', datos);
    mostrarMensaje('Administrador actualizado. (conecta tu API)', 'success');
    setTimeout(() => window.parent.postMessage('adminActualizado', '*'), 1200);
  });

  //  Cargar datos en el formulario 
  async function cargarDatos(id) {
    try {

      // ── Conecta aquí con tu API ──
      // const res  = await axios.get(`/api/admins/${id}`);
      // const d    = res.data;

      // Simulación — reemplaza con res.data cuando tengas la API:
      const d = {
        nombre:           '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono:         '',
        email:            '',
        direccion:        '',
        usuario:          '',
        rol:              '',
      };

      document.getElementById('admin_nombre').value           = d.nombre           || '';
      document.getElementById('admin_apellido_paterno').value = d.apellido_paterno || '';
      document.getElementById('admin_apellido_materno').value = d.apellido_materno || '';
      document.getElementById('admin_telefono').value         = d.telefono         || '';
      document.getElementById('admin_email').value            = d.email            || '';
      document.getElementById('admin_direccion').value        = d.direccion        || '';
      document.getElementById('admin_usuario').value          = d.usuario          || '';
      document.getElementById('admin_rol').value              = d.rol              || '';

    } catch (error) {
      console.error('Error cargando datos del admin:', error);
      mostrarMensaje('Error al cargar los datos.', 'error');
    }
  }

  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }

});