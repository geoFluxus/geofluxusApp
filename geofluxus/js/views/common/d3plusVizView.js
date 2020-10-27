define(['views/common/baseview',
        'underscore',
        'visualizations/d3plus',
        'file-saver',
        'utils/utils',
        'utils/enrichFlows',
        'd3plus-export'
    ],

    function (
        BaseView,
        _,
        d3plus,
        FileSaver,
        utils,
        enrichFlows,
        d3plusExport
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
                    // _.bindAll(this, 'exportCSV');
                    _.bindAll(this, 'toggleLegend');

                    var _this = this;

                    this.dimensions = {
                        'time': {
                            'year': 'Year',
                            'month': 'Month',
                        },
                        'economicActivity': {
                            'activitygroup': 'Activity group',
                            'activity': 'Activity',
                        },
                        'treatmentMethod': {
                            'processgroup': 'Treatment method group',
                            'process': 'Treatment method',
                        },
                        'material': {
                            'waste02': 'EWC Chapter',
                            'waste04': 'EWC Sub-Chapter',
                            'waste06': 'EWC Entry'
                        }
                    }

                    this.label = options.dimensions.label;
                    this.tooltipConfig = {
                        tbody: [
                            [this.label, function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]  
                        ]
                    };

                    $(".export-csv").on("click", function() {
                        _this.exportCSV();
                    })

                    $(".export-png").on("click", function() {
                        _this.exportPNG();
                    })

                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    // 'click .export-csv': 'exportCSV',
                    'click .toggle-legend': 'toggleLegend',
                },

                render: function () {

                },

                scrollToVisualization: function () {
                    utils.scrollToVizRow();
                },

                toggleFullscreen: function (event) {
                    $(this.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.el).hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                        $("body").css("overflow", "visible");
                    } else {
                        $("body").css("overflow", "hidden");
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
                    $(".visualizationBlock .card").toggleClass("lightMode");
                    this.render();
                },

                flipGrouping: function() {
                    $(this.options.el).html("");
                    this.groupBy = [this.x, this.x = this.groupBy][0];
                    this.flows = enrichFlows.assignColorsByProperty(this.flows, this.groupBy);
                    this.render();
                },

                exportCSV: function (event) {
                    const items = this.options.flows;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

                    let fields = ["amount", "Code", "Name"];
                    let header = Object.keys(items[0]);
                    header = header.filter(prop => {
                        return fields.some(f => prop.includes(f))
                    })

                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

                    // event.stopImmediatePropagation();
                },

                exportPNG: function() {
                    d3plusExport.saveElement(this.el);
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