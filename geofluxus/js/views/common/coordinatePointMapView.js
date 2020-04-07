define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/coordinatePointMap',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils',
        'visualizations/d3plus',
    ],

    function (
        BaseView,
        _,
        d3,
        CoordinatePointMap,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        d3plus,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/CoordinatePointMapView
         * @augments module:views/BaseView
         */
        var CoordinatePointMapView = BaseView.extend(
            /** @lends module:views/CoordinatePointMapView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    CoordinatePointMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    var _this = this;

                    this.options = options;

                    this.render();
                },


                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                /*
                 * render the view
                 */
                render: function (data) {
                    let flows = this.options.flows;
                    let tooltipConfig = {
                        title: function (d) {
                            return d.actorName
                        },
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }],
                        ]
                    }

                    // Create a new D3Plus CoordinatePointMap object which will be rendered in this.options.el:
                    this.coordinatePointMap = new CoordinatePointMap({
                        el: this.options.el,
                        data: flows,
                        tooltipConfig: tooltipConfig,
                    });
                },

                toggleFullscreen: function (event) {
                    this.el.classList.toggle('fullscreen');
                    this.refresh();
                    event.stopImmediatePropagation();
                },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return CoordinatePointMapView;
    }
);