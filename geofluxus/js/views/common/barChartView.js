define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/barchart',
        'utils/enrichFlows',
    ],

    function (
        D3plusVizView,
        _,
        BarChart,
        enrichFlows) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/BarChartView
         * @augments module:views/D3plusVizView
         */
        var BarChartView = D3plusVizView.extend(
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
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleLegend');
                    _.bindAll(this, 'toggleDarkMode');

                    this.options = options;
                    let flows = this.options.flows;
                    this.canHaveLegend = true;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    this.groupBy = "";
                    this.x = "";
                    this.xSort = true;
                    this.isStacked = this.options.isStacked;
                    this.isActorLevel = false;

                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];
                    let gran2 = this.options.dimensions[1] ? this.options.dimensions[1][1] : {};
                    let dimStrings = [];
                    this.options.dimensions.forEach(dim => dimStrings.push(dim[0]));


                    // Time dimension
                    if (dim1String == "time") {
                        this.xSort = false;
                        // Granularity = year
                        if (gran1 == "flowchain__month__year") {
                            this.x = this.groupBy = ["year"];
                            // Granularity = month:
                        } else if (gran1 == "flowchain__month") {
                            this.x = this.groupBy = ["month"];
                        }

                        // Space dimension
                    } else if (dim1String == "space") {
                        // Areas:
                        if (!this.options.dimensions.isActorLevel) {
                            this.groupBy = ["areaName"];
                            this.x = ["areaName"];
                            this.tooltipConfig.title = function (d) {
                                return d.areaName
                            };

                        } else {
                            // Actor level
                            this.x = this.groupBy = ["actorName"];
                            this.tooltipConfig.title = function (d) {
                                return d.actorName
                            };
                        }

                        // Economic Activity dimension
                    } else if (dim1String == "economicActivity") {

                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }]);

                        // Granularity: Activity group
                        if (gran1 == "origin__activity__activitygroup" || gran1 == "destination__activity__activitygroup") {
                            this.x = this.groupBy = ["activityGroupCode"];
                            this.tooltipConfig.title = function (d) {
                                return d.activityGroupCode
                            };

                            // Granularity: Activity
                        } else if (gran1 == "origin__activity" || gran1 == "destination__activity") {
                            this.x = ["activityCode"];
                            this.groupBy = ["activityGroupCode", "activityCode"];

                            this.tooltipConfig.title = function (d) {
                                return d.activityCode
                            };
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // /////////////////////////////
                        // Treatment method dimension
                    } else if (dim1String == "treatmentMethod") {

                        // Granularity: Treatment process group
                        if (gran1 == "origin__process__processgroup" || gran1 == "destination__process__processgroup") {
                            this.x = this.groupBy = ["processGroupCode"];
                            this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
                                return d.processGroupCode + " " + d.processGroupName;
                            }]);

                            // Granularity: Treatment process
                        } else if (gran1 == "origin__process" || gran1 == "destination__process") {
                            this.x = this.groupBy = ["processCode"];
                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // /////////////////////////////
                        // Material dimension
                    } else if (dim1String == "material") {
                        // ewc2
                        if (gran1 == "flowchain__waste06__waste04__waste02") {
                            this.x = this.groupBy = ["ewc2Code"];
                            this.tooltipConfig.title = "Waste per EWC Chapter";
                            this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                                return d.ewc2Code + " " + d.ewc2Name;
                            }]);
                            // ewc4
                        } else if (gran1 == "flowchain__waste06__waste04") {
                            this.x = this.groupBy = ["ewc4Code"];
                            this.tooltipConfig.title = "Waste per EWC Sub-Chapter";
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran1 == "flowchain__waste06") {
                            this.x = this.groupBy = ["ewc6Code"];
                            this.tooltipConfig.title = "Waste per EWC Entry";
                            this.tooltipConfig.tbody.push(["EWC Entry", function (d) {
                                return d.ewc6Code + " " + d.ewc6Name;
                            }]);
                        }
                    }

                    // ///////////////////////////////////////////////////////////////////////////////////////////////////

                    // Time & Space
                    if (dimStrings.includes("time") && dimStrings.includes("space")) {
                        this.xSort = false;
                        // TIME
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

                        // SPACE
                        if (!this.options.dimensions.isActorLevel) {
                            this.groupBy = ["areaName"];
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            this.isActorLevelevel = true;
                            this.groupBy = ["actorId"];
                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        ////////////////////////////
                        // Time & Economic Activity
                    } else if (dimStrings.includes("time") && dimStrings.includes("economicActivity")) {
                        this.xSort = false;

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

                        // Economic activity
                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }]);

                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];
                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
                            this.groupBy = ["activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        ////////////////////////////
                        // Time & Treatment method
                    } else if (dimStrings.includes("time") && dimStrings.includes("treatmentMethod")) {

                        // Time dimension                        
                        this.xSort = false;
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

                        // Treatment method dimension
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

                        ////////////////////////////
                        // Time & Material
                    } else if (dimStrings.includes("time") && dimStrings.includes("material")) {
                        this.xSort = false;

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

                        ////////////////////////////
                        // Space & Economic activity
                    } else if (dimStrings.includes("space") && dimStrings.includes("economicActivity")) {

                        // SPACE
                        if (!this.options.dimensions.isActorLevel) {
                            this.x = ["areaName"];
                            this.tooltipConfig.title = "Waste totals per area";
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            //isActorLevel = true;
                            this.x = ["actorName"];
                            this.tooltipConfig.title = "Waste totals per company";
                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // Economic activity:
                        this.tooltipConfig.tbody.push(["Activity group",
                            function (d) {
                                return d.activityGroupCode + " " + d.activityGroupName;
                            },
                        ])

                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];
                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
                            this.groupBy = ["activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }], )
                        }

                        ////////////////////////////
                        // Space & Treatment Method
                    } else if (dimStrings.includes("space") && dimStrings.includes("treatmentMethod")) {

                        // SPACE
                        if (!this.options.dimensions.isActorLevel) {
                            this.x = ["areaName"];
                            this.tooltipConfig.title = "Waste totals per area per treatment method";
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            //isActorLevel = true;
                            this.x = ["actorName"];
                            this.tooltipConfig.title = "Waste totals per company per treatment method";
                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }
                        // Treatment method dimension
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

                        ////////////////////////////
                        // Space & Material
                    } else if (dimStrings.includes("space") && dimStrings.includes("material")) {

                        // SPACE
                        if (!this.options.dimensions.isActorLevel) {
                            this.x = ["areaName"];
                            this.tooltipConfig.title = "Waste totals per area per material";
                            this.tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            //isActorLevel = true;
                            this.x = ["actorName"];
                            this.tooltipConfig.title = "Waste totals per company per material";
                            this.tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // Material
                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                            return d.ewc2Code + " " + d.ewc2Name;
                        }]);
                        // ewc2
                        if (gran2 == "flowchain__waste06__waste04__waste02") {
                            this.groupBy = ["ewc2Code"];
                            // ewc4
                        } else if (gran2 == "flowchain__waste06__waste04") {
                            this.groupBy = ["ewc4Code"];
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran2 == "flowchain__waste06") {
                            this.groupBy = ["ewc6Code"];
                            this.tooltipConfig.tbody.push(
                                ["EWC Sub-Chapter", function (d) {
                                    return d.ewc4Code + " " + d.ewc4Name;
                                }],
                                ["EWC Entry", function (d) {
                                    return d.ewc6Code + " " + d.ewc6Name;
                                }]);
                        }

                        ////////////////////////////
                        // Economic Activity & Treatment Method
                    } else if (dimStrings.includes("economicActivity") && dimStrings.includes("treatmentMethod")) {

                        // Economic activity dimension already added 


                        this.tooltipConfig.title = "Waste per Economic activity and Treatment method";

                        // Treatment method dimension
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

                        ///////////////////////////////
                        // Economic Activity & Material
                    } else if (dimStrings.includes("economicActivity") && dimStrings.includes("material")) {
                        this.tooltipConfig.title = "Waste per Economic activity and Material";

                        // Material
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
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran2 == "flowchain__waste06") {
                            this.groupBy = ["ewc6Code"];
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
                        this.flows = enrichFlows.assignColorsByProperty(flows, this.groupBy);
                    }

                    // Update this.xSort variable to store function if true:
                    if (this.xSort) {
                        this.xSort = function (a, b) {
                            return b["amount"] - a["amount"];
                        }
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
                 * Create a new D3Plus BarChart object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.barChart = new BarChart({
                        el: this.options.el,
                        data: this.flows,
                        groupBy: this.groupBy,
                        x: this.x,
                        tooltipConfig: this.tooltipConfig,
                        xSort: this.xSort,
                        isStacked: this.isStacked,
                        isActorLevel: this.isActorLevelevel,
                        hasLegend: this.hasLegend,
                        canHaveLegend: this.canHaveLegend,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                },
            });
        return BarChartView;
    }
);