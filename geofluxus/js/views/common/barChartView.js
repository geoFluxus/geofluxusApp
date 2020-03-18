define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/barchart',
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
        BarChart,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/BarChartView
         * @augments module:views/BaseView
         */
        var BarChartView = BaseView.extend(
            /** @lends module:views/BarChartView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    BarChartView.__super__.initialize.apply(this, [options]);
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
                    let filterFlowsView = this.options.flowsView.filterFlowsView;
                    let groupBy;

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {
                        let years = filterFlowsView.years.models;
                        let months = filterFlowsView.months.models;

                         // Granularity = year
                         if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            groupBy = ["year"];

                            // Replace year id's by year:
                            // flows.forEach(function (flow, index) {
                            //     let yearObject = years.find(year => year.attributes.id == flow.year);

                            //     this[index].year = yearObject.attributes.code;
                            // }, flows);

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            groupBy = ["year", "month"];

                            // Replace Month id's by Month name:
                            // flows.forEach(function (flow, index) {
                            //     let monthObject = months.find(month => month.attributes.id == flow.month);

                            //     this[index].month = utils.returnMonthString(monthObject.attributes.code.substring(0, 2)) + " " + monthObject.attributes.code.substring(2, 6);
                            //     this[index].year = monthObject.attributes.code.substring(2, 6);
                            // }, flows);
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


                    // Create a new D3Plus BarChart object which will be rendered in this.options.el:
                    this.barChart = new BarChart({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
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
        return BarChartView;
    }
);