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
        // 'react/geoHeatMap',
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
        // GeoHeatMap
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
                    this.filtersView = this.options.flowsView.filtersView;
                    this.dim1 = this.options.dimensions[0];
                    this.dim2 = this.options.dimensions[1];
                    this.flows = this.options.flows;

                    this.label = this.options.dimensions.label;

                    this.props = {
                        'activitygroup': 'Activity group',
                        'activity': 'Activity',
                        'processgroup': 'Treatment method group',
                        'process': 'Treatment method',
                    }

                    $(this.options.el).css({
                        "display": "flex",
                        "align-items": "center"
                    })

                    this.isDarkMode = true;
                    this.fontColor = "white";



                    // this.flows = this.enrichFlows(this.flows)

                    window.addEventListener('resize', function () {
                        _this.render();
                    })

                    this.render();
                    this.options.flowsView.loader.deactivate();
                },

                events: {

                },

                render: function () {
                    // if (this.geoHeatMap) {
                    //     this.geoHeatMap.close();
                    // }

                    // this.width = $(this.options.el).width() - 150;
                    // this.height = $(this.options.el).height() - 150;

                    // this.geoHeatMap = new D3SankeyCircular({
                    //     el: this.options.el,
                    //     // width: this.width,
                    //     // height: this.height,
                    //     data: this.flows,
                    //     fontColor: this.fontColor,
                    //     label: this.label,
                    //     isDarkMode: this.isDarkMode,
                    //     showNodeLabels: this.showNodeLabels,
                    //     showArrows: this.showArrows,
                    //     linkColourOptions: this.linkColourOptions,
                    //     arrowOptions: this.arrowOptions,
                    // })


                    // Source data CSV
                    const DATA_URL = 'http://127.0.0.1:8000/static/data.csv';
                    var data;

                    require('d3-request').csv(DATA_URL, (error, response) => {
                        if (!error) {
                            data = response.map(d => [Number(d.lng), Number(d.lat), Number(d.value)]);

                            ReactDOM.render(React.createElement(GeoHeatMap, {
                                data: data,
                            }), document.querySelector(this.options.el));
                            utils.scrollToVizRow();
                            return this;

                        }
                    });



                    //this.addButtons();
                },

                // addButtons: function () {
                //     let buttonFullscreen = d3.select(".fullscreen-toggle")
                //     if (buttonFullscreen.empty()) {

                //         let _this = this;
                //         let vizContainer = d3.select(this.options.el);
                //         vizContainer.append("div")
                //             .attr("class", "sankeyControlContainer")
                //             .style("top", "0px")
                //             .lower();

                //         let sankeyControlContainer = vizContainer.select(".sankeyControlContainer")

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button fullscreen-toggle")
                //             .attr("title", "View this visualization in fullscreen mode.")
                //             .attr("type", "button")
                //             .html('<i class="fas fa-expand icon-fullscreen"></i>')
                //             .on("click", function () {
                //                 _this.toggleFullscreen();
                //             });

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button export-csv")
                //             .attr("title", "Export the data of this visualization as a CSV file.")
                //             .attr("type", "button")
                //             .html('<i class="fas fa-file icon-export"></i>')
                //             .on("click", function () {
                //                 _this.exportCSV();
                //                 d3.event.preventDefault();
                //             });

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-darkmode")
                //             .attr("title", "Toggle light or dark mode.")
                //             .attr("type", "button")
                //             .html('<i class="fas icon-toggle-darkmode"></i>')
                //             .on("click", function () {
                //                 _this.toggleDarkMode();
                //             });

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-nodelabels")
                //             .attr("title", "Toggle the labels above the nodes.")
                //             .attr("type", "button")
                //             .html('<i class="fa fa-tag icon-toggle-nodelabels"></i>')
                //             .on("click", function () {
                //                 _this.toggleNodeLabels();
                //             });

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-linkColor")
                //             .attr("title", "Toggle the colours of the Sankey links.")
                //             .attr("type", "button")
                //             .html('<i class="fa icon-toggle-sankey-link-color"></i>')
                //             .on("click", function () {
                //                 _this.toggleLinkColor();
                //             });

                //         sankeyControlContainer.append("button")
                //             .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-linkArrows")
                //             .attr("title", "Toggle between arrows or animated dashes in the Sankey links.")
                //             .attr("type", "button")
                //             .html('<i class="fa fa-arrow-right icon-toggle-linkArrows"></i>')
                //             .on("click", function () {
                //                 _this.toggleArrows();
                //             });
                //     }
                // },

                // toggleFullscreen: function (event) {
                //     $(this.options.el).toggleClass('fullscreen');
                //     // Only scroll when going to normal view:
                //     if (!$(this.options.el).hasClass('fullscreen')) {
                //         window.scrollTo({
                //             top: $(".visualizationRow")[0].getBoundingClientRect().top + window.pageYOffset - 20,
                //             block: "start",
                //             inline: "nearest",
                //         });
                //     }
                //     this.render();
                // },

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
                    $(this.options.el).css({
                        "display": "none",
                    })
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return GeoHeatMapView;
    }
);