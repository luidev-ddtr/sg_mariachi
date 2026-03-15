
// cambiar-pass.js
// Lógica del formulario de cambiar contraseña
//EDITAR 
document.addEventListener('DOMContentLoaded', () => {

  const form    = document.getElementById('pass-form');
  const message = document.getElementById('form-message');

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

  //Indicador de fortaleza
  const inputNueva    = document.getElementById('cp_nueva');
  const strengthFill  = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  inputNueva.addEventListener('input', () => {
    const nivel = calcularFortaleza(inputNueva.value);
    strengthFill.className    = `strength-fill ${nivel.cls}`;
    strengthLabel.textContent = nivel.label;
    strengthLabel.className   = `strength-label ${nivel.cls}`;
  });

  function calcularFortaleza(pass) {
    if (!pass) return { cls: '', label: '—' };
    let score = 0;
    if (pass.length >= 8)            score++;
    if (/[A-Z]/.test(pass))          score++;
    if (/[0-9]/.test(pass))          score++;
    if (/[^A-Za-z0-9]/.test(pass))   score++;

    if (score <= 1) return { cls: 'weak',   label: 'Débil'  };
    if (score <= 3) return { cls: 'medium', label: 'Media'  };
    return           { cls: 'strong', label: 'Fuerte' };
  }

  //Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

    // ── Conecta aquí con tu API ──
    // try {
    //   await axios.put('/api/admins/me/password', { actual, nueva });
    //   mostrarMensaje('¡Contraseña actualizada correctamente!', 'success');
    //   setTimeout(() => window.parent.postMessage('passActualizada', '*'), 1000);
    // } catch (err) {
    //   const msg = err.response?.data?.message || 'Contraseña actual incorrecta.';
    //   mostrarMensaje(msg, 'error');
    // }

    // Simulación visual:
    console.log('Cambiar contraseña:', { actual, nueva });
    mostrarMensaje('Contraseña actualizada. (conecta tu API)', 'success');
    setTimeout(() => window.parent.postMessage('passActualizada', '*'), 1200);
  });

  function mostrarMensaje(texto, tipo) {
    message.textContent = texto;
    message.className   = tipo;
  }

});