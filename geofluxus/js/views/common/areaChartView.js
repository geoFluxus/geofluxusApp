define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/areaChart',
        'utils/enrichFlows'
    ],

    function (
        D3plusVizView,
        _,
        AreaChart,
        enrichFlows) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/AreaChartView
         * @augments module:views/D3plusVizView
         */
        var AreaChartView = D3plusVizView.extend(
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
                    _.bindAll(this, 'toggleLegend');

                    this.options = options;
                    let flows = this.options.flows;
                    this.isStacked = true;
                    this.groupBy = "";
                    this.x = "";
                    this.hasLegend = true;
                    
                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];
                    let dim2String = this.options.dimensions[1][0];
                    let gran2 = this.options.dimensions[1][1];

                    let dimStrings = [];
                    this.options.dimensions.forEach(dim => dimStrings.push(dim[0]));
                    
                    // Granularity = year
                    if (gran1 == "flowchain__month__year") {
                        this.x = ["year"];
                        this.tooltipConfig.title = "Waste totals per year";
                        this.tooltipConfig.tbody.push(["Year", function (d) {
                            return d.year
                        }]);

                        // Granularity = month:
                    } else if (gran1 == "flowchain__month") {
                        this.x = ["yearMonthCode"];
                        this.tooltipConfig.title = "Waste totals per month";
                        this.tooltipConfig.tbody.push(["Month", function (d) {
                            return d.month
                        }]);
                    }

                    // //////////////////////////////////////////
                    // Time & Space
                    if (dimStrings.includes("space")) {

                        if (!this.options.dimensions.isActorLevel) {
                            this.groupBy = ["areaName"];
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            this.groupBy = ["actorName"];
                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // //////////////////////////////////////////
                        // Time & Economic Activity
                    } else if (dimStrings.includes("economicActivity")) {

                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }])

                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];
                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
                            this.groupBy = ["activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // Time & Treatment method
                    } else if (dimStrings.includes("treatmentMethod")) {

                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }])

                        if (gran2 == "origin__process__processgroup" || gran2 == "destination__process__processgroup") {
                            this.groupBy = ["processGroupCode"];
                        } else if (gran2 == "origin__process" || gran2 == "destination__process") {
                            this.groupBy = ["processCode"];
                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // 2D - Time & Material
                    } else if (dimStrings.includes("material")) {

                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                            return d.ewc2Code + " " + d.ewc2Name;
                        }]);

                        // ewc2
                        if (gran2 == "flowchain__waste06__waste04__waste02") {
                            this.groupBy = ["ewc2Code"];
                            this.tooltipConfig.title = "Waste per EWC Chapter";
                            // ewc4
                        } else if (gran2 == "flowchain__waste06__waste04") {
                            this.groupBy = ["ewc4Code"];
                            this.tooltipConfig.title = "Waste per EWC Sub-Chapter";
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran2 == "flowchain__waste06") {
                            this.groupBy = ["ewc6Code"];
                            this.tooltipConfig.title = "Waste per EWC Entry";
                            this.tooltipConfig.tbody.push(
                                ["EWC Sub-Chapter", function (d) {
                                    return d.ewc4Code + " " + d.ewc4Name;
                                }],
                                ["EWC Entry", function (d) {
                                    return d.ewc6Code + " " + d.ewc6Name;
                                }]);
                        }
                    }

                    // Assign colors by groupings:
                    if (this.groupBy) {
                        this.flows = enrichFlows.assignColorsByProperty(flows, this.groupBy)
                    }

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                },

                /**
                 * Create a new D3Plus AreaChart object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.areaChart = new AreaChart({
                        el: this.options.el,
                        data: this.flows,
                        groupBy: this.groupBy,
                        x: this.x,
                        tooltipConfig: this.tooltipConfig,
                        isStacked: this.isStacked,
                        hasLegend: this.hasLegend,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return AreaChartView;
    }
);