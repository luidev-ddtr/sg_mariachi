// wizard-admin.js
//controla el Siguiente/Anterior de la sección

const steps     = document.querySelectorAll('.wizard-step');
const nextBtn   = document.getElementById('nextBtn');
const prevBtn   = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');

let currentStep = 0;

// Mostrar el paso activo
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });

  prevBtn.disabled = index === 0;
  nextBtn.classList.toggle('hidden', index === steps.length - 1);
  submitBtn.classList.toggle('hidden', index !== steps.length - 1);
}

// Validar inputs requeridos del paso actual
function validateCurrentStep() {
  const inputs = steps[currentStep].querySelectorAll('input[required], select[required], textarea[required]');
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }

  //---------------EDITAR-------
  // Validación extra en paso 2: contraseñas coinciden
  if (currentStep === 1) {
    const pass    = document.getElementById('admin_password').value;
    const confirm = document.getElementById('admin_confirm_password').value;
    if (pass !== confirm) {
      const confirmInput = document.getElementById('admin_confirm_password');
      confirmInput.setCustomValidity('Las contraseñas no coinciden.');
      confirmInput.reportValidity();
      confirmInput.setCustomValidity(''); // reset para futuras validaciones
      return false;
    }
  }

  return true;
}

// Siguiente paso
nextBtn.addEventListener('click', () => {
  if (validateCurrentStep()) {
    currentStep++;
    showStep(currentStep);
  }
});

// Paso anterior
prevBtn.addEventListener('click', () => {
  currentStep--;
  showStep(currentStep);
});

// Inicializar
showStep(currentStep);