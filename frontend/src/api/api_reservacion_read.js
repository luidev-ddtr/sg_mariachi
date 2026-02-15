// ✅ api_reservacion_read.js (VERSIÓN HACK FRONTAL PARA MESES)
import axiosInstance from "./axiosInstance";

export const GetReservaciones = async (dateParam) => {
    try {
        if (!dateParam) return [];

        let year, month;
        
        // 1. Detectamos si nos enviaron solo "YYYY-MM" (desde nuestro nuevo input de mes)
        if (dateParam.length === 7) {
            [year, month] = dateParam.split('-');
        } else {
            // Si por alguna razón llega un formato completo o un objeto Date
            const d = new Date(dateParam);
            year = d.getFullYear();
            month = String(d.getMonth() + 1).padStart(2, '0');
        }

        // 2. Definimos los días clave para "barrer" todas las semanas del mes
        const daysToFetch = ['01', '08', '15', '22', '28'];
        
        console.log(`Buscando todas las semanas del mes: ${year}-${month}...`);

        // 3. Disparamos todas las peticiones al mismo tiempo (Rendimiento máximo)
        const requests = daysToFetch.map(day => {
            const fullDate = `${year}-${month}-${day}`; // Formato YYYY-MM-DD que el backend SÍ acepta
            return axiosInstance.get('reservation/read', { params: { date: fullDate } })
                .then(res => res.data.body || [])
                .catch(err => {
                    console.warn(`Error silencioso al pedir la fecha ${fullDate}:`, err.message);
                    return []; // Si falla una semana, no tumbamos el resto
                });
        });

        const results = await Promise.all(requests);

        // 4. Unimos todas las semanas en un solo arreglo gigante
        const todasLasSemanas = results.flat();

        // 5. Limpiamos duplicados (porque un evento puede aparecer en dos semanas solapadas)
        // y aseguramos que el evento realmente pertenezca al mes que queremos.
        const reservacionesUnicas = [];
        const idsVistos = new Set();

        for (const evento of todasLasSemanas) {
            if (!idsVistos.has(evento.DIM_ReservationId)) {
                idsVistos.add(evento.DIM_ReservationId);
                
                // Filtro extra de seguridad: Verificar que la fecha inicie con nuestro YYYY-MM
                if (evento.DIM_StartDate && evento.DIM_StartDate.startsWith(`${year}-${month}`)) {
                    reservacionesUnicas.push(evento);
                }
            }
        }

        console.log(`Total de eventos únicos encontrados en ${year}-${month}:`, reservacionesUnicas.length);
        return reservacionesUnicas;

    } catch (error) {
        console.error("Error crítico al armar el mes:", error);
        throw new Error('No se pudo obtener la información del mes.');
    }
};

/**
 * ¡FUNCIÓN CLAVE! Obtiene una reservación por su ID.
 * (Corregida para que use el mes actual correctamente)
 */
export const GetReservacionPorId = async (id) => {
    // Mandamos el mes actual en formato YYYY-MM para que pase por nuestro nuevo sistema
    const mesActual = new Date().toISOString().substring(0, 7);
    const todasLasReservaciones = await GetReservaciones(mesActual);
    
    // Buscamos la reservación que coincida con el ID
    const evento = todasLasReservaciones.find(item => item.DIM_ReservationId == id);
    return evento || null;
};

// ==============================================
// Mantenemos GetContractInfo exactamente igual
// ==============================================
export const GetContractInfo = async (id) => {
    try {
        if (!id) return null;
        console.log("ID enviado a api/reservation/get_contract:", id);
        const data = { 'DIM_ReservationId': id };
        
        const response = await axiosInstance.post('reservation/get_contract', data);
        console.log("Respuesta del servidor al obtener contrato:", response.data);
        return response.data.body;
    } catch (error) {
        let errorMessage = 'Error desconocido al obtener la información del contrato';
        if (error.response) {
            console.error("Error de respuesta:", error.response.data);
            errorMessage = error.response.data?.message || error.response.data?.error || `Error ${error.response.status}`;
        } else {
            console.error("Error de configuración:", error.message);
            errorMessage = error.message || 'Error al configurar la petición';
        }
        throw new Error(errorMessage);
    }
};