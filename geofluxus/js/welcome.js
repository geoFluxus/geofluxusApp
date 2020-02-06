// Welcome
require(['leaflet', 'leaflet/dist/leaflet.css'],
function (L) {
    var map = L.map('welcome-map', { zoomControl: false })
               .setView([52, 5], 8);

    var background = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        attribution = '© OpenStreetMap contributors, © CartoDB';

    L.tileLayer(background, {
                attribution: attribution,
                minZoom: 1,
                maxZoom: 20,
    }).addTo(map);

    // Interactive non-responsive
//    map._handlers.forEach(function(handler) {
//        handler.disable();
//    });

//    // Store XMLHttpRequest and the JSON file location in variables
//    var flat = 52.37, flon = 4.90,
//        tlat = 51.50, tlon = 0.12;
//    var xhr = new XMLHttpRequest();
//    var cors = 'http://localhost:8080/',
//        url = 'http://www.yournavigation.org/api/1.0/gosmore.php?format=geojson&',
//        request = 'flat=' + flat +
//                  '&flon='+ flon +
//                  '&tlat='+ tlat +
//                  '&tlon='+ tlon +
//                  '&v=motorcar&fast=1';
//
//    // Called whenever the readyState attribute changes
//    xhr.onreadystatechange = function() {
//      // Check if fetch request is done
//      if (xhr.readyState == 4 && xhr.status == 200) {
//        // Parse the JSON string
//        var data = JSON.parse(xhr.responseText),
//            coords = data['coordinates'];
//        // Reverse coordinates
//        coords.forEach(function(coord){
//            coord.reverse();
//        })
//        var polyline = new L.polyline(coords, {color: 'white'}).addTo(map);
//      }
//    };
//
//    // Do the HTTP call using the url variable we specified above
//    xhr.open("GET", cors + url + request, true);
//    xhr.send();
})