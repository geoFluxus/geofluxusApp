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
                        $(this.options.el).append('<div id="geoheatmap" style="width: 100%; height: 100%; position: relative"></div>');;
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
                        "1000": 3000
                    }

                    this.areaLevel = this.filtersView.collections.arealevels.find(areaLevelObject => areaLevelObject.attributes.id == this.dim1[1].adminlevel).attributes.level;

                    this.radius = this.radiusMap[this.areaLevel];

                    this.isDarkMode = true;
                    this.fontColor = "white";


                    this.flows.forEach(function (flow, index) {
                        if (_this.isActorLevel) {
                            this[index] = [this[index].actorLon, this[index].actorLat, this[index].amount];
                        } else {
                            this[index] = [this[index].areaLon, this[index].areaLat, this[index].amount, this[index].areaName];
                        }
                    }, this.flows);

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
                        isActorLevel: _this.isActorLevel,
                        isDarkMode: _this.isDarkMode,
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

                        let vizContainer = d3.select("#geoheatmap");
                        vizContainer.append("div")
                            .attr("class", "controlContainer")
                            .style("top", "0px")
                            .style("position", "relative")
                            .style("z-index", "100")
                            .lower();

                        let controlContainer = vizContainer.select(".controlContainer")

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
                    $("#geoheatmap").toggleClass('fullscreen');
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

                toggleDarkMode: function () {
                    this.isDarkMode = !this.isDarkMode;
                    if (this.isDarkMode) {
                        const mapStyle = "mapbox://styles/mapbox/dark-v9"
                    } else {
                        const mapStyle = "mapbox://styles/mapbox/light-v9"
                    }

                    $(".viz-wrapper-div").toggleClass("lightMode");
                    this.fontColor = this.isDarkMode ? "white" : "black";
                    this.render();
                },

                exportCSV: function () {
                    const items = this.options.flows;
                    var csv = "Longitude,Lattitude,Amount,Name\n" + items.map(function (d) {
                        return d.join();
                    }).join('\r\n');

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");
                },

                close: function () {
                    try {
                        var isNotEmpty = document.querySelector("#geoheatmap").html() != "";
                        if (isNotEmpty) {
                            console.log("Element is not empty")
                        }
                        ReactDOM.unmountComponentAtNode(document.querySelector("#geoheatmap"));
                        this.undelegateEvents(); // remove click events
                        this.unbind(); // Unbind all local event bindings
                    } catch (error) {

                    }
                },

            });
        return GeoHeatMapView;
    }
);