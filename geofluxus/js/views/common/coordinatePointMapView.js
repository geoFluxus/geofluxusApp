define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/coordinatePointMap',
    ],

    function (
        D3plusVizView,
        _,
        CoordinatePointMap) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/CoordinatePointMapView
         * @augments module:views/D3plusVizView
         */
        var CoordinatePointMapView = D3plusVizView.extend(
            /** @lends module:views/CoordinatePointMapView.prototype */
            {
                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el  element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    CoordinatePointMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleDarkMode');

                    this.isDarkMode = true;
                    this.canHaveLegend = false;

                    this.options = options;
                    this.flows = this.options.flows;
                    this.label = this.options.label;
                    let dimensions = this.options.dimensions,
                        actorLevel = dimensions.isActorLevel,
                        prop = actorLevel ? "actorName" : "areaName",
                        label = actorLevel ? 'Bedrijf' : 'Gebied';
                    this.tooltipConfig.title = this.label + " per " + label;
                    this.tooltipConfig.tbody.push([label, function (d) {
                        return d[prop];
                    }]);

                    this.render();
                },

                events: {
                    'click .close-toggle': 'toggleClose',
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-darkmode': 'toggleDarkMode',
                },

                /**
                 * Create a new D3Plus CoordinatePointMap object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.renderTitle();
                    this.coordinatePointMap = new CoordinatePointMap({
                        el: this.options.el,
                        data: this.flows,
                        tooltipConfig: this.tooltipConfig,
                        isDarkMode: this.isDarkMode,
                        canHaveLegend: this.canHaveLegend,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return CoordinatePointMapView;
    }
);