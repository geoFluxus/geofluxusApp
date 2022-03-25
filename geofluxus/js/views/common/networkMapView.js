define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/d3plus',
        'visualizations/networkMap',
        'file-saver',
        'utils/utils',
        'utils/enrichFlows',
        'openlayers',
        'html2canvas',
    ],

    function (
        BaseView,
        _,
        Collection,
        d3plus,
        NetworkMap,
        FileSaver,
        utils,
        enrichFlows,
        ol,
        html2canvas,
    ) {
        /**
         * @author Evert Van Hirtum
         * @name module:views/NetworkMapView
         * @augments module:views/BaseView
         */
        var NetworkMapView = BaseView.extend(
            /** @lends module:views/NetworkMapView.prototype */
            {
                /**
                 * @param {Object} options
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    NetworkMapView.__super__.initialize.apply(this, [options]);

                    var _this = this;
                    this.options = options;
                    this.flows = this.options.flows;
                    this.isDarkMode = true;
                    this.showNetwork = true;

                    this.label = options.dimensions.label;
                    this.tooltipConfig = {
                        tbody: [
                            [this.label, function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };
                    this.title = `${this.label} Wegenkaart`;

                    this.render();
                },

                events: {
                    'click .close-toggle': 'toggleClose',
                    'click .fullscreen-toggle': 'toggleFullscreen',
                },

                render: function () {
                    var _this = this;

                    $(".viz-wrapper-title").html("");
                    $(".viz-wrapper-title").append(`Visualisatie: ${this.title}`);

                    this.NetworkMap = new NetworkMap({
                        el: this.options.el,
                        flows: this.flows,
                        label: this.options.label,
                        darkMode: this.isDarkMode,
                        showNetwork: this.showNetwork
                    })

                    // Add extra buttons to fullscreenButton container on the top left of the map:
                    let fullscreenButtonDiv = document.querySelector(".networkmap-wrapper .ol-full-screen");

                    // var exportImgBtn = document.createElement('button');
                    // exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    // exportImgBtn.title = "Export this visualization as a PNG file.";
                    // fullscreenButtonDiv.appendChild(exportImgBtn);
                    // exportImgBtn.addEventListener('click', function (event) {
                    //     _this.exportPNG();
                    // })

                    // // Export CSV
                    // var exportCSVBtn = document.createElement('button');
                    // exportCSVBtn.classList.add('fas', 'fa-file', 'btn', 'btn-primary', 'inverted');
                    // exportCSVBtn.title = "Export this visualization as a CSV file.";
                    // fullscreenButtonDiv.appendChild(exportCSVBtn);
                    // exportCSVBtn.addEventListener('click', function(event) {
                    //     _this.exportCSV();
                    // })

                    $(".export-csv").on("click", function() {
                        _this.exportCSV();
                    })

                    $(".export-png").on("click", function() {
                        _this.exportPNG();
                    })

                    buttons = {
                        'legend': 'Toggle the legend on or off.',
                        'darkmode': 'Toggle light or dark mode.',
                        'network': 'Toggle the network on or off.'
                    }
                    Object.entries(buttons).forEach(function (button) {
                        [icon, title] = button;
                        var className = icon.split('-').pop(),
                            btn = document.createElement('button');

                        btn.classList.add("btn", "btn-primary", "toggle-" + className);
                        btn.title = title;
                        btn.innerHTML = '<i class="fas icon-toggle-' + icon + '"></i>';

                        fullscreenButtonDiv.appendChild(btn);
                    })

                    $(".toggle-legend").click(function () {
                        _this.toggleLegend();
                    });
                    $(".toggle-darkmode").click(function () {
                        _this.toggleDarkMode();
                    });
                    $(".toggle-network").click(function () {
                        _this.toggleNetwork();
                    });

                    var zoomBtnDiv = document.querySelector(".networkmap-wrapper .ol-zoom");
                    var resetMapViewBtn = document.createElement('button');
                    resetMapViewBtn.classList.add("btn-reset-view")
                    resetMapViewBtn.title = "Reset the map to the original position."
                    resetMapViewBtn.innerHTML = '<i class="fas fa-undo"></i>';
                    $(".leaflet-control-zoom.leaflet-bar.leaflet-control").append(resetMapViewBtn);
                    resetMapViewBtn.addEventListener('click', function (event) {
                        _this.NetworkMap.map.centerOnLayer('network');
                    })
                    zoomBtnDiv.appendChild(resetMapViewBtn);

                    // Center network or scroll to viz on fullscreen enter/exit:
                    document.addEventListener('fullscreenchange', (event) => {
                        if (document.fullscreenElement) {
                            _this.NetworkMap.map.centerOnLayer('flows');
                        } else {
                            _this.NetworkMap.map.centerOnLayer('flows');
                            _this.scrollToVisualization();
                        }
                    });

                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                },

                scrollToVisualization: function () {
                    utils.scrollToVizRow();
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                        $("body").css("overflow", "visible");
                    } else {
                        $("body").css("overflow", "hidden");
                    }

                    window.dispatchEvent(new Event('resize'));
                    event.stopImmediatePropagation();
                },

                toggleLegend: function () {
                    $("#networkmap-legend").fadeToggle();
                },

                toggleNetwork: function () {
                    $(this.options.el).html("");
                    this.showNetwork = !this.showNetwork;
                    this.render();
                },

                toggleDarkMode: function () {
                    $(this.options.el).html("");
                    $(".visualizationBlock .card").toggleClass("lightMode");
                    this.isDarkMode = !this.isDarkMode;
                    this.render();
                },

                exportPNG: function () {
                    var c = document.querySelector(".networkmap-wrapper canvas");
                    var d = c.toDataURL("image/png");
                    var w = window.open('about:blank', 'image from canvas');
                    w.document.write("<img src='" + d + "' alt='from canvas'/>");

                    var canvas = document.querySelector(".networkmap-wrapper canvas");
                    canvas.toBlob(function (blob) {
                        FileSaver.saveAs(blob, "network-map.png");
                    });
                },

                 exportCSV: function (event) {
                     // copy links! we will modify them
                     let items = this.flows.map(a => Object.assign({}, a));
                     items = items.filter(flow => flow.amount > 0);

                     const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
                     const header = Object.keys(items[0])

                     // convert geometry to WKT
                     items.forEach(function(item) {
                        var type = item.geometry.type
                            coords = item.geometry.coordinates;
                        var wkt = "";
                        Object.values(coords).forEach(function(point) {
                            wkt += point.join(' ') + ', ';
                        })
                        wkt = wkt.slice(0, -2);
                        wkt = type.toUpperCase() + '(' + wkt + ')';
                        item.geometry = wkt;
                     })
                     console.log(this.flows)

                     let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                     csv.unshift(header.join(','))
                     csv = csv.join('\r\n')

                     var blob = new Blob([csv], {
                         type: "text/plain;charset=utf-8"
                     });
                     FileSaver.saveAs(blob, "data.csv");
                 },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return NetworkMapView;
    }
);