var GeoHeatMap = require('react/geoHeatMap').default;

define(['views/common/baseview',
        'utils/utils',
        'save-svg-as-png',
        'file-saver',
        'utils/enrichFlows',
        'visualizations/d3SankeyCircular',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'react',
        'react-dom',
    ],

    function (
        BaseView,
        utils,
        saveSvgAsPng,
        FileSaver,
        enrichFlows,
        D3SankeyCircular,
        _,
        d3,
        d3plus,
        React,
        ReactDOM,
    ) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/GeoHeatMapView
         * @augments module:views/BaseView
         */
        var GeoHeatMapView = BaseView.extend(
            /** @lends module:views/GeoHeatMapView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    GeoHeatMapView.__super__.initialize.apply(this, [options]);

                    var _this = this;
                    this.options = options;

                    if ($(this.options.el).html() == "") {
                        $(this.options.el).append('<div id="geoheatmap" style="width: 100% !important"></div>');;
                    }
                    this.options.el = this.options.el + " div";
                    this.flows = this.options.flows;

                    this.filtersView = this.options.flowsView.filtersView;
                    this.dim1 = this.options.dimensions[0];
                    this.dim2 = this.options.dimensions[1];

                    this.isActorLevel = _this.options.dimensions.isActorLevel;
                    this.label = this.options.dimensions.label;

                    // this.props = {
                    //     'activitygroup': 'Activity group',
                    //     'activity': 'Activity',
                    //     'processgroup': 'Treatment method group',
                    //     'process': 'Treatment method',
                    // }

                    this.radiusMap = {
                        "1": 25000,
                        "2": 10000,
                        "3": 7500, 
                        "4": 3000
                    }

                    this.radius = this.radiusMap[this.dim1[1].adminlevel];

                    this.isDarkMode = true;
                    this.fontColor = "white";


                    this.flows.forEach(function (propertyName, index) {
                        if (_this.isActorLevel) {
                            this[index] = [this[index].actorLon, this[index].actorLat, this[index].amount];
                        } else {
                            this[index] = [this[index].areaLon, this[index].areaLat, this[index].amount];
                        }
                    }, this.flows);


                    window.addEventListener('resize', function () {
                        _this.render();
                    })

                    this.render();
                    this.options.flowsView.loader.deactivate();
                },

                events: {

                },

                render: function () {
                    var _this = this;

                    ReactDOM.render(React.createElement(GeoHeatMap, {
                        data: _this.flows,
                        radius: _this.radius,
                        label: _this.label,
                    }), document.querySelector(this.options.el));
                    utils.scrollToVizRow();

                    setTimeout(() => {
                        this.addButtons();
                    }, 300);
                },

                addButtons: function () {
                    let buttonFullscreen = d3.select(".fullscreen-toggle")
                    if (buttonFullscreen.empty()) {

                        let _this = this;
                        let controlContainer = d3.select(".mapboxgl-ctrl-top-left")

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button fullscreen-toggle")
                            .attr("title", "View this visualization in fullscreen mode.")
                            .attr("type", "button")
                            .html('<i class="fas fa-expand icon-fullscreen"></i>')
                            .on("click", function () {
                                _this.toggleFullscreen();
                            });

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button export-csv")
                            .attr("title", "Export the data of this visualization as a CSV file.")
                            .attr("type", "button")
                            .html('<i class="fas fa-file icon-export"></i>')
                            .on("click", function () {
                                _this.exportCSV();
                                d3.event.preventDefault();
                            });

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-darkmode")
                            .attr("title", "Toggle light or dark mode.")
                            .attr("type", "button")
                            .html('<i class="fas icon-toggle-darkmode"></i>')
                            .on("click", function () {
                                _this.toggleDarkMode();
                            });
                    }
                },

                toggleFullscreen: function (event) {
                    $(this.options.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.options.el).hasClass('fullscreen')) {
                        window.scrollTo({
                            top: $(".visualizationRow")[0].getBoundingClientRect().top + window.pageYOffset - 20,
                            block: "start",
                            inline: "nearest",
                        });
                    }
                    this.render();
                },

                exportCSV: function () {
                    const items = this.exportData.links;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

                    let fields = ["value", "source", "target"];
                    let header = Object.keys(items[0]);
                    header = header.filter(prop => {
                        return fields.some(f => prop.includes(f))
                    })

                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");
                },

                close: function () {
                    try {
                        if (document.querySelector("#geoheatmap").html() != "") {
                            console.log("closing");
                            ReactDOM.unmountComponentAtNode(document.querySelector("#geoheatmap"));

                            // Backbone.View.prototype.remove.call(this);
                            this.undelegateEvents(); // remove click events
                            this.unbind(); // Unbind all local event bindings
                        }
                    } catch (error) {

                    }
                },

            });
        return GeoHeatMapView;
    }
);