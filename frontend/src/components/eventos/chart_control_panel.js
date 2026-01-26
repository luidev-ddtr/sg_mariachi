// chart_control_panel.js
// Gráfica del Panel de Control usando ApexCharts
// Datos simulados (falta que se conecten al backend)

const options = {
  series: [{
    name: "Ingresos",
    data: [40000, 60000, 52000, 65000, 53000, 40000]
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
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Ene-Feb', 'Mar-Abr', 'May-Jun', 'Jul-Ago', 'Sep-Oct', 'Nov-Dic']
  },
  yaxis: {
    labels: {
      formatter: val => `$${val.toLocaleString()}`
    }
  }
};

// Renderizar gráfica
const chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
