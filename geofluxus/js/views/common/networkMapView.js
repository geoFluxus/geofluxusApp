define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/d3plus',
        'visualizations/networkMap',
        'file-saver',
        'utils/utils',
        'utils/enrichFlows',
    ],

    function (
        BaseView,
        _,
        Collection,
        d3plus,
        NetworkMap,
        FileSaver,
        utils,
        enrichFlows
    ) {
        /**
         * @author Evert Van Hirtum
         * @name module:views/NetworkMapView
         * @augments module:views/BaseView
         */
        var NetworkMapView = BaseView.extend(
            /** @lends module:views/NetworkMapView.prototype */
            {
                /**
                 * @param {Object} options
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    NetworkMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleLegend');

                    var _this = this;
                    this.options = options;
                    this.flows = this.options.flows;

                    this.label = options.dimensions.label;
                    this.tooltipConfig = {
                        tbody: [
                            [this.label, function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };

                    this.fetchNetworkThenRender();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                },

                render: function () {
                    this.NetworkMap = new NetworkMap({
                        el: this.options.el,
                        flows: this.flows,
                        network: this.network,
                    })
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                },

                fetchNetworkThenRender: function () {
                    var _this = this;

                    this.network = new Collection([], {
                        apiTag: 'ways',
                    });
                    this.network.fetch({
                        success: function () {
                            _this.render();
                            _this.options.flowsView.loader.deactivate();
                        },
                        error: function (res) {
                            _this.options.flowsView.loader.deactivate();
                            console.log(res);
                        }
                    });
                },

                scrollToVisualization: function () {
                    utils.scrollToVizRow();
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                    }
                    window.dispatchEvent(new Event('resize'));
                    event.stopImmediatePropagation();
                },

                toggleLegend: function () {
                    $(this.options.el).html("");
                    this.hasLegend = !this.hasLegend;
                    this.render();
                },

                toggleDarkMode: function () {
                    $(this.options.el).html("");
                    this.isDarkMode = !this.isDarkMode;
                    $(".viz-wrapper-div").toggleClass("lightMode");
                    this.render();
                },

                flipGrouping: function () {
                    $(this.options.el).html("");
                    this.groupBy = [this.x, this.x = this.groupBy][0];
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy);
                    this.render();
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
        return NetworkMapView;
    }
);