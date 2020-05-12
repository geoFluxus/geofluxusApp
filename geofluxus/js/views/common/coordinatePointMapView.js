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
                    let _this = this;
                    let flows = this.options.flows;
                    let tooltipConfig = {
                        title: function (d) {
                            return d.actorName
                        },
                        tbody: [
                            ["Waste", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }],
                        ]
                    }

                    // Create a new D3Plus CoordinatePointMap object which will be rendered in this.options.el:
                    this.coordinatePointMap = new CoordinatePointMap({
                        el: this.options.el,
                        data: flows,
                        tooltipConfig: tooltipConfig,
                    });

                    // Smooth scroll to top of Viz
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth"
                    });
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    event.stopImmediatePropagation();
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                    window.dispatchEvent(new Event('resize'));
                },

                exportCSV: function (event) {
                    const items = this.options.flows;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
                    const header = Object.keys(items[0])
                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

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