define(['views/common/baseview',
        'underscore',
        'd3',
        'd3plus',
        'visualizations/linePlot',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils'
    ],

    function (
        BaseView,
        _,
        d3,
        d3plus,
        LinePlot,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/LinePlotView
         * @augments module:views/BaseView
         */
        var LinePlotView = BaseView.extend(
            /** @lends module:views/LinePlotView.prototype */
            {
                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    LinePlotView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    this.options = options;

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                render: function (data) {
                    let flows = this.options.flows;

                    let dimensionsActual = [];
                    this.options.dimensions.forEach(dim => dimensionsActual.push(dim[0]));

                    let hasMultipleLines = this.options.hasMultipleLines;
                    let tooltipConfig;
                    let groupBy;
                    let x;


                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {

                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            x = ["year"];
                            tooltipConfig = {
                                title: "Waste totals per year",
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Year", function (d) {
                                        return d.year
                                    }]
                                ]
                            }

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];

                            if (hasMultipleLines) {
                                groupBy = ["year"];
                                x = ["monthName"];
                            }

                            tooltipConfig = {
                                title: "Waste totals per month",
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Month", function (d) {
                                        return d.month
                                    }]
                                ]
                            }
                        }
                        
                    }

                    // //////////////////////////////////////////
                    // Two dimensions
                    if (dimensionsActual.includes("time") && dimensionsActual.includes("space")) {
                        groupBy = ["areaName"];

                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {

                            x = ["year"];
                            tooltipConfig = {
                                title: "Waste totals per year",
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Year", function (d) {
                                        return d.year
                                    }],
                                    ["Area", function (d) {
                                        return d.areaName
                                    }]
                                ]
                            }

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];
                            tooltipConfig = {
                                title: "Waste totals per month",
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Month", function (d) {
                                        return d.month
                                    }],
                                    ["Area", function (d) {
                                        return d.areaName
                                    }]
                                ]
                            }
                        }

                    }

                    // Create a new D3Plus linePlot object which will be rendered in this.options.el:
                    this.linePlot = new LinePlot({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        x: x,
                        tooltipConfig: tooltipConfig,

                    });
                },

                toggleFullscreen: function (event) {
                    this.el.classList.toggle('fullscreen');
                    this.refresh();
                    event.stopImmediatePropagation();
                },

                exportCSV: function (event) {
                    if (!this.transformedData) return;

                    var header = ['Origin', 'Origin Code',
                            'Destination', 'Destination Code',
                            'Amount (t/year)'
                        ],
                        rows = [],
                        _this = this;
                    rows.push(header.join(',\t'));
                    this.transformedData.links.forEach(function (link) {
                        var origin = link.source,
                            destination = link.target,
                            originName = origin.name,
                            destinationName = destination.name,
                            amount = link.value.toFixed(3);

                        var originCode = origin.code,
                            destinationCode = destination.code;

                        var row = ['"' + originName + '",', originCode + ',"', destinationName + '",', destinationCode + ',', amount];
                        rows.push(row.join('\t'));
                    });
                    var text = rows.join('\r\n');
                    var blob = new Blob([text], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

                    event.stopImmediatePropagation();
                },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return LinePlotView;
    }
);