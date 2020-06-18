define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/treeMap',
        'utils/enrichFlows',
    ],

    function (
        D3plusVizView,
        _,
        TreeMap,
        enrichFlows) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/TreeMapView
         * @augments module:views/D3plusVizView
         */
        var TreeMapView = D3plusVizView.extend(
            /** @lends module:views/TreeMapView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    TreeMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleLegend');
                    _.bindAll(this, 'toggleDarkMode');

                    this.hasLegend = true;
                    this.canHaveLegend = true;
                    this.isDarkMode = true;

                    this.options = options;
                    this.flows = this.options.flows;

                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];

                    this.groupBy = "";

                    // /////////////////////////////
                    // Time dimension
                    if (dim1String == "time") {
                        // Granularity = year
                        if (gran1 == "flowchain__month__year") {
                            this.groupBy = ["year"];
                            // Granularity = month:
                        } else if (gran1 == "flowchain__month") {
                            this.groupBy = ["year", "month"];
                        }

                        // Space dimension
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

                        // Granularity = Activity group
                        if (gran1 == "origin__activity__activitygroup" || gran1 == "destination__activity__activitygroup") {
                            this.groupBy = ["activityGroupCode"];
                            // Granularity: Activity
                        } else if (gran1 == "origin__activity" || gran1 == "destination__activity") {
                            this.groupBy = ["activityGroupCode", "activityCode"];
                            this.tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // Treatment method dimension
                    } else if (dim1String == "treatmentMethod") {

                        this.tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }]);

                        if (gran1 == "origin__process__processgroup" || gran1 == "destination__process__processgroup") {
                            this.groupBy = ["processGroupCode"];

                            // Granularity: Treatment method
                        } else if (gran1 == "origin__process" || gran1 == "destination__process") {
                            this.groupBy = ["processGroupCode", "processCode"];
                            this.tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // Material
                    } else if (dim1String == "material") {
                        this.tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                            return d.ewc2Code + " " + d.ewc2Name;
                        }]);

                        // ewc2
                        if (gran1 == "flowchain__waste06__waste04__waste02") {
                            this.groupBy = ["ewc2Code"];
                            this.tooltipConfig.title = this.label + " per EWC Chapter";
                            // ewc4
                        } else if (gran1 == "flowchain__waste06__waste04") {
                            this.groupBy = ["ewc2Code", "ewc4Code"];
                            this.tooltipConfig.title = this.label + " per EWC Sub-Chapter";
                            this.tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran1 == "flowchain__waste06") {
                            this.groupBy = ["ewc2Code", "ewc4Code", "ewc6Code"];
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
                        this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy[0])
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
                 * Create a new D3Plus TreeMap object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.TreeMap = new TreeMap({
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
        return TreeMapView;
    }
);