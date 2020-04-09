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
                    let groupBy;
                    let tooltipConfig = {
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }]
                        ]
                    };

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {
                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            groupBy = ["year"];

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            groupBy = ["month"];
                        }

                        // /////////////////////////////
                        // Space dimension
                    } else if (this.options.dimensions[0][0] == "space") {

                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                        } else {
                            // Actor level
                            groupBy = ["actorName"];
                        }

                        // /////////////////////////////
                        // Economic Activity dimension
                    } else if (this.options.dimensions[0][0] == "economicActivity") {
                        tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }]);

                        // Granularity = Activity group
                        if (this.options.dimensions[0][1] == "origin__activity__activitygroup" || this.options.dimensions[0][1] == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];

                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "origin__activity" || this.options.dimensions[0][1] == "destination__activity") {
                            groupBy = ["activityCode"];
                            tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // /////////////////////////////
                        // Treatment method dimension
                    } else if (this.options.dimensions[0][0] == "treatmentMethod") {
                        tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }]);

                        if (this.options.dimensions[0][1] == "origin__process__processgroup" || this.options.dimensions[0][1] == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];

                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "origin__process" || this.options.dimensions[0][1] == "destination__process") {
                            groupBy = ["processCode"];
                            tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
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
                    event.stopImmediatePropagation();
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                    window.dispatchEvent(new Event('resize'));
                },

                exportPNG: function (event) {
                    var svg = this.sankeyDiv.querySelector('svg');
                    saveSvgAsPng.saveSvgAsPng(svg, "sankey-diagram.png", {
                        scale: 2,
                        backgroundColor: "#FFFFFF"
                    });
                    event.stopImmediatePropagation();
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