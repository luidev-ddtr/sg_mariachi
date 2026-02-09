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
        toolbar: { show: false }
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
        categories: [],
        labels: { 
          style: { colors: '#8e8e8e' }
        }
      },
      yaxis: {
        labels: { 
          formatter: val => `$${val ? val.toLocaleString() : '0'}` 
        },
        min: 0
      },
      noData: {
        text: 'Consultando datos...',
        style: { color: '#00b050', fontSize: '16px' }
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
function processStatsData(stats) {
  console.log("Procesando datos estadísticos:", stats);
  
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
    // 1. Extraer label (Mes)
    let label = item.label || item.mes || item.month || `Mes ${index + 1}`;
    
    // 2. EXTRAER VALOR (Aquí es donde estaba el detalle)
    let value = 0;
    
    // Intentamos todas las posibilidades de nombres de columna que usa tu API
    // Agregué 'total_revenue' y 'monto' que son comunes en tus proyectos anteriores
    value = item.total || item.ingreso || item.total_revenue || item.monto || item.amount || 0;
    
    // Si el valor es un texto (como "14994.00"), lo convertimos a número real
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    // Plan B: Si sigue siendo 0, buscamos cualquier propiedad que tenga un número
    if (value === 0) {
      const keys = Object.keys(item);
      for (let key of keys) {
        // Si la propiedad es un número y no es el ID del mes, ese es nuestro dinero
        if (!isNaN(item[key]) && key !== 'month' && key !== 'mes' && key !== 'label') {
          value = parseFloat(item[key]);
          break; 
        }
      }
    }
    
    // Asegurar que no sea NaN para que ApexCharts no explote
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
      // Actualizar series y categorías en un solo paso
      chart.updateOptions({
        series: [{
          name: "Ingresos",
          data: values
        }],
        xaxis: {
          categories: labels
        }
      }, true, true); // true, true = actualizar series y redibujar
      
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
  console.log("=== ACTUALIZANDO DASHBOARD ===");
  
  try {
    // Inicializar gráfica si no está inicializada
    if (!chart) {
      initializeChart();
    }
    
    const currentYear = new Date().getFullYear();
    console.log("Obteniendo estadísticas para el año:", currentYear);
    
    // Obtener datos de la API
    let stats;
    try {
      stats = await GetStats('month', currentYear);
      console.log("Datos obtenidos de GetStats:", stats);
    } catch (apiError) {
      console.error("Error al obtener datos de la API:", apiError);
      stats = [];
    }
    
    // Procesar datos
    const { labels, values } = processStatsData(stats);
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
  
  // Cargar datos después de un breve delay
  setTimeout(updateDashboard, 1000);
});

// Función para recargar datos manualmente (útil para debugging)
window.reloadDashboard = updateDashboard;

// Exportar funciones
export { updateDashboard, initializeChart };