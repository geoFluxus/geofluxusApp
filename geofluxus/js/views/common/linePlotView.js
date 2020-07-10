define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/linePlot',
        'utils/enrichFlows',
    ],

    function (
        D3plusVizView,
        _,
        LinePlot,
        enrichFlows) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/LinePlotView
         * @augments module:views/D3plusVizView
         */
        var LinePlotView = D3plusVizView.extend(
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
                    _.bindAll(this, 'toggleLegend');
                    _.bindAll(this, 'toggleDarkMode');

                    this.isDarkMode = true;
                    this.canHaveLegend = true;
                    this.hasLegend = true;

                    this.options = options;
                    this.flows = this.options.flows;
                    this.x = "";
                    this.groupBy = "";
                    this.isActorLevel = false;

                    let gran1 = this.options.dimensions[0][1];
                    let gran2 = this.options.dimensions[1] ? this.options.dimensions[1][1] : {};

                    let dimStrings = [];
                    this.options.dimensions.forEach(dim => dimStrings.push(dim[0]));


                    // /////////////////////////////
                    // 1D - Time dimension

                    // Granularity = year
                    if (gran1 == "flowchain__month__year") {
                        this.x = ["year"];
                        this.tooltipConfig.title = this.label + " totals per year";
                        this.tooltipConfig.tbody.push(["Year", function (d) {
                            return d.year
                        }]);

                        // Granularity = month:
                    } else if (gran1 == "flowchain__month") {
                        this.x = ["yearMonthCode"];

                        this.tooltipConfig.title = this.label + " totals per month";

                        // Only for time
                        if (dimStrings.length == 1 && this.options.hasMultipleLines) {
                            this.groupBy = ["year"];
                            this.x = ["monthName"];

                            this.tooltipConfig.tbody.push(["Month", function (d) {
                                return d.monthName
                            }]);
                        } else {
                            this.tooltipConfig.tbody.push(["Month", function (d) {
                                return d.month
                            }]);
                        }
                    }

                    // //////////////////////////////////////////
                    // 2D - Time & Space
                    if (dimStrings.includes("space")) {

                        if (!this.options.dimensions.isActorLevel) {
                            this.groupBy = ["areaName"];
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);

                        } else {
                            this.isActorLevel = true;
                            this.groupBy = ["actorId"];

                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // //////////////////////////////////////////
                        // 2D - Time & Economic Activity
                    } else if (dimStrings.includes("economicActivity")) {

                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }, ])

                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];
                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
                            this.groupBy = ["activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // 2D - Time & Treatment method
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
                            this.tooltipConfig.title = this.label + " per EWC Chapter";
                            // ewc4
                        } else if (gran2 == "flowchain__waste06__waste04") {
                            this.groupBy = ["ewc4Code"];
                            this.tooltipConfig.title = this.label + " per EWC Sub-Chapter";
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran2 == "flowchain__waste06") {
                            this.groupBy = ["ewc6Code"];
                            this.tooltipConfig.title = this.label + " per Entry";
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
                        this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy)
                    }

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                    'click .toggle-darkmode': 'toggleDarkMode',
                },

                /**
                 * Create a new D3Plus linePlot object which will be rendered in this.options.el:
                 */
                render: function () {

                    // Don't show legend if there is no grouping:
                    if (this.groupBy.length	< 1) {
                        this.canHaveLegend = false;
                    }

                    this.linePlot = new LinePlot({
                        el: this.options.el,
                        data: this.flows,
                        groupBy: this.groupBy,
                        x: this.x,
                        tooltipConfig: this.tooltipConfig,
                        isActorLevel: this.isActorLevel,
                        canHaveLegend: this.canHaveLegend,
                        hasLegend: this.hasLegend,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return LinePlotView;
    }
);