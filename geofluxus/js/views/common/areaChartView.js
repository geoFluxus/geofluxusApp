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
                    _.bindAll(this, 'toggleDarkMode');

                    var _this = this;
                    this.options = options;
                    this.isStacked = true;

                    this.canHaveLegend = true;
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
                        canHaveLegend: this.canHaveLegend,
                        hasLegend: this.hasLegend,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return AreaChartView;
    }
);