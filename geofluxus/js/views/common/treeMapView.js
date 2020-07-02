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

                    var _this = this;

                    this.options = options;
                    this.flows = this.options.flows;

                    this.hasLegend = true;
                    this.canHaveLegend = true;
                    this.isDarkMode = true;

                    this.groupBy = [];

                    this.props = {
                        'year'          : 'Year',
                        'month'         : 'Month',
                        'activitygroup' : 'Activity group',
                        'activity'      : 'Activity',
                        'processgroup'  : 'Treatment method group',
                        'process'       : 'Treatment method',
                        'waste02'       : 'EWC Chapter',
                        'waste04'       : 'EWC Sub-Chapter',
                        'waste06'       : 'EWC Entry'
                    }

                    let dim = this.options.dimensions[0][0],
                        gran = this.options.dimensions[0][1];

                    // configure tooltips
                    Object.keys(this.props).forEach(function(property) {
                        // check if flows have code/name for current property
                        var flow = _this.flows[0],
                            code = property + 'Code',
                            name = property + 'Name';

                        // if code, group by
                        if (flow[code] != undefined && flow[code] != "") {
                            _this.groupBy.push(code); // group by multiple CODES

                            // if name, add tooltip
                            if (flow[name] != undefined && flow[name] != "") {
                                _this.tooltipConfig.tbody.push([_this.props[property], function (d) {
                                    return d[code] + " " + d[name];
                                }]);
                            }
                        }
                    })

                    // choose grouping for time / space dimension
                    if (dim == 'space') {
                        this.groupBy = this.options.dimensions.isActorLevel ? ["actorName"] : ["areaName"];
                    }

                    // assign colors by groupings
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy[0]);
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