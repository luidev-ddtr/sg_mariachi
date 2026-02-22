// =============================
// Wizard de pasos para formulario
// Compatible con tu lógica actual
// =============================

const steps = document.querySelectorAll('.wizard-step');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');

let currentStep = 0;

// Mostrar paso actual
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });

  prevBtn.disabled = index === 0;
  nextBtn.classList.toggle('hidden', index === steps.length - 1);
  submitBtn.classList.toggle('hidden', index !== steps.length - 1);
}

// Validar solo inputs visibles
function validateCurrentStep() {
  const inputs = steps[currentStep].querySelectorAll('input[required], textarea[required]');
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  return true;
}

// Botón siguiente
nextBtn.addEventListener('click', () => {
  if (validateCurrentStep()) {
    currentStep++;
    showStep(currentStep);
  }
});

// Botón anterior
prevBtn.addEventListener('click', () => {
  currentStep--;
  showStep(currentStep);
});

// Inicialización
showStep(currentStep);
