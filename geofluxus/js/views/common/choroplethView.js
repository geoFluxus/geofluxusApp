define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/choroplethMap',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils'
    ],

    function (
        BaseView,
        _,
        d3,
        ChoroplethMap,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/ChoroplethView
         * @augments module:views/BaseView
         */
        var ChoroplethView = BaseView.extend(
            /** @lends module:views/ChoroplethView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    ChoroplethView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');
                    var _this = this;

                    this.options = options;

                    //this.transformedData = this.transformData(this.flows);
                    //this.render(this.transformedData);
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
                    let groupBy;
                    let tooltipConfig = {};
                    let hasLegend = true;


                    tooltipConfig = {
                        title: function (d) {
                            return d.name
                        },
                        tbody: [
                            ["Total", function (d) {
                                return d["amount"].toFixed(3)
                            }],
                            // ["Name", function (d) {
                            //     return d.name
                            // }]
                        ]
                    }

                    // Create a new D3Plus ChoroplethMap object which will be rendered in this.options.el:
                    this.choroplethMap = new ChoroplethMap({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        tooltipConfig: tooltipConfig,
                        hasLegend: hasLegend,
                    });
                },

                /*
                 * render sankey-diagram in fullscreen
                 */
                toggleFullscreen: function (event) {
                    this.el.classList.toggle('fullscreen');
                    this.refresh();
                    event.stopImmediatePropagation();
                    //this.render(this.transformedData);
                },

                refresh: function (options) {

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

                /*
                 * remove this view from the DOM
                 */
                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return ChoroplethView;
    }
);