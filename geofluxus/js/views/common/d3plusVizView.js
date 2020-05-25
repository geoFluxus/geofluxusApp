define(['views/common/baseview',
        'underscore',
        'visualizations/d3plus',
        'file-saver',
        'utils/utils',
    ],

    function (
        BaseView,
        _,
        d3plus,
        FileSaver,
        utils,
    ) {
        /**
         * @author Evert Van Hirtum
         * @name module:views/D3plusVizView
         * @augments module:views/BaseView
         */
        var D3plusVizView = BaseView.extend(
            /** @lends module:views/D3plusVizView.prototype */
            {

                /**
                 * @param {Object} options
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    D3plusVizView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleLegend');

                    this.tooltipConfig = {
                        tbody: [
                            ["Waste", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                },

                render: function () {

                },

                scrollToVisualization: function () {
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                    window.dispatchEvent(new Event('resize'));
                    event.stopImmediatePropagation();
                },

                toggleLegend: function (event) {
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
        return D3plusVizView;
    }
);