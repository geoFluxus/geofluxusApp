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
                    this.canFlipGrouping = false;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    this.flows = this.options.flows;
                    this.label = this.options.label;
                    this.tooltipConfig.title = "";

                    this.groupBy = this.x = "";

                    // configure tooltips
                    let dimensions = this.options.dimensions;
                    var title = "";
                    dimensions.forEach(function(dim, index) {
                        // choose grouping for space dimension
                        if (dim[0] == 'space') {
                            var actorLevel = _this.options.dimensions.isActorLevel,
                                prop = actorLevel ? "actorName" : "areaName",
                                label = actorLevel ? 'Company' : 'Area';
                            if (!index) {
                                _this.groupBy = _this.x = prop;
                                title = _this.label + " per " + label;
                            } else {
                                _this.groupBy = prop;
                                title = " & " + label;
                            }
                            _this.tooltipConfig.tbody.push([label, function (d) {
                                return d[prop];
                            }]);
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

                    if (dimensions.length > 1) {
                        this.canFlipGrouping = true;
                    }

                    // assign colors by groupings
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy);

                    // Disable legend there are more than fifty groups:
                    this.canHaveLegend = this.hasLegend = enrichFlows.checkToDisableLegend(this.flows, this.groupBy);

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                    'click .toggle-darkmode': 'toggleDarkMode',
                    'click .flip-grouping': 'flipGrouping',
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
                        canFlipGrouping: this.canFlipGrouping,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.loader.deactivate();
                }
            });
        return BarChartView;
    }
);