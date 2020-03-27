define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/coordinatePointMap',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils',
        'd3plus',
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
                    let tooltipConfig = {};

                    tooltipConfig = {
                        title: function (d) {
                            return d.actorName
                        },
                        tbody: [
                            ["Total", function (d) {
                                return d["amount"].toFixed(3)
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


                exportCSV: function (event) {
                    if (!this.transformedData) return;

                    var header = ['Origin', 'Origin Code',
                            'Destination', 'Destination Code',
                            'Amount (t/year)'
                        ],
                        rows = [],
                        _this = this;
                    rows.push(header.join(',\t'));
                    this.transformedData.links.forEach(function (link) {
                        var origin = link.source,
                            destination = link.target,
                            originName = origin.name,
                            destinationName = destination.name,
                            amount = link.value.toFixed(3);

                        var originCode = origin.code,
                            destinationCode = destination.code;

                        var row = ['"' + originName + '",', originCode + ',"', destinationName + '",', destinationCode + ',', amount];
                        rows.push(row.join('\t'));
                    });
                    var text = rows.join('\r\n');
                    var blob = new Blob([text], {
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