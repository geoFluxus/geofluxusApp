define(['views/common/baseview',
        'underscore',
        'visualizations/coordinatePointMap',
    ],

    function (
        BaseView,
        _,
        CoordinatePointMap) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/CoordinatePointMapView
         * @augments module:views/BaseView
         */
        var CoordinatePointMapView = BaseView.extend(
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

                    this.options = options;
                    this.flows = this.options.flows;
                    this.tooltipConfig.title = function (d) {
                        return d.actorName
                    }

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                /**
                 * Create a new D3Plus CoordinatePointMap object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.coordinatePointMap = new CoordinatePointMap({
                        el: this.options.el,
                        data: this.flows,
                        tooltipConfig: this.tooltipConfig,
                    });
                    this.scrollToVisualization();
                }
            });
        return CoordinatePointMapView;
    }
);