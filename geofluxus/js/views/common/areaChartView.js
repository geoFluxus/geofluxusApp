define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/areaChart',
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
        AreaChart,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/AreaChartView
         * @augments module:views/BaseView
         */
        var AreaChartView = BaseView.extend(
            /** @lends module:views/AreaChartView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    AreaChartView.__super__.initialize.apply(this, [options]);
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

                    let groupBy;
                    let x;
                    let tooltipConfig;
                    let xSort;
                    let isStacked = false;

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {
                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            groupBy = ["year"];
                            x = ["year"];
                            tooltipConfig = {
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
                            groupBy = ["month"];
                            x = ["month"];
                            tooltipConfig = {
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

                        // /////////////////////////////
                        // Space dimension
                    } else if (this.options.dimensions[0][0] == "space") {
                        xSort = function (a, b) {
                            return b["amount"] - a["amount"];
                        }

                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                            x = ["areaName"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.areaName
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }
                        } else {
                            // Actor level
                            groupBy = ["actorName"];
                            x = ["actorName"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.actorName
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Economic Activity dimension
                    } else if (this.options.dimensions[0][0] == "economicActivity") {
                        xSort = function (a, b) {
                            return b["amount"] - a["amount"];
                        }

                        // Granularity: Activity group
                        if (this.options.dimensions[0][1] == "origin__activity__activitygroup" || this.options.dimensions[0][1] == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];
                            x = ["activityGroupCode"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.activityGroupCode
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Activity group", function (d) {
                                        return d.activityGroupCode + " " + d.activityGroupName;
                                    }],
                                ]
                            }

                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "origin__activity" || this.options.dimensions[0][1] == "destination__activity") {
                            x = ["activityCode"];
                            groupBy = ["activityGroupCode", "activityCode"];
                            tooltipConfig = {
                                title: function (d) {
                                    return d.activityCode
                                },
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Activity", function (d) {
                                        return d.activityCode + " " + d.activityName;
                                    }],
                                    ["Activity group", function (d) {
                                        return d.activityGroupCode + " " + d.activityGroupName;
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Treatment method dimension
                    } else if (this.options.dimensions[0][0] == "treatmentMethod") {
                        xSort = function (a, b) {
                            return b["amount"] - a["amount"];
                        }

                        // Granularity: Treatment process group
                        if (this.options.dimensions[0][1] == "origin__process__processgroup" || this.options.dimensions[0][1] == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];
                            x = ["processGroupCode"];
                            tooltipConfig = {
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Treatment method group", function (d) {
                                        return d.processGroupCode + " " + d.processGroupName;
                                    }],
                                ]
                            }

                            // Granularity: Treatment process
                        } else if (this.options.dimensions[0][1] == "origin__process" || this.options.dimensions[0][1] == "destination__process") {
                            groupBy = ["processCode"];
                            x = ["processCode"];
                            tooltipConfig = {
                                tbody: [
                                    ["Waste (metric ton)", function (d) {
                                        return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                                    }],
                                    ["Treatment method", function (d) {
                                        return d.processCode + " " + d.processName;
                                    }],
                                ]
                            }
                        }
                    }

                    // ///////////////////////////////////////////////////////////////////////////////////////////////////

                    // //////////////////////////////////////////
                    // Time & Space
                    if (dimensionsActual.includes("time") && dimensionsActual.includes("space")) {

                        isStacked = true;

                        // TIME ----------------
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

                        // SPACE ----------------
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                            tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            groupBy = ["actorName"];
                            tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // //////////////////////////////////////////
                        // Time & Economic Activity
                    } else if (dimensionsActual.includes("time") && dimensionsActual.includes("economicActivity")) {
                        isStacked = true;

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


                        tooltipConfig.tbody.push(["Activity group",
                            function (d) {
                                return d.activityGroupCode + " " + d.activityGroupName;
                            },
                        ])

                        if (this.options.dimensions[1][1] == "origin__activity__activitygroup" || this.options.dimensions[1][1] == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];
                        } else if (this.options.dimensions[1][1] == "origin__activity" || this.options.dimensions[1][1] == "destination__activity") {
                            groupBy = ["activityCode"];
                            tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }


                        // //////////////////////////////////////////
                        // Time & Treatment method
                    } else if (dimensionsActual.includes("time") && dimensionsActual.includes("treatmentMethod")) {
                        isStacked = true;

                        // ///////////////
                        // Time dimension

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

                        // ///////////////
                        // Treatment method dimension
                        tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }])

                        if (this.options.dimensions[1][1] == "origin__process__processgroup" || this.options.dimensions[1][1] == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];
                        } else if (this.options.dimensions[1][1] == "origin__process" || this.options.dimensions[1][1] == "destination__process") {
                            groupBy = ["processCode"];
                            tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }
                    }

                    // Create a new D3Plus AreaChart object which will be rendered in this.options.el:
                    this.areaChart = new AreaChart({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        x: x,
                        tooltipConfig: tooltipConfig,
                        xSort: xSort,
                        isStacked: isStacked,
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
        return AreaChartView;
    }
);