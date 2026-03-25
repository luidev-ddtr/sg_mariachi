import { GetStats } from "../../api/api_stats.js"; 

// Función para asegurar que el elemento del DOM existe
function getChartElement() {
  const chartElement = document.querySelector("#chart");
  if (!chartElement) {
    console.error("Elemento #chart no encontrado en el DOM");
    return null;
  }
  return chartElement;
}

// Inicializar gráfica de manera segura
let chart = null;
// Estado global para filtros
let currentFilter = 'month'; // Valor por defecto
let currentYear = new Date().getFullYear();

function initializeChart() {
  try {
    const chartElement = getChartElement();
    if (!chartElement) return false;

    const options = {
      series: [{
        name: "Ingresos",
        data: []
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
        }
      },
      colors: ['#00b050'],
      plotOptions: {
        bar: { 
          borderRadius: 6, 
          columnWidth: '40%'
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
            categories: [], // Se llenará dinámicamente
            labels: { style: { fontSize: '12px' } }
        },
      yaxis: {
            labels: {
                formatter: (value) => { return `$${value}` }
            }
        },
      noData: {
        //text: 'Consultando datos...',
        style: { color: '#00b050', fontSize: '16px' }
      },
      grid: {
            borderColor: '#f1f1f1',
        }
    };

    chart = new ApexCharts(chartElement, options);
    chart.render();
    return true;
  } catch (error) {
    console.error("Error al inicializar gráfica:", error);
    return false;
  }
}

// Función para procesar datos de manera segura
// Busca esta función en tu archivo y reemplázala por completo:
function processStatsData(stats, filterType) {
  console.log("Procesando datos estadísticos:", stats);
  
  // Mapa para convertir números a nombres de meses
  const monthNames = {
    "1": "Ene", "2": "Feb", "3": "Mar", "4": "Abr", 
    "5": "May", "6": "Jun", "7": "Jul", "8": "Ago", 
    "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dic"
  };

  if (!Array.isArray(stats)) {
    if (stats && stats.body && Array.isArray(stats.body)) {
      stats = stats.body;
    } else {
      stats = [];
    }
  }
  
  if (stats.length === 0) {
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      values: [0, 0, 0, 0, 0, 0]
    };
  }
  
  const labels = [];
  const values = [];
  
  stats.forEach((item, index) => {
    // 1. Extraer el identificador del mes
    let rawLabel = item.label || item.mes || item.month || (index + 1);
    
    // 2. Convertir número a nombre si es necesario
    // Si rawLabel es "1" o 1, se convierte a "Ene"
    let label = rawLabel;
    if (filterType === 'month') {
        label = monthNames[String(rawLabel)] || rawLabel;
    } else if (filterType === 'week') {
        label = `Semana ${rawLabel}`;
    }
    
    // 3. Extraer valor (ingresos)
    let value = item.total || item.ingreso || item.total_revenue || item.monto || item.amount || 0;
    
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    if (value === 0) {
      const keys = Object.keys(item);
      for (let key of keys) {
        if (!isNaN(item[key]) && !['month', 'mes', 'label'].includes(key)) {
          value = parseFloat(item[key]);
          break; 
        }
      }
    }
    
    value = isNaN(value) ? 0 : value;
    
    labels.push(String(label).trim());
    values.push(value);
  });
  
  return { labels, values };
}
// Actualizar gráfica con datos
function updateChartData(labels, values) {
  if (!chart) {
    console.warn("Gráfica no inicializada, intentando inicializar...");
    if (!initializeChart()) {
      console.error("No se pudo inicializar la gráfica");
      return;
    }
  }
  
  try {
    // Usar setTimeout para evitar conflictos de renderizado
    setTimeout(() => {
      // Separamos updateOptions y updateSeries para lograr el efecto de "deslizamiento" fluido
      chart.updateOptions({
        xaxis: {
          categories: labels
        }
      });

      chart.updateSeries([{
        name: "Ingresos",
        data: values
      }]);
      
      console.log("Gráfica actualizada con", values.length, "datos");
    }, 100);
  } catch (error) {
    console.error("Error al actualizar gráfica:", error);
  }
}

