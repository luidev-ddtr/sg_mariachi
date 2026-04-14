// cambiar-pass.js
// Lógica del formulario de cambiar contraseña

import { updateAdministratorPassword } from '../../api/api_serviceOwnersPassword.js';

document.addEventListener('DOMContentLoaded', () => {

  const form    = document.getElementById('pass-form');
  const message = document.getElementById('form-message');

  // 1. Obtener el ID del administrador desde la URL (?id=...)
  const params = new URLSearchParams(window.location.search);
  const adminId = params.get('id');

  //Botones mostrar/ocultar contraseña
  document.querySelectorAll('.btn-toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-target'));
      const icon  = btn.querySelector('.material-symbols-outlined');
      if (input.type === 'password') {
        input.type       = 'text';
        icon.textContent = 'visibility_off';
      } else {
        input.type       = 'password';
        icon.textContent = 'visibility';
      }
    });
  });


  //Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!adminId) {
      mostrarMensaje('Error: No se pudo identificar al administrador.', 'error');
      return;
    }

    const actual    = document.getElementById('cp_actual').value;
    const nueva     = document.getElementById('cp_nueva').value;
    const confirmar = document.getElementById('cp_confirmar').value;

    // Validaciones
    if (nueva !== confirmar) {
      mostrarMensaje('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }

    if (nueva.length < 8) {
      mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }

    mostrarMensaje('Actualizando contraseña...', 'info');

    try {
      const payload = {
        id: adminId,
        cp_actual: actual,
        cp_nueva: nueva
      };

      const result = await updateAdministratorPassword(payload);
      
      mostrarMensaje('¡Contraseña actualizada correctamente!', 'success');
      setTimeout(() => window.parent.postMessage('passActualizada', '*'), 1200);

    } catch (err) {
      mostrarMensaje(err.message || 'Error al actualizar la contraseña.', 'error');
    }
  });

  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }

});