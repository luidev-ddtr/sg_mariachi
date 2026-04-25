// Hacemos las variables globales para acceder desde registro-evento.js
window.map = null;
window.marker = null;
window.geocoder = null;

async function initMap() {
    // Coordenadas iniciales (Ixmiquilpan, Hidalgo)
    const initialPosition = { lat: 20.47841, lng: -99.21697 };

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { Geocoder } = await google.maps.importLibrary("geocoding");

    window.map = new Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
        mapId: "SG_MARIACHI_MAP_ID", // ID de mapa personalizado
    });

    // Inicializamos el motor de búsqueda de direcciones
    window.geocoder = new Geocoder();

    // Crear un marcador en la posición inicial
    window.marker = new AdvancedMarkerElement({
        map: window.map,
        position: initialPosition,
        gmpDraggable: true, // Permite que el marcador se pueda arrastrar
        title: "Ubicación del evento"
    });

    // Listener para mover el marcador al lugar donde se haga clic
    window.map.addListener("click", (event) => {
        const clickedLocation = event.latLng;
        window.marker.position = clickedLocation;
        console.log("Punto marcado por clic:", clickedLocation.lat(), clickedLocation.lng());
    });

    // Listener opcional: Detectar cuando el usuario termina de arrastrar el marcador
    window.marker.addListener("dragend", () => {
        const position = window.marker.position;
        console.log("Nueva ubicación manual:", position.lat, position.lng);
    });
}

/**
 * Función para buscar y centrar el mapa basándose en texto.
 * Puede llamarse desde los eventos 'change' o 'blur' de tus inputs en registro-evento.js
 */
window.buscarDireccion = function() {
    const calle     = document.getElementById('direccion')?.value || "";
    const municipio = document.getElementById('municipio')?.value || "";
    const estado    = document.getElementById('estado')?.value || "";

    if (!window.geocoder || (!calle && !municipio)) return;

    // Construimos la cadena de búsqueda (Query)
    const addressQuery = `${calle}, ${municipio}, ${estado}, México`;

    window.geocoder.geocode({ address: addressQuery }, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;

            // 1. Centramos el mapa en el resultado
            window.map.setCenter(location);
            window.map.setZoom(17); // Zoom más cercano para mayor precisión
            
            // 2. Movemos el marcador a la nueva posición
            window.marker.position = location;
        } else {
            console.warn("No se pudo encontrar la dirección por la siguiente razón: " + status);
        }
    });
};