define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/choroplethMap',
    ],

    function (
        D3plusVizView,
        _,
        ChoroplethMap) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/ChoroplethView
         * @augments module:views/D3plusVizView
         */
        var ChoroplethView = D3plusVizView.extend(
            /** @lends module:views/ChoroplethView.prototype */
            {
                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el  element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    ChoroplethView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleDarkMode');

                    this.isDarkMode = true;
                    this.canHaveLegend = false;

                    this.options = options;
                    this.flows = this.options.flows;
                    this.tooltipConfig.title = function (d) {
                        return d.areaName
                    }

                    this.render();
                },

                events: {
                    'click .close-toggle': 'toggleClose',
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-darkmode': 'toggleDarkMode',
                },

                /**
                 * Create a new D3Plus ChoroplethMap object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.renderTitle();
                    this.choroplethMap = new ChoroplethMap({
                        el: this.options.el,
                        data: this.flows,
                        tooltipConfig: this.tooltipConfig,
                        canHaveLegend: this.canHaveLegend,
                        geoJson: this.options.geoJson,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return ChoroplethView;
    }
);