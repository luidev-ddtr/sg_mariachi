// ✅ modal_pagos.js actualizado
import { GetContractInfo } from '../../api/api_reservacion_read.js'; 
import { registrarPago } from '../../api/api_fact_revenues_create.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) return;

    const inputFecha = document.getElementById('fecha');
    const inputMonto = document.getElementById('monto_pagado');
    const formPago = document.getElementById('form-pago');

    if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

    try {
        const respuesta = await GetContractInfo(eventId);
        const data = respuesta.body ? (Array.isArray(respuesta.body) ? respuesta.body[0] : respuesta.body) : respuesta;

        if (data) {
            // 1. Llenar Header y Resumen
            document.getElementById('contratante_nombre_header').textContent = data.contratante_nombre || "Evento";
            document.getElementById('pago_total_txt').textContent = parseFloat(data.pago_total || 0).toFixed(2);
            document.getElementById('pago_restante_txt').textContent = parseFloat(data.pago_restante || 0).toFixed(2);

            // 🟢 AUTO-LLENAR EL MONTO: Ponemos el total pendiente por defecto
            if (inputMonto) {
                inputMonto.value = parseFloat(data.pago_restante || 0).toFixed(2);
            }

            // 2. Llenar inputs de Nombre
            const nombreCompleto = data.contratante_nombre || "";
            const partes = nombreCompleto.trim().split(/\s+/);
            document.getElementById('nombre').value = partes[0] || "";
            document.getElementById('apellido_paterno').value = partes[1] || "";
            document.getElementById('apellido_materno').value = partes.slice(2).join(' ') || "";
        }
    } catch (error) {
        console.error("Error al cargar datos del evento:", error);
    }

    // 🟢 LÓGICA PARA REGISTRAR EL PAGO
    formPago?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const monto = parseFloat(inputMonto.value);
        const fechaRaw = inputFecha.value; // Formato YYYY-MM-DD
        const fechaId = fechaRaw.replace(/-/g, ''); // Convertimos a formato 20260131 (común en bases de datos DIM_Date)

        const payload = {
            DIM_ReservationId: eventId,
            DIM_DateId: fechaId, 
            Amount: monto
        };

        try {
            const result = await registrarPago(payload);
            if (result.success) {
                alert("¡Pago registrado con éxito!");
                
                // Cerramos el modal
                const overlay = window.parent.document.getElementById('modalOverlay');
                if (overlay) overlay.classList.remove('visible');

                // Opcional: Recargar la tabla en la ventana principal
                window.parent.location.reload(); 
            }
        } catch (error) {
            alert("Error al registrar: " + error.message);
        }
    });

    // Lógica para cerrar modal
    document.querySelector('.close-btn')?.addEventListener('click', () => {
        const overlay = window.parent.document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('visible');
    });
});