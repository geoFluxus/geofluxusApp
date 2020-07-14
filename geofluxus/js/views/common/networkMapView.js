define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/d3plus',
        'visualizations/networkMap',
        'file-saver',
        'utils/utils',
        'utils/enrichFlows',
        'openlayers',
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

                    this.label = options.dimensions.label;
                    this.tooltipConfig = {
                        tbody: [
                            [this.label, function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };

                    this.fetchNetworkThenRender();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                render: function () {
                    var _this = this;

                    this.NetworkMap = new NetworkMap({
                        el: this.options.el,
                        flows: this.flows,
                        network: this.network,
                        label: this.options.label,
                        darkMode: this.isDarkMode,
                    })

                    // Add extra buttons to fullscreenButton container on the top left of the map:
                    let fullscreenButtonDiv = document.querySelector(".networkmap-wrapper .ol-full-screen");

                    var exportImgBtn = document.createElement('button');
                    exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    exportImgBtn.title = "Export this visualization as a PNG file.";
                    fullscreenButtonDiv.appendChild(exportImgBtn);
                    exportImgBtn.addEventListener('click', function (event) {
                        _this.exportPng();
                    })

                    buttons = {
                        'legend': 'Toggle the legend on or off.',
                        'darkmode': 'Toggle light or dark mode.',
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

                    // ------------

                    var zoomBtnDiv = document.querySelector(".networkmap-wrapper .ol-zoom");

                    var resetMapViewBtn = document.createElement('button');
                    resetMapViewBtn.classList.add("btn-reset-view")
                    resetMapViewBtn.title = "Reset the map to the original position."
                    resetMapViewBtn.innerHTML = '<i class="fas fa-undo"></i>';
                    $(".leaflet-control-zoom.leaflet-bar.leaflet-control").append(resetMapViewBtn);
                    resetMapViewBtn.addEventListener('click', function (event) {
                        _this.NetworkMap.map.centerOnLayer('network');
                        // event.preventDefault(event);
                    })
                    zoomBtnDiv.appendChild(resetMapViewBtn);

                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                },

                fetchNetworkThenRender: function () {
                    var _this = this;

                    this.network = new Collection([], {
                        apiTag: 'ways',
                    });
                    this.network.fetch({
                        success: function () {
                            _this.render();
                            _this.options.flowsView.loader.deactivate();
                        },
                        error: function (res) {
                            _this.options.flowsView.loader.deactivate();
                            console.log(res);
                        }
                    });
                },

                scrollToVisualization: function () {
                    utils.scrollToVizRow();
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                    }
                    window.dispatchEvent(new Event('resize'));
                    event.stopImmediatePropagation();
                },

                toggleLegend: function () {
                    $("#networkmap-legend").fadeToggle();
                },

                toggleDarkMode: function () {
                    $(this.options.el).html("");
                    this.isDarkMode = !this.isDarkMode;
                    this.render();
                },

                exportPng: function () {
                    var _this = this;
                    this.NetworkMap.map.map.once('postcompose', function (event) {
                        var dataURL;
                        var canvas = event.context.canvas;
                        if (ol.has.DEVICE_PIXEL_RATIO == 1) {
                            dataURL = canvas.toDataURL('image/png');
                        } else {
                            var targetCanvas = document.createElement('canvas');
                            var size = _this.NetworkMap.map.map.getSize();
                            targetCanvas.width = size[0];
                            targetCanvas.height = size[1];
                            targetCanvas.getContext('2d').drawImage(canvas,
                                0, 0, canvas.width, canvas.height,
                                0, 0, targetCanvas.width, targetCanvas.height);
                            dataURL = targetCanvas.toDataURL('image/png');
                        }
                    });
                    this.NetworkMap.map.map.renderSync();


                    // var c = document.querySelector(".networkmap-wrapper canvas");
                    // var d = c.toDataURL("image/png");
                    // var w = window.open('about:blank', 'image from canvas');
                    // w.document.write("<img src='" + d + "' alt='from canvas'/>");


                    // var canvas = document.querySelector(".networkmap-wrapper canvas");
                    // canvas.toBlob(function (blob) {
                    //     saveAs(blob, "network-map.png");
                    // });
                },
                // exportCSV: function (event) {
                //     const items = this.options.flows;
                //     const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
                //     const header = Object.keys(items[0])
                //     let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                //     csv.unshift(header.join(','))
                //     csv = csv.join('\r\n')

                //     var blob = new Blob([csv], {
                //         type: "text/plain;charset=utf-8"
                //     });
                //     FileSaver.saveAs(blob, "data.csv");

                //     event.stopImmediatePropagation();
                // },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return NetworkMapView;
    }
);