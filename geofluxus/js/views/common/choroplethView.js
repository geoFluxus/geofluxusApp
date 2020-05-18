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

                    this.options = options;
                    this.flows = this.options.flows;
                    this.tooltipConfig.title = function (d) {
                        return d.areaName
                    }

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                /**
                 * Create a new D3Plus ChoroplethMap object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.choroplethMap = new ChoroplethMap({
                        el: this.options.el,
                        data: this.flows,
                        tooltipConfig: this.tooltipConfig,
                        geoJson: this.options.geoJson,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                }
            });
        return ChoroplethView;
    }
);