// Actualizar tarjetas de resumen
function updateSummaryCards(totalIngresos) {
  try {
    const totalGanancia = totalIngresos * 0.78;
    
    const ingresosMontoElement = document.getElementById('ingresos-monto');
    const gananciaMontoElement = document.getElementById('ganancia-monto');
    
    if (ingresosMontoElement) {
      ingresosMontoElement.textContent = 
        `$${totalIngresos.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
    }
    
    if (gananciaMontoElement) {
      gananciaMontoElement.textContent = 
        `$${totalGanancia.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
    }
    
    console.log("Tarjetas actualizadas - Ingresos:", totalIngresos, "Ganancia:", totalGanancia);
  } catch (error) {
    console.error("Error al actualizar tarjetas:", error);
  }
}

// Función principal para actualizar el dashboard
async function updateDashboard() {
  console.log(`=== ACTUALIZANDO DASHBOARD (${currentFilter} - ${currentYear}) ===`);
  
  try {
    // Inicializar gráfica si no está inicializada
    if (!chart) {
      initializeChart();
    }
    
    // Actualizar etiqueta de periodo en el HTML
    updatePeriodLabel();
    
    // Obtener datos de la API
    let stats;
    try {
      stats = await GetStats(currentFilter, currentYear);
      console.log("Datos obtenidos de GetStats:", stats);
    } catch (apiError) {
      console.error("Error al obtener datos de la API:", apiError);
      stats = [];
    }
    
    // Procesar datos
    const { labels, values } = processStatsData(stats, currentFilter);
    console.log("Labels procesados:", labels);
    console.log("Values procesados:", values);
    
    // Actualizar gráfica
    updateChartData(labels, values);
    
    // Calcular total y actualizar tarjetas
    const totalIngresos = values.reduce((sum, value) => sum + value, 0);
    updateSummaryCards(totalIngresos);
    
    console.log("=== DASHBOARD ACTUALIZADO CON ÉXITO ===");
    
  } catch (error) {
    console.error("Error crítico en updateDashboard:", error);
    
    // Intentar mostrar un estado de error
    try {
      updateChartData(['Error'], [0]);
      updateSummaryCards(0);
    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError);
    }
  }
}

// Función para actualizar el texto del periodo (ej: "Año 2025")
function updatePeriodLabel() {
    const labelElement = document.querySelector('.current-period');
    if (labelElement) {
        if (currentFilter === 'year') {
            labelElement.textContent = "Histórial Anual";
        } else {
            labelElement.textContent = `Año ${currentYear}`;
        }
    }
}

// Función para configurar los botones (listeners)
function setupEventListeners() {
    // Botones de navegación (Año anterior/siguiente)
    document.getElementById('prev')?.addEventListener('click', () => {
        currentYear--;
        updateDashboard();
    });

    document.getElementById('next')?.addEventListener('click', () => {
        currentYear++;
        updateDashboard();
    });

    document.getElementById('today')?.addEventListener('click', () => {
        currentYear = new Date().getFullYear();
        updateDashboard();
    });

    // Botones de tipo de gráfica (Semana, Mes, Año)
    const btnWeek = document.getElementById('grafic_week');
    const btnMonth = document.getElementById('grafic_month');
    const btnYear = document.getElementById('grafic_year');

    const handleFilterChange = (type, btnClicked) => {
        currentFilter = type;
        
        // Actualizar clases visuales (active)
        [btnWeek, btnMonth, btnYear].forEach(btn => btn?.classList.remove('active'));
        btnClicked?.classList.add('active');

        updateDashboard();
    };

    btnWeek?.addEventListener('click', () => handleFilterChange('week', btnWeek));
    btnMonth?.addEventListener('click', () => handleFilterChange('month', btnMonth));
    btnYear?.addEventListener('click', () => handleFilterChange('year', btnYear));
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado, inicializando dashboard...");
  
  // Verificar que los elementos necesarios existan
  const chartElement = document.querySelector("#chart");
  const ingresosElement = document.getElementById('ingresos-monto');
  const gananciaElement = document.getElementById('ganancia-monto');
  
  console.log("Elementos encontrados:", {
    chart: !!chartElement,
    ingresosMonto: !!ingresosElement,
    gananciaMonto: !!gananciaElement
  });
  
  // Inicializar gráfica
  initializeChart();
  
  // Configurar botones
  setupEventListeners();

  // Forzar el estado visual inicial (por defecto Mes)
  const btnMonth = document.getElementById('grafic_month');
  if(btnMonth) btnMonth.click(); // Esto disparará updateDashboard
  else updateDashboard(); // Fallback si no hay botón
  
  // Cargar datos después de un breve delay
  // setTimeout(updateDashboard, 1000); // Ya no es necesario si hacemos click arriba
});

// Función para recargar datos manualmente (útil para debugging)
window.reloadDashboard = updateDashboard;

// Exportar funciones
export { updateDashboard, initializeChart };