define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/piechart',
        'utils/enrichFlows',
    ],

    function (
        D3plusVizView,
        _,
        PieChart,
        enrichFlows) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/PieChartView
         * @augments module:views/D3plusVizView
         */
        var PieChartView = D3plusVizView.extend(
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
                    _.bindAll(this, 'toggleLegend');
                    _.bindAll(this, 'toggleDarkMode');

                    this.options = options;
                    this.flows = this.options.flows;
                    
                    this.canHaveLegend = true;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];

                    this.groupBy = "";

                    // Time 
                    if (dim1String == "time") {
                        // Granularity = year
                        if (gran1 == "flowchain__month__year") {
                            this.groupBy = ["year"];

                            // Granularity = month:
                        } else if (gran1 == "flowchain__month") {
                            this.groupBy = ["month"];
                        }

                        // Space
                    } else if (dim1String == "space") {

                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            this.groupBy = ["areaName"];
                        } else {
                            // Actor level
                            this.groupBy = ["actorName"];
                        }

                        // Economic Activity dimension
                    } else if (dim1String == "economicActivity") {
                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }]);

                        // Granularity: Activity group
                        if (gran1 == "origin__activity__activitygroup" || gran1 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];

                            // Granularity: Activity
                        } else if (gran1 == "origin__activity" || gran1 == "destination__activity") {
                            this.groupBy = ["activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // Treatment method 
                    } else if (dim1String == "treatmentMethod") {
                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }]);

                        if (gran1 == "origin__process__processgroup" || gran1 == "destination__process__processgroup") {
                            this.groupBy = ["processGroupCode"];

                            // Granularity: Activity
                        } else if (gran1 == "origin__process" || gran1 == "destination__process") {
                            this.groupBy = ["processCode"];
                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // Material
                    } else if (dim1String == "material") {
                        // ewc2
                        if (gran1 == "flowchain__waste06__waste04__waste02") {
                            this.groupBy = ["ewc2Code"];
                            this.tooltipConfig.title = "Waste per EWC Chapter";
                            this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                                return d.ewc2Code + " " + d.ewc2Name;
                            }]);
                            // ewc4
                        } else if (gran1 == "flowchain__waste06__waste04") {
                            this.groupBy = ["ewc4Code"];
                            this.tooltipConfig.title = this.label + " per EWC Sub-Chapter";
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran1 == "flowchain__waste06") {
                            this.groupBy = ["ewc6Code"];
                            this.tooltipConfig.title = this.label + " per EWC Entry";
                            this.tooltipConfig.tbody.push(["EWC Entry", function (d) {
                                return d.ewc6Code + " " + d.ewc6Name;
                            }]);
                        }

                    }

                    // Assign colors by groupings:
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy);

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                    'click .toggle-darkmode': 'toggleDarkMode',                    
                },

                /**
                 * Create a new D3Plus PieChart object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.pieChart = new PieChart({
                        el: this.options.el,
                        data: this.flows,
                        groupBy: this.groupBy,
                        tooltipConfig: this.tooltipConfig,
                        canHaveLegend: this.canHaveLegend,
                        hasLegend: this.hasLegend,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return PieChartView;
    }
);