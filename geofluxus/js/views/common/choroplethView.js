define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/choroplethMap',
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
        ChoroplethMap,
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
                    this.options = options;
                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                },

                render: function (data) {
                    let _this = this;
                    let flows = this.options.flows;
                    let tooltipConfig = {
                        title: function (d) {
                            return d.areaName
                        },
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }],
                        ]
                    }

                    // Create a new D3Plus ChoroplethMap object which will be rendered in this.options.el:
                    this.choroplethMap = new ChoroplethMap({
                        el: this.options.el,
                        data: flows,
                        tooltipConfig: tooltipConfig,
                        geoJson: this.options.geoJson,
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

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return ChoroplethView;
    }
);