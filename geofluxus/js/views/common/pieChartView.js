define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/piechart',
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
        PieChart,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/PieChartView
         * @augments module:views/BaseView
         */
        var PieChartView = BaseView.extend(
            /** @lends module:views/PieChartView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    PieChartView.__super__.initialize.apply(this, [options]);
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
                    let _this = this;
                    let flows = this.options.flows;
                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];

                    let groupBy;
                    let tooltipConfig = {
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }]
                        ]
                    };

                    // Time 
                    if (dim1String == "time") {
                        // Granularity = year
                        if (gran1 == "flowchain__month__year") {
                            groupBy = ["year"];

                            // Granularity = month:
                        } else if (gran1 == "flowchain__month") {
                            groupBy = ["month"];
                        }

                        // Space
                    } else if (dim1String == "space") {

                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                        } else {
                            // Actor level
                            groupBy = ["actorName"];
                        }

                        // Economic Activity dimension
                    } else if (dim1String == "economicActivity") {
                        tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }]);

                        // Granularity: Activity group
                        if (gran1 == "origin__activity__activitygroup" || gran1 == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];

                            // Granularity: Activity
                        } else if (gran1 == "origin__activity" || gran1 == "destination__activity") {
                            groupBy = ["activityCode"];
                            tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // Treatment method 
                    } else if (dim1String == "treatmentMethod") {
                        tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }]);

                        if (gran1 == "origin__process__processgroup" || gran1 == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];

                            // Granularity: Activity
                        } else if (gran1 == "origin__process" || gran1 == "destination__process") {
                            groupBy = ["processCode"];
                            tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // Material
                    } else if (dim1String == "material") {
                        // ewc2
                        if (gran1 == "flowchain__waste06__waste04__waste02") {
                            groupBy = ["ewc2Code"];
                            tooltipConfig.title = "Waste per EWC Chapter";
                            tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                                return d.ewc2Code + " " + d.ewc2Name;
                            }]);
                            // ewc4
                        } else if (gran1 == "flowchain__waste06__waste04") {
                            groupBy = ["ewc4Code"];
                            tooltipConfig.title = "Waste per EWC Sub-Chapter";
                            tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran1 == "flowchain__waste06") {
                            groupBy = ["ewc6Code"];
                            tooltipConfig.title = "Waste per EWC Entry";
                            tooltipConfig.tbody.push(["EWC Entry", function (d) {
                                return d.ewc6Code + " " + d.ewc6Name;
                            }]);
                        }

                    }

                    // Create a new D3Plus PieChart object which will be rendered in this.options.el:
                    this.pieChart = new PieChart({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        tooltipConfig: tooltipConfig,
                    });

                    // Smooth scroll to top of Viz
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth"
                    });
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                    window.dispatchEvent(new Event('resize'));
                    event.stopImmediatePropagation();
                },

                exportPNG: function (event) {
                    // var svg = this.el.querySelector('svg');
                    // saveSvgAsPng.saveSvgAsPng(svg, "sankey-diagram.png", {
                    //     scale: 2,
                    //     backgroundColor: "#FFFFFF"
                    // });
                    // event.stopImmediatePropagation();
                },

                exportCSV: function (event) {
                    const items = this.options.flows;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
                    const header = Object.keys(items[0])
                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
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
        return PieChartView;
    }
);