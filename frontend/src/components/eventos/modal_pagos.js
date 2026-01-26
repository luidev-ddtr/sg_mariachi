// ✅ modal_pagos.js
import { GetContractInfo } from '../../api/api_reservacion_read.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) return;

    // Fecha de hoy por defecto
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

    try {
        const respuesta = await GetContractInfo(eventId);
        // Entramos al body de la respuesta según lo visto en tu consola
        const data = respuesta.body ? (Array.isArray(respuesta.body) ? respuesta.body[0] : respuesta.body) : respuesta;

        if (data) {
            // 1. Llenar Header y Resumen (pago_total, pago_restante, contratante_nombre)
            const elNombreHeader = document.getElementById('contratante_nombre_header');
            const elTotal = document.getElementById('pago_total_txt');
            const elRestante = document.getElementById('pago_restante_txt');

            if (elNombreHeader) elNombreHeader.textContent = data.contratante_nombre || "Evento";
            if (elTotal) elTotal.textContent = parseFloat(data.pago_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
            if (elRestante) elRestante.textContent = parseFloat(data.pago_restante || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

            // 2. Llenar inputs de Nombre (Separando el string contratante_nombre)
            const nombreCompleto = data.contratante_nombre || "";
            if (nombreCompleto) {
                const partes = nombreCompleto.trim().split(/\s+/);
                if (partes.length > 0) document.getElementById('nombre').value = partes[0];
                if (partes.length > 1) document.getElementById('apellido_paterno').value = partes[1];
                if (partes.length > 2) document.getElementById('apellido_materno').value = partes.slice(2).join(' ');
            }
        }
    } catch (error) {
        console.error("Error al cargar datos del evento:", error);
    }

    // Lógica para cerrar modal
    document.querySelector('.close-btn')?.addEventListener('click', () => {
        const overlay = window.parent.document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('visible');
    });
});