import './styles/form.css'
import { prueba1 } from './api/api_reservacion' // Asumo que esta ruta es correcta

// Función principal asíncrona para inicializar la aplicación y cargar datos de la API
const loadApp = async () => {
    // 1. Renderiza la estructura estática inicial de la página
    document.querySelector('#app').innerHTML = `
        <div class="container mx-auto p-4 max-w-4xl font-sans">
            <!-- Título y Navegación (Estática) -->
            <h1 class="text-3xl font-bold mb-6 text-center text-indigo-700">Página Principal - Menú de Navegación</h1>
            <nav class="mb-8 p-4 bg-indigo-100 rounded-lg shadow-md">
                <ul class="flex justify-center space-x-6">
                    <li><a href="/pages/login.html" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">Login</a></li>
                    <li><a href="/pages/control_panel.html" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">Panel de Control</a></li>
                    <li><a href="/pages/registro-evento.html" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">Registro de Evento</a></li>
                    <li><a href="/pages/agenda.html" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">Agenda</a></li>
                    <li><a href="/pages/generate_reports.html" class="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">Generar Reportes</a></li>
                </ul>
            </nav>
        
            <!-- Sección de Prueba 1 -->
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800">Resultado de la Prueba 1 (API)</h2>
                <div id="prueba1_container" class="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                    <!-- Placeholder para el resultado de la API -->
                    <p id="prueba1_result" class="text-gray-600 italic">Cargando resultado de la API...</p>
                </div>
            </div>
        </div>
    `;

    // 2. Lógica Asíncrona para obtener y mostrar los datos
    const resultElement = document.getElementById('prueba1_result');

    try {
        // Llama a la función asíncrona y espera su resultado
        const data = await prueba1();
        
        // Formatea el resultado para su visualización
        let displayText;
        
        if (typeof data === 'object' && data !== null) {
            // Si es un objeto (JSON), lo convierte a una cadena con formato legible
            displayText = JSON.stringify(data, null, 2);
            resultElement.classList.add('text-left', 'bg-gray-50', 'p-4', 'rounded-md', 'whitespace-pre-wrap', 'font-mono', 'text-sm');
        } else {
            // Si es una cadena u otro valor, lo muestra directamente
            displayText = String(data);
        }

        // Actualiza el contenido del elemento
        resultElement.textContent = displayText;

    } catch (error) {
        // En caso de error, muestra un mensaje de error
        resultElement.textContent = `Error al cargar los datos: ${error.message}. Verifica la conexión con la API.`;
        resultElement.style.color = 'red';
        resultElement.classList.add('text-red-600', 'font-bold');
    }
};

// Inicia la aplicación
loadApp();