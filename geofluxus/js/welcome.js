// Welcome
require(['leaflet', 'leaflet/dist/leaflet.css'],
function (L) {
    var map = L.map('welcome-map', { zoomControl: false })
               .setView([52, 5], 8);

    var background = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        attribution = '© OpenStreetMap contributors, © CartoDB';

    L.tileLayer(background, {
                attribution: attribution,
                maxZoom: 8,
                minZoom: 8
    }).addTo(map);

    // Interactive non-responsive
    map._handlers.forEach(function(handler) {
        handler.disable();
    });
})