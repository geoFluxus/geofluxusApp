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

                    var _this = this;

                    var _this = this;
                    this.options = options;

                    this.canHaveLegend = true;
                    this.hasLegend = true;
                    this.isDarkMode = true;

                    this.flows = this.options.flows;
                    this.label = this.options.label;
                    this.tooltipConfig.title = "";

                    this.preProcess();

                    this.render();
                },

                events: {
                    'click .close-toggle': 'toggleClose',
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                    'click .toggle-darkmode': 'toggleDarkMode',
                },

                /**
                 * Create a new D3Plus PieChart object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.renderTitle();
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
                },

                preProcess: function () {
                    var _this = this;
                    let dimensions = this.options.dimensions;

                    this.tooltipConfig.tbody.length = 1;
                    var title = this.tooltipConfig.title = "";

                    this.groupBy = "";

                    dimensions.forEach(function (dim, index) {
                        // choose grouping for space dimension
                        if (dim[0] == 'space') {
                            var actorLevel = dimensions.isActorLevel,
                                prop = actorLevel ? "actorName" : "areaName",
                                label = actorLevel ? 'Bedrijf' : 'Gebied';
                            if (!index) {
                                _this.groupBy = prop;
                                title = _this.label + " per " + label;
                            } else {
                                _this.groupBy.push(prop);
                                title = " & " + label;
                            }
                            _this.tooltipConfig.tbody.push([label, function (d) {
                                return d[prop];
                            }]);
                        }

                        var properties = _this.dimensions[dim[0]];
                        if (properties != undefined & _this.flows.length > 0) {
                            Object.keys(properties).forEach(function (prop) {
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
                                            _this.groupBy = code;
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
                    // Disable legend there are more than fifty groups:
                    this.canHaveLegend = this.hasLegend = enrichFlows.checkToDisableLegend(this.flows, this.groupBy);
                },
            });
        return PieChartView;
    }
);