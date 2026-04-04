// ✅ modal_pagos.js actualizado con Modal Custom
import { GetContractInfo } from '../../api/api_reservacion_read.js'; 
import { registrarPago } from '../../api/api_fact_revenues_create.js';
import { GetPaymentHistory } from '../../api/api_fact_revenues_historial.js';
import { checkSession } from '../../api/api_auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) return;

    // Obtener sesión para saber qué administrador está registrando el pago
    const session = await checkSession();
    const adminLogueadoId = session?.body?.DIM_ServiceOwnersId;

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

            // 3. Renderizar Historial de Pagos
            renderizarHistorial(data.historial_pagos);
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

        // Cambiar el botón mientras procesa
        const submitBtn = formPago.querySelector('button[type="submit"]');
        const btnOriginalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Procesando...";

        try {
            const result = await registrarPago(payload);
            if (result.success) {
                // 🔥 AQUÍ REEMPLAZAMOS EL ALERT POR TU MODAL BONITO
                await mostrarModalCustom("¡Éxito!", "¡Pago registrado con éxito!", "success");
                
                // En lugar de cerrar inmediatamente, podemos refrescar el historial visualmente
                const nuevoHistorial = await GetPaymentHistory(eventId);
                renderizarHistorial(nuevoHistorial);
                
                // Opcional: Limpiar el input de monto
                if (inputMonto) inputMonto.value = "";
                
                // Opcional: Recargar la tabla en la ventana principal
                window.parent.location.reload(); 
            } else {
                await mostrarModalCustom("Error", result.message || "No se pudo registrar el pago.", "error");
            }
        } catch (error) {
            await mostrarModalCustom("Error de conexión", "Fallo al conectar: " + error.message, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = btnOriginalText;
        }
    });

    // Lógica para cerrar modal desde la X (si la tienes activa)
    document.querySelector('.close-btn')?.addEventListener('click', () => {
        const overlay = window.parent.document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('visible');
    });
});

// =======================================================
// NUEVO: Sistema de Notificaciones (Modal Customizado)
// =======================================================
function mostrarModalCustom(titulo, mensaje, tipo = 'info') {
    return new Promise((resolve) => {
        let colorBoton = "#0d6efd"; // azul por defecto
        if (tipo === 'success') colorBoton = "#198754"; // verde
        if (tipo === 'error') colorBoton = "#dc3545"; // rojo
        if (tipo === 'warning') colorBoton = "#fd7e14"; // naranja

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
            display: flex; justify-content: center; align-items: center;
            z-index: 9999; opacity: 0; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 8px; width: 400px; max-width: 90%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: sans-serif;
            transform: translateY(-20px); transition: transform 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: bold;">${titulo}</h3>
                <button id="btn-cerrar-x" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888;">&times;</button>
            </div>
            <div style="padding: 25px 20px; text-align: center; color: #555; font-size: 1rem;">
                ${mensaje}
            </div>
            <div style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; background: #f8f9fa; border-top: 1px solid #e9ecef; border-radius: 0 0 8px 8px;">
                <button id="btn-aceptar" style="background: ${colorBoton}; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Aceptar</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);

        const cerrarModal = (resultado) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(resultado);
            }, 300);
        };

        modal.querySelector('#btn-cerrar-x').onclick = () => cerrarModal(false);
        modal.querySelector('#btn-aceptar').onclick = () => cerrarModal(true);
    });
}

// =======================================================
// Función para pintar la tabla de historial
// =======================================================
function renderizarHistorial(pagos) {
    const tabla = document.getElementById('tabla-historial');
    const tbody = document.getElementById('tbody-historial');
    const msgSinPagos = document.getElementById('sin-pagos-msg');

    if (!pagos || pagos.length === 0) {
        if (tabla) tabla.style.display = 'none';
        if (msgSinPagos) msgSinPagos.style.display = 'block';
        return;
    }

    // Mostramos la tabla y ocultamos el mensaje de "vacío"
    if (msgSinPagos) msgSinPagos.style.display = 'none';
    if (tabla) tabla.style.display = 'table';

    if (tbody) {
        tbody.innerHTML = pagos.map(p => `
            <tr>
                <td>${p.fecha}</td>
                <td>$${parseFloat(p.monto).toFixed(2)}</td>
                <!--<td>${p.administrador}</td>-->
            </tr>
        `).join('');
    }
}