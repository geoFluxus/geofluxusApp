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

                    this.titles = {
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

                    // choose grouping
                    this.groupBy = "code"; // default option
                    if (dim == 'space') {
                        this.groupBy = this.options.dimensions.isActorLevel ? "actorName" : "areaName";
                    }

                    // configure tooltips
                    if (typeof gran == 'string') gran = gran.split("__").pop();
                    if (this.titles[gran] !== undefined) {
                        this.tooltipConfig.tbody.push([this.titles[gran], function (d) {
                            return d.code + " " + d.name;
                        }]);
                    }

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