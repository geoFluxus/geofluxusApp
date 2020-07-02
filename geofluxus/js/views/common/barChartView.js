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

                    var _this = this;
                    this.options = options;
                    this.isStacked = this.options.isStacked;

                    this.canHaveLegend = true;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    this.flows = this.options.flows;
                    this.label = this.options.label;

                    this.groupBy = this.x = "";

                    this.dimensions = {
                        'time': {
                            'year' : 'Year',
                            'month': 'Month',
                        },
                        'economicActivity': {
                            'activitygroup': 'Activity group',
                            'activity'     : 'Activity',
                        },
                        'treatmentMethod': {
                            'processgroup': 'Treatment method group',
                            'process'     : 'Treatment method',
                        },
                        'material': {
                            'waste02': 'EWC Chapter',
                            'waste04': 'EWC Sub-Chapter',
                            'waste06': 'EWC Entry'
                        }
                    }

                    // configure tooltips
                    let dimensions = this.options.dimensions;
                    dimensions.forEach(function(dim, index) {
                        var properties = _this.dimensions[dim[0]];

                        if (properties != undefined) {
                            Object.keys(properties).forEach(function(prop) {
                                // check if flows have code/name for current property
                                var flow = _this.flows[0],
                                    code = prop + 'Code',
                                    name = prop + 'Name';

                                // if code, group by
                                if (flow[code] != undefined && flow[code] != "") {
                                    // if name, add tooltip
                                    if (flow[name] != undefined) {
                                        var title = properties[prop];

                                        // tooltip title
                                        if (!index) {
                                            _this.x = _this.groupBy = code;
                                            _this.tooltipConfig.title = _this.label + " per " + title;
                                        } else {
                                            _this.groupBy = code;
                                            _this.tooltipConfig.title += " & " + title;
                                        }

                                        // tooltip body
                                        _this.tooltipConfig.tbody.push([title, function (d) {
                                            return d[code] + " " + d[name];
                                        }]);
                                    }
                                }
                            })
                        }

                        // choose grouping for time / space dimension
                        if (dim[0] == 'space') {
                            _this.groupBy = _this.x = _this.options.dimensions.isActorLevel ? "actorName" : "areaName";
                        }
                    })

//                    // sort by amount
//                    this.xSort = function (a, b) {
//                        return b["amount"] - a["amount"];
//                    }

                    // assign colors by groupings
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy);
                    this.render();
