// Importamos la nueva función para reportes detallados
import { GetDetailedReport } from '../../api/api_reservacion_read.js';

// Utilidad para formatear moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
};

// Lógica para generar y disparar la impresión del reporte
document.getElementById('form-report').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const period = document.getElementById('report-period').value;
    const includeEvents = document.getElementById('check-events').checked;
    const includePayments = document.getElementById('check-payments').checked;
    const includeSummary = document.getElementById('check-summary').checked;

    const printArea = document.getElementById('print-content');
    
    // 1. Mostrar estado de carga
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = "Generando...";

    try {
        // 2. Obtener datos reales
        const now = new Date();
        // Corregimos el error de zona horaria (UTC) usando la fecha local del navegador
        const localYear = now.getFullYear();
        const localMonth = String(now.getMonth() + 1).padStart(2, '0');
        const localDay = String(now.getDate()).padStart(2, '0');
        
        let filterValue = "";
        if (period === 'today') {
            // Ahora forzamos la fecha local exacta del sistema
            filterValue = `${localYear}-${localMonth}-${localDay}`;
        } else if (period === 'month' || period === 'week') {
            filterValue = `${localYear}-${localMonth}`; // Filtrado por mes para estos periodos
        } else if (period === 'year') {
            filterValue = localYear.toString();
        }

        const data = await GetDetailedReport(filterValue);
        
        // 3. Construir el HTML del reporte
        let html = `
            <div class="report-container">
                <div class="report-header">
                    <img src="/images/logo_cn_fondo.png" alt="Logo">
                    <div class="report-header-info">
                        <h1>Reporte Administrativo</h1>
                        <p>Mariachis San Nicolás</p>
                        <p><small>Generado el: ${new Date().toLocaleString()}</small></p>
                    </div>
                </div>
                <div class="report-period-badge">Bitácora de Actividad: ${filterValue} (${period.toUpperCase()})</div>
        `;

        if (includeSummary) {
            // Calculamos totales desde los datos obtenidos
            const totalMonto = data.reduce((sum, res) => sum + (parseFloat(res.DIM_TotalAmount) || 0), 0);
            const totalEventos = data.length;
            const gananciaEstimada = totalMonto * 0.78; // Basado en tu lógica de 22% comisión

            html += `
                <h4>Resumen Financiero</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Cantidad de Eventos</td><td class="text-right">${totalEventos}</td></tr>
                        <tr><td>Total Ingresos Brutos</td><td class="text-right">${formatCurrency(totalMonto)}</td></tr>
                        <tr><td>Ganancia Neta Estimada (78%)</td><td class="text-right"><strong>${formatCurrency(gananciaEstimada)}</strong></td></tr>
                    </tbody>
                </table>
            `;
        }

        if (includeEvents) {
            // --- LÓGICA DE VISUALIZACIÓN BASADA EN EL ACTIVITY TYPE ---
            
            if (period === 'today') {
                // Estructura de Bitácora (Corta estancia)
                const agendaOperativa = data.filter(item => item.ActivityType === 'AGENDA_OPERATIVA');
                const movimientosSistema = data.filter(item => item.ActivityType === 'MOVIMIENTO_SISTEMA');

                html += `<h4>1. Agenda Operativa (Eventos para hoy)</h4>`;
                if (agendaOperativa.length > 0) {
                    html += renderTable(agendaOperativa);
                } else {
                    html += `<p><i>No hay servicios programados para esta fecha.</i></p>`;
                }

                html += `<h4 style="margin-top:40px;">2. Movimientos del Sistema (Registros y cambios realizados hoy)</h4>`;
                if (movimientosSistema.length > 0) {
                    html += renderTable(movimientosSistema, true);
                } else {
                    html += `<p><i>No se registraron movimientos administrativos en esta fecha.</i></p>`;
                }
            } else {
                // Estructura Gerencial (Mes / Año)
                // Evitamos duplicar filas si un evento se creó y sucedió en el mismo mes
                const agendaConsolidada = data.filter(item => item.ActivityType === 'AGENDA_OPERATIVA');
                
                const eventosUnicos = [];
                const idsSet = new Set();
                agendaConsolidada.forEach(ev => {
                    if(ev.DIM_ReservationId && !idsSet.has(ev.DIM_ReservationId)) {
                        idsSet.add(ev.DIM_ReservationId);
                        eventosUnicos.push(ev);
                    }
                });

                html += `<h4>Relación Consolidada de Reservaciones</h4>`;
                html += renderTable(eventosUnicos);
            }
        }

        html += `</div>`;

        // Función auxiliar para renderizar tablas y evitar repetir código
        function renderTable(items, isLog = false) {
            let total = 0;
            let tableHtml = `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${isLog ? 'Fecha Acción' : 'Fecha Evento'}</th>
                            <th>Cliente</th>
                            <th>Ubicación</th>
                            ${isLog ? '<th>Tipo de Movimiento</th>' : '<th>Estado</th>'}
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            items.forEach((item, index) => {
                const monto = parseFloat(item.DIM_TotalAmount) || 0;
                total += monto;
                const fecha = isLog ? item.FullDate : (item.DIM_StartDate ? item.DIM_StartDate.split(' ')[0] : 'N/A');
                
                // Lógica para detectar si es una actualización o creación nueva
                let tipoMovimiento = item.DIM_StatusName;
                if (isLog) {
                    // Si la fecha del evento es diferente a la fecha de hoy, es probable que sea una actualización o registro futuro
                    const eventDate = item.DIM_StartDate.split(' ')[0];
                    tipoMovimiento = eventDate === item.FullDate ? "Nuevo Registro" : "Actualización de Datos";
                }

                tableHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${fecha}</td>
                        <td>${item.DIM_fullname || 'Cliente'}</td>
                        <td>${item.DIM_EventAddress || 'N/A'}</td>
                        <td>${isLog ? `<strong>${tipoMovimiento}</strong>` : item.DIM_StatusName}</td>
                        <td class="text-right">${formatCurrency(monto)}</td>
                    </tr>`;
            });

            tableHtml += `
                    </tbody>
                    <tfoot>
                        <tr class="report-total-row">
                            <td colspan="5" class="text-right"><strong>SUBTOTAL:</strong></td>
                            <td class="text-right"><strong>${formatCurrency(total)}</strong></td>
                        </tr>
                    </tfoot>
                </table>`;
            return tableHtml;
        }

        // 4. Inyectar y disparar
        printArea.innerHTML = html;
        printArea.style.display = 'block'; // Lo hacemos visible solo para la captura de impresión
        
        window.print();

        // 5. Limpiar
        setTimeout(() => {
            printArea.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">print</span> Generar e Imprimir';
        }, 500);

    } catch (error) {
        console.error("Error al generar reporte:", error);
        alert("No se pudo generar el reporte. Revisa la consola."); 
    }
});