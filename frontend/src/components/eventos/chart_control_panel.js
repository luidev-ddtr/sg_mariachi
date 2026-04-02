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
      // 1. AHORA TENEMOS DOS SERIES: INGRESOS Y GANANCIAS
      series: [
        { name: "Ingresos Totales", data: [] },
        { name: "Ganancia Neta", data: [] }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: { enabled: true, delay: 150 },
            dynamicAnimation: { enabled: true, speed: 350 }
        }
      },
      // 2. COLORES: Azul para ingresos, Verde para ganancias
      colors: ['#0d6efd', '#00b050'], 
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
          dataLabels: {
            position: 'top', // Coloca los números en la parte superior de la barra
          },
        }
      },
      // 3. ACTIVAR LOS NÚMEROS SOBRE LAS BARRAS
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          if (val === 0) return ""; // Si es 0, no mostramos nada para que se vea limpio
          // Formateamos el número para que se vea como moneda (ej: $1,500)
          return "$" + val.toLocaleString('es-MX'); 
        },
        offsetY: -20,
        style: {
          fontSize: '11px',
          colors: ["#304758"]
        }
      },
      xaxis: {
            categories: [], 
            labels: { style: { fontSize: '12px' } }
        },
      yaxis: {
            labels: {
                formatter: (value) => { return `$${value}` }
            }
        },
      noData: {
        style: { color: '#00b050', fontSize: '16px' }
      },
      grid: {
            borderColor: '#f1f1f1',
        },
      // Agregamos la leyenda arriba para identificar los colores
      legend: {
        position: 'top',
        horizontalAlign: 'center'
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
    setTimeout(() => {
      chart.updateOptions({
        xaxis: {
          categories: labels
        }
      });

      // 4. CALCULAMOS LAS GANANCIAS PARA LA GRÁFICA
      const gananciasValues = values.map(val => parseFloat((val * 0.78).toFixed(2)));

      // Actualizamos ambas barras
      chart.updateSeries([
        {
          name: "Ingresos Totales",
          data: values
        },
        {
          name: "Ganancia Neta",
          data: gananciasValues
        }
      ]);
      
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
    
    // Actualizar gráfica
    updateChartData(labels, values);
    
    // Calcular total y actualizar tarjetas
    const totalIngresos = values.reduce((sum, value) => sum + value, 0);
    updateSummaryCards(totalIngresos);
    
    console.log("=== DASHBOARD ACTUALIZADO CON ÉXITO ===");
    
  } catch (error) {
    console.error("Error crítico en updateDashboard:", error);
    
    try {
      updateChartData(['Error'], [0]);
      updateSummaryCards(0);
    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError);
    }
  }
}

// Función para actualizar el texto del periodo
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
    // Botones de navegación
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

    // Botones de tipo de gráfica
    const btnWeek = document.getElementById('grafic_week');
    const btnMonth = document.getElementById('grafic_month');
    const btnYear = document.getElementById('grafic_year');

    const handleFilterChange = (type, btnClicked) => {
        currentFilter = type;
        
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
  
  initializeChart();
  setupEventListeners();

  const btnMonth = document.getElementById('grafic_month');
  if(btnMonth) btnMonth.click(); 
  else updateDashboard(); 
});

window.reloadDashboard = updateDashboard;

export { updateDashboard, initializeChart };