//
//                    // ///////////////////////////////////////////////////////////////////////////////////////////////////
//
//                    // Time & Space
//                    if (dimStrings.includes("time") && dimStrings.includes("space")) {
//                        this.xSort = false;
//                        // TIME
//                        // Granularity = year
//                        if (gran1 == "flowchain__month__year") {
//                            this.x = ["year"];
//                            this.tooltipConfig.title = this.label + " totals per year";
//                            this.tooltipConfig.tbody.push(["Year", function (d) {
//                                return d.year
//                            }]);
//
//                            // Granularity = month:
//                        } else if (gran1 == "flowchain__month") {
//                            this.x = ["yearMonthCode"];
//                            this.tooltipConfig.title = this.label + " totals per month";
//                            this.tooltipConfig.tbody.push(["Month", function (d) {
//                                return d.month
//                            }]);
//                        }
//
//                        // SPACE
//                        if (!this.options.dimensions.isActorLevel) {
//                            this.groupBy = ["areaName"];
//                            this.tooltipConfig.tbody.push(["Area", function (d) {
//                                return d.areaName
//                            }]);
//                        } else {
//                            this.isActorLevelevel = true;
//                            this.groupBy = ["actorId"];
//                            this.tooltipConfig.tbody.push(["Company", function (d) {
//                                return d.actorName
//                            }]);
//                        }
//
//                        ////////////////////////////
//                        // Time & Economic Activity
//                    } else if (dimStrings.includes("time") && dimStrings.includes("economicActivity")) {
//                        this.xSort = false;
//
//                        // Granularity = year
//                        if (gran1 == "flowchain__month__year") {
//                            this.x = ["year"];
//                            this.tooltipConfig.title = this.label + " totals per year";
//                            this.tooltipConfig.tbody.push(["Year", function (d) {
//                                return d.year
//                            }]);
//
//                            // Granularity = month:
//                        } else if (gran1 == "flowchain__month") {
//                            this.x = ["yearMonthCode"];
//                            this.tooltipConfig.title = this.label + " totals per month";
//                            this.tooltipConfig.tbody.push(["Month", function (d) {
//                                return d.month
//                            }]);
//                        }
//
//                        // Economic activity
//                        this.tooltipConfig.tbody.push(["Activity group", function (d) {
//                            return d.activityGroupCode + " " + d.activityGroupName;
//                        }]);
//
//                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
//                            this.groupBy = ["activityGroupCode"];
//                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
//                            this.groupBy = ["activityCode"];
//                            this.tooltipConfig.tbody.push(["Activity", function (d) {
//                                return d.activityCode + " " + d.activityName;
//                            }]);
//                        }
//
//                        ////////////////////////////
//                        // Time & Treatment method
//                    } else if (dimStrings.includes("time") && dimStrings.includes("treatmentMethod")) {
//
//                        // Time dimension
//                        this.xSort = false;
//                        // Granularity = year
//                        if (gran1 == "flowchain__month__year") {
//                            this.x = ["year"];
//                            this.tooltipConfig.title = this.label + " totals per year";
//                            this.tooltipConfig.tbody.push(["Year", function (d) {
//                                return d.year
//                            }]);
//
//                            // Granularity = month:
//                        } else if (gran1 == "flowchain__month") {
//                            this.x = ["yearMonthCode"];
//
//                            this.tooltipConfig.title = this.label + " totals per month";
//                            this.tooltipConfig.tbody.push(["Month", function (d) {
//                                return d.month
//                            }]);
//                        }
//
//                        // Treatment method dimension
//                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
//                            return d.processGroupCode + " " + d.processGroupName;
//                        }])
//
//                        if (gran2 == "origin__process__processgroup" || gran2 == "destination__process__processgroup") {
//                            this.groupBy = ["processGroupCode"];
//                        } else if (gran2 == "origin__process" || gran2 == "destination__process") {
//                            this.groupBy = ["processCode"];
//                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
//                                return d.processCode + " " + d.processName;
//                            }]);
//                        }
//
//                        ////////////////////////////
//                        // Time & Material
//                    } else if (dimStrings.includes("time") && dimStrings.includes("material")) {
//                        this.xSort = false;
//
//                        // Granularity = year
//                        if (gran1 == "flowchain__month__year") {
//                            this.x = ["year"];
//                            this.tooltipConfig.title = this.label + " totals per year";
//                            this.tooltipConfig.tbody.push(["Year", function (d) {
//                                return d.year
//                            }]);
//
//                            // Granularity = month:
//                        } else if (gran1 == "flowchain__month") {
//                            this.x = ["yearMonthCode"];
//                            this.tooltipConfig.title = this.label + " totals per month";
//                            this.tooltipConfig.tbody.push(["Month", function (d) {
//                                return d.month
//                            }]);
//                        }
//
//                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
//                            return d.ewc2Code + " " + d.ewc2Name;
//                        }]);
//                        // ewc2
//                        if (gran2 == "flowchain__waste06__waste04__waste02") {
//                            this.groupBy = ["ewc2Code"];
//                            this.tooltipConfig.title = this.label + " per EWC Chapter";
//                            // ewc4
//                        } else if (gran2 == "flowchain__waste06__waste04") {
//                            this.groupBy = ["ewc4Code"];
//                            this.tooltipConfig.title = this.label + " per EWC Sub-Chapter";
//                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
//                                return d.ewc4Code + " " + d.ewc4Name;
//                            }]);
//                            // ewc6
//                        } else if (gran2 == "flowchain__waste06") {
//                            this.groupBy = ["ewc6Code"];
//                            this.tooltipConfig.title = this.label + " per EWC Entry";
//                            this.tooltipConfig.tbody.push(
//                                ["EWC Sub-Chapter", function (d) {
//                                    return d.ewc4Code + " " + d.ewc4Name;
//                                }],
//                                ["EWC Entry", function (d) {
//                                    return d.ewc6Code + " " + d.ewc6Name;
//                                }]);
//                        }
//
//                        ////////////////////////////
//                        // Space & Economic activity
//                    } else if (dimStrings.includes("space") && dimStrings.includes("economicActivity")) {
//
//                        // SPACE
//                        if (!this.options.dimensions.isActorLevel) {
//                            this.x = ["areaName"];
//                            this.tooltipConfig.title = this.label + " totals per area";
//                            this.tooltipConfig.tbody.push(["Area", function (d) {
//                                return d.areaName
//                            }]);
//                        } else {
//                            //isActorLevel = true;
//                            this.x = ["actorName"];
//                            this.tooltipConfig.title = this.label + " totals per company";
//                            this.tooltipConfig.tbody.push(["Company", function (d) {
//                                return d.actorName
//                            }]);
//                        }
//
//                        // Economic activity:
//                        this.tooltipConfig.tbody.push(["Activity group",
//                            function (d) {
//                                return d.activityGroupCode + " " + d.activityGroupName;
//                            },
//                        ])
//
//                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
//                            this.groupBy = ["activityGroupCode"];
//                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
//                            this.groupBy = ["activityCode"];
//                            this.tooltipConfig.tbody.push(["Activity", function (d) {
//                                return d.activityCode + " " + d.activityName;
//                            }], )
//                        }
//
//                        ////////////////////////////
//                        // Space & Treatment Method
//                    } else if (dimStrings.includes("space") && dimStrings.includes("treatmentMethod")) {
//
//                        // SPACE
//                        if (!this.options.dimensions.isActorLevel) {
//                            this.x = ["areaName"];
//                            this.tooltipConfig.title = this.label + " totals per area per treatment method";
//                            this.tooltipConfig.tbody.push(["Area", function (d) {
//                                return d.areaName
//                            }]);
//                        } else {
//                            //isActorLevel = true;
//                            this.x = ["actorName"];
//                            this.tooltipConfig.title = this.label + " totals per company per treatment method";
//                            this.tooltipConfig.tbody.push(["Company", function (d) {
//                                return d.actorName
//                            }]);
//                        }
//                        // Treatment method dimension
//                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
//                            return d.processGroupCode + " " + d.processGroupName;
//                        }])
//
//                        if (gran2 == "origin__process__processgroup" || gran2 == "destination__process__processgroup") {
//                            this.groupBy = ["processGroupCode"];
//                        } else if (gran2 == "origin__process" || gran2 == "destination__process") {
//                            this.groupBy = ["processCode"];
//                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
//                                return d.processCode + " " + d.processName;
//                            }]);
//                        }
//
//                        ////////////////////////////
//                        // Space & Material
//                    } else if (dimStrings.includes("space") && dimStrings.includes("material")) {
//
//                        // SPACE
//                        if (!this.options.dimensions.isActorLevel) {
//                            this.x = ["areaName"];
//                            this.tooltipConfig.title = this.label + " totals per area per material";
//                            this.tooltipConfig.tbody.push(["Area", function (d) {
//                                return d.areaName
//                            }]);
//                        } else {
//                            //isActorLevel = true;
//                            this.x = ["actorName"];
//                            this.tooltipConfig.title = this.label + " totals per company per material";
//                            this.tooltipConfig.tbody.push(["Company", function (d) {
//                                return d.actorName
//                            }]);
//                        }
//
//                        // Material
//                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
//                            return d.ewc2Code + " " + d.ewc2Name;
//                        }]);
//                        // ewc2
//                        if (gran2 == "flowchain__waste06__waste04__waste02") {
//                            this.groupBy = ["ewc2Code"];
//                            // ewc4
//                        } else if (gran2 == "flowchain__waste06__waste04") {
//                            this.groupBy = ["ewc4Code"];
//                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
//                                return d.ewc4Code + " " + d.ewc4Name;
//                            }]);
//                            // ewc6
//                        } else if (gran2 == "flowchain__waste06") {
//                            this.groupBy = ["ewc6Code"];
//                            this.tooltipConfig.tbody.push(
//                                ["EWC Sub-Chapter", function (d) {
//                                    return d.ewc4Code + " " + d.ewc4Name;
//                                }],
//                                ["EWC Entry", function (d) {
//                                    return d.ewc6Code + " " + d.ewc6Name;
//                                }]);
//                        }
//
//                        ////////////////////////////
//                        // Economic Activity & Treatment Method
//                    } else if (dimStrings.includes("economicActivity") && dimStrings.includes("treatmentMethod")) {
//
//                        // Economic activity dimension already added
//
//
//                        this.tooltipConfig.title = this.label + " per Economic activity and Treatment method";
//
//                        // Treatment method dimension
//                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
//                            return d.processGroupCode + " " + d.processGroupName;
//                        }])
//
//                        if (gran2 == "origin__process__processgroup" || gran2 == "destination__process__processgroup") {
//                            this.groupBy = ["processGroupCode"];
//                        } else if (gran2 == "origin__process" || gran2 == "destination__process") {
//                            this.groupBy = ["processCode"];
//                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
//                                return d.processCode + " " + d.processName;
//                            }]);
//                        }
//
//                        ///////////////////////////////
//                        // Economic Activity & Material
//                    } else if (dimStrings.includes("economicActivity") && dimStrings.includes("material")) {
//                        this.tooltipConfig.title = this.label + " per Economic activity and Material";
//
//                        // Material
//                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
//                            return d.ewc2Code + " " + d.ewc2Name;
//                        }]);
//                        // ewc2
//                        if (gran2 == "flowchain__waste06__waste04__waste02") {
//                            this.groupBy = ["ewc2Code"];
//                            this.tooltipConfig.title = "Waste per EWC Chapter";
//                            // ewc4
//                        } else if (gran2 == "flowchain__waste06__waste04") {
//                            this.groupBy = ["ewc4Code"];
//                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
//                                return d.ewc4Code + " " + d.ewc4Name;
//                            }]);
//                            // ewc6
//                        } else if (gran2 == "flowchain__waste06") {
//                            this.groupBy = ["ewc6Code"];
//                            this.tooltipConfig.tbody.push(
//                                ["EWC Sub-Chapter", function (d) {
//                                    return d.ewc4Code + " " + d.ewc4Name;
//                                }],
//                                ["EWC Entry", function (d) {
//                                    return d.ewc6Code + " " + d.ewc6Name;
//                                }]);
//                        }
//                    }
//
//                    // Assign colors by groupings:
//                    if (this.groupBy) {
//                        this.flows = enrichFlows.assignColorsByProperty(flows, this.groupBy);
//                    }
//
//                    // Update this.xSort variable to store function if true:
//                    if (this.xSort) {
//                        this.xSort = function (a, b) {
//                            return b["amount"] - a["amount"];
//                        }
//                    }
//
//                    this.render();
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