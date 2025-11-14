/**
 * @file eventos_archivar.js
 * @description Maneja la lógica del modal de confirmación para archivar
 * y llama a la API de archivado.
 */

// --- CAMBIO 1: Importamos el nombre correcto de tu API ---
import { ArchivarReservacion } from '../../api/api_reservacion_archivar.js'; // (Ajusta la ruta si es necesario)

const setupConfirmationModalListeners = () => {
    const modal = document.getElementById('confirmArchiveModal');
    if (!modal) {
        console.error("No se encontró el modal #confirmArchiveModal");
        return;
    }

    const btnCancel = modal.querySelector('#btn-cancel-archive');
    const btnConfirm = modal.querySelector('#btn-confirm-archive');
    const btnClose = modal.querySelector('.modal-close');

    // Función para cerrar el modal y resetear el botón
    const closeModal = () => {
        modal.style.display = 'none';
        btnConfirm.removeAttribute('data-id');
        btnConfirm.textContent = 'Sí, Archivar';
        btnConfirm.disabled = false;
    };

    btnCancel.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Listener del botón de confirmar
    btnConfirm.addEventListener('click', async () => {
        const reservationId = btnConfirm.dataset.id;
        if (!reservationId) return;

        console.log(`Iniciando archivado para ID: ${reservationId}`);

        try {
            btnConfirm.textContent = 'Archivando...';
            btnConfirm.disabled = true;

            // --- CAMBIO 2: Usamos el nombre correcto de tu función ---
            const response = await ArchivarReservacion(reservationId);
            
            console.log(`Respuesta de la API de archivado:`, response);

            closeModal();
            
            // Disparamos un evento global para avisarle a
            // 'mostrar_reservaciones.js' que debe recargar la tabla.
            window.dispatchEvent(new CustomEvent('reservationArchived'));

        } catch (error) {
            console.error('Error al archivar la reservación:', error);
            alert(`Hubo un error al archivar: ${error.message}`);
            // Reseteamos el botón solo en caso de error
            btnConfirm.textContent = 'Sí, Archivar';
            btnConfirm.disabled = false;
        }
    });
};

// Inicializar este script
document.addEventListener('DOMContentLoaded', setupConfirmationModalListeners);