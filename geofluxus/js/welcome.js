require(['d3', 'underscore', 'openlayers', 'openlayers/css/ol.css', 'base'],
function (d3, _, ol, config) {
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
                    attributions: [
                        '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use" target="_blank">Wikimedia maps</a> | Map data © ',
                        ol.source.OSM.ATTRIBUTION
                    ],
                })
            })
        ],
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }),
        interactions: ol.interaction.defaults({
            doubleClickZoom :false,
            dragAndDrop: false,
            keyboardPan: false,
            keyboardZoom: false,
            mouseWheelZoom: false,
            pointer: false,
            dragZoom: false,
            select: false
        }),
        target: 'welcome-map',
        view: new ol.View({
            center: ol.proj.fromLonLat([9, 50]),
            zoom: 5
        })
    });
})