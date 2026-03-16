// Hacemos las variables globales para acceder desde registro-evento.js
window.map = null;
window.marker = null;

async function initMap() {
    // Coordenadas iniciales (Ixmiquilpan, Hidalgo). [1]
    const initialPosition = { lat: 20.47841, lng: -99.21697 };

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    window.map = new Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
        mapId: "SG_MARIACHI_MAP_ID", // ID de mapa personalizado
    });

    // Crear un marcador en la posición inicial
    window.marker = new AdvancedMarkerElement({
        map: window.map,
        position: initialPosition,
        gmpDraggable: true, // Permite que el marcador se pueda arrastrar
        title: "Ubicación del evento"
    });
}