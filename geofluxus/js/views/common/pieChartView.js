define(['views/common/baseview',
        'underscore',
        'd3',
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
                    _.bindAll(this, 'exportPNG');
                    _.bindAll(this, 'exportCSV');
                    var _this = this;

                    this.options = options;

                    //this.transformedData = this.transformData(this.flows);
                    //this.render(this.transformedData);
                    this.render();
                },


                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-img': 'exportPNG',
                    'click .export-csv': 'exportCSV',
                },

                /*
                 * render the view
                 */
                render: function (data) {
                    let flows = this.options.flows;
                    let groupBy;
                    let tooltipConfig = {};
                    let hasLegend = true;

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {
                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            groupBy = ["year"];
                            tooltipConfig = {
                                tbody: [
                                    ["Total", function (d) {
                                        return d["amount"]
                                    }],
                                    ["Year", function (d) {
                                        return d.year
                                    }]
                                ]
                            }

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            groupBy = ["month"];
                            hasLegend = false;
                            tooltipConfig = {
                                tbody: [
                                    ["Total", function (d) {
                                        return d["amount"]
                                    }],
                                    ["Month", function (d) {
                                        return d.month;
                                    }],
                                ]
                            }
                        }

                        // /////////////////////////////
                        // Economic Activity dimension
                    } else if (this.options.dimensions[0][0] == "economicActivity") {
                        console.log("Economic activity")

                        // Granularity = Activity group
                        if (this.options.dimensions[0][1] == "activity__activitygroup") {
                            //groupBy = ["activitygroup"];


                            // Granularity: Activity
                        } else if (this.options.dimensions[0][1] == "activity") {

                        }
                    }


                    // Create a new D3Plus PieChart object which will be rendered in this.options.el:
                    this.pieChart = new PieChart({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        tooltipConfig: tooltipConfig,
                        hasLegend: hasLegend,
                    });
                },

                /*
                 * render sankey-diagram in fullscreen
                 */
                toggleFullscreen: function (event) {
                    this.el.classList.toggle('fullscreen');
                    this.refresh();
                    event.stopImmediatePropagation();
                    //this.render(this.transformedData);
                },

                refresh: function (options) {

                },


                exportPNG: function (event) {
                    var svg = this.el.querySelector('svg');
                    saveSvgAsPng.saveSvgAsPng(svg, "sankey-diagram.png", {
                        scale: 2,
                        backgroundColor: "#FFFFFF"
                    });
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

                /*
                 * remove this view from the DOM
                 */
                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return PieChartView;
    }
);