//registro-admin.js
// para: formulario_nvo_admin.html

document.addEventListener('DOMContentLoaded', () => {

  const form    = document.getElementById('admin-form');
  const message = document.getElementById('form-message');

  // Validación para teléfono
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
 
    const datos = {
      nombre:           document.getElementById('admin_nombre').value.trim(),
      segundo_nombre:   document.getElementById('admin_segundo_nombre').value.trim(),
      apellido_paterno: document.getElementById('admin_apellido_paterno').value.trim(),
      apellido_materno: document.getElementById('admin_apellido_materno').value.trim(),
      telefono:         document.getElementById('admin_telefono').value.trim(),
      email:            document.getElementById('admin_email').value.trim(),
      direccion:        document.getElementById('admin_direccion').value.trim(),
      usuario:          document.getElementById('admin_usuario').value.trim(),
      rol:              document.getElementById('admin_rol').value,
      password:         document.getElementById('admin_password').value,
    };
 
    mostrarMensaje('Registrando administrador...', 'info');

    // EDITAR
    // try {
    //   await axios.post('/api/admins', datos);
    //   mostrarMensaje('¡Administrador registrado correctamente!', 'success');
    //   setTimeout(() => window.parent.postMessage('adminRegistrado', '*'), 1000);
    // } catch (err) {
    //   const msg = err.response?.data?.message || 'Error al registrar. Intenta de nuevo.';
    //   mostrarMensaje(msg, 'error');
    // }
 
    // Simulación visual:
    console.log('Nuevo admin:', datos);
    mostrarMensaje('Administrador registrado. (conecta tu API)', 'success');
    setTimeout(() => window.parent.postMessage('adminRegistrado', '*'), 1200);
  });
 
  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }
 
});