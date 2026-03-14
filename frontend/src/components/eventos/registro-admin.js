// registro-admin.js
// Recoge los 3 pasos: datos personales, dirección, cuenta
//EDITAR

document.addEventListener('DOMContentLoaded', () => {

  const form    = document.getElementById('admin-form');
  const message = document.getElementById('form-message');

  // Validación: solo números en teléfono
  const inputTelefono = document.getElementById('admin_telefono');
  if (inputTelefono) {
    inputTelefono.addEventListener('input', function () {
      const original = this.value;
      const limpio   = original.replace(/[^0-9]/g, '').slice(0, 10);
      if (original !== limpio) this.value = limpio;
    });

    inputTelefono.addEventListener('paste', function (e) {
      e.preventDefault();
      const texto  = (e.clipboardData || window.clipboardData).getData('text');
      const limpio = texto.replace(/[^0-9]/g, '').slice(0, 10);
      document.execCommand('insertText', false, limpio);
    });
  }

  // Envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const datos = {
      // Paso 1 — Datos personales
      nombre:           document.getElementById('admin_nombre').value.trim(),
      segundo_nombre:   document.getElementById('admin_segundo_nombre').value.trim(),
      apellido_paterno: document.getElementById('admin_apellido_paterno').value.trim(),
      apellido_materno: document.getElementById('admin_apellido_materno').value.trim(),
      telefono:         document.getElementById('admin_telefono').value.trim(),
      email:            document.getElementById('admin_email').value.trim(),

      // Paso 2 — Dirección
      localidad:  document.getElementById('admin_localidad').value.trim(),
      municipio:  document.getElementById('admin_municipio').value.trim(),
      estado:     document.getElementById('admin_estado').value.trim(),
      direccion:  document.getElementById('admin_direccion').value.trim(),

      // Paso 3 — Cuenta
      usuario:  document.getElementById('admin_usuario').value.trim(),
      rol:      document.getElementById('admin_rol').value,
      password: document.getElementById('admin_password').value,
      notas:    document.getElementById('admin_notas').value.trim(),
    };

    mostrarMensaje('Registrando administrador...', 'info');

    // ── Conecta aquí con tu API ──
    // try {
    //   await axios.post('/api/admins', datos);
    //   mostrarMensaje('¡Administrador registrado correctamente!', 'success');
    //   setTimeout(() => {
    //     window.parent.postMessage('adminRegistrado', '*');
    //   }, 1000);
    // } catch (error) {
    //   const msg = error.response?.data?.message || 'Error al registrar. Intenta de nuevo.';
    //   mostrarMensaje(msg, 'error');
    // }

    // ---Simulación hasta conectar la API:---
    console.log('Datos del nuevo admin:', datos);
    mostrarMensaje('¡Administrador registrado! (conecta tu API)', 'success');
    setTimeout(() => {
      window.parent.postMessage('adminRegistrado', '*');
    }, 1200);
  });

  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }

});