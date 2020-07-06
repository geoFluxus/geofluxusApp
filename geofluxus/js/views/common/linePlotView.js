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

                    var _this = this;
                    this.options = options;
                    this.isStacked = this.options.isStacked;

                    this.canHaveLegend = true;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    this.flows = this.options.flows;
                    this.label = this.options.label;
                    this.tooltipConfig.title = "";

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
                    var title = "";
                    dimensions.forEach(function(dim, index) {
                        // choose grouping for space dimension
                        if (dim[0] == 'space') {
                            var actorLevel = _this.options.dimensions.isActorLevel;
                            _this.groupBy = _this.x = actorLevel ? "actorName" : "areaName";
                            _this.tooltipConfig.title = _this.label + " per " + (actorLevel ? 'Company' : 'Area');
                        }

                        var properties = _this.dimensions[dim[0]];
                        if (properties != undefined & _this.flows.length > 0) {
                            Object.keys(properties).forEach(function(prop) {
                                // check if flows have code/name for current property
                                var flow = _this.flows[0],
                                    code = prop + 'Code',
                                    name = prop + 'Name';

                                // if code, group by
                                if (flow[code] != undefined) {
                                    // if name, add tooltip
                                    if (flow[name] != undefined) {
                                        // tooltip subtitle (body)
                                        var sub = properties[prop];

                                        // tooltip title (header)
                                        if (!index) {
                                            _this.x = _this.groupBy = code;
                                            title = _this.label + " per " + sub;
                                        } else {
                                            _this.groupBy = code;
                                            title = " & " + sub;
                                        }

                                        // tooltip body
                                        _this.tooltipConfig.tbody.push([sub, function (d) {
                                            return d[code] + " " + d[name];
                                        }]);
                                    }
                                }
                            })
                        }

                        _this.tooltipConfig.title += title;
                    })

                    // assign colors by groupings
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