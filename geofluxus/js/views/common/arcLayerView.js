var ArcLayer = require('react/arcLayer').default;

define(['views/common/deckglView',
        'utils/utils',
        'file-saver',
        'underscore',
        'react',
        'react-dom',
        'utils/enrichFlows'
    ],

    function (
        DeckglView,
        utils,
        FileSaver,
        _,
        React,
        ReactDOM,
        enrichFlows
    ) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/ArcLayerView
         * @augments module:views/BaseView
         */
        var ArcLayerView = DeckglView.extend(
            /** @lends module:views/ArcLayerView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    ArcLayerView.__super__.initialize.apply(this, [options]);

                    var _this = this;
                    this.options = options;

                    // this.options.subContainer = "#subContainer";

                    // if ($(this.options.el).html() == "") {
                    //     $(this.options.el).append('<div id="geoheatmap" style="width: 100%; height: 100%; position: relative"></div>');;
                    // }

                    // this.options.el = this.options.el + " div";

                    this.flows = this.options.flows;

                    this.filtersView = this.options.flowsView.filtersView;
                    this.dim1 = this.options.dimensions[0];
                    this.dim2 = this.options.dimensions[1];

                    this.isActorLevel = _this.options.dimensions.isActorLevel;
                    this.label = this.options.dimensions.label;
                    this.isDarkMode = true;
                    this.fontColor = "white";

                    // this.flows.forEach(function (flow, index) {
                    //     if (_this.isActorLevel) {
                    //         this[index] = [this[index].actorLon, this[index].actorLat, this[index].amount];
                    //     } else {
                    //         this[index] = [this[index].areaLon, this[index].areaLat, this[index].amount, this[index].areaName];
                    //     }
                    // }, this.flows);

                    this.flows = enrichFlows.assignColorsByProperty(this.flows, "activitygroup");
                    this.render();
                    this.options.flowsView.loader.deactivate();
                },

                events: {

                },

                render: function () {
                    var _this = this;

                    this.ReactDOM.render(React.createElement(ArcLayer, {
                        element: _this.options.el,
                        data: _this.flows,
                        label: _this.label,
                        isActorLevel: _this.isActorLevel,
                        isDarkMode: _this.isDarkMode,
                    }), document.querySelector(this.options.el));
                    utils.scrollToVizRow();
                    this.addButtons();
                },

                exportCSV: function (event) {
                    const items = this.flows;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

                    let header = Object.keys(items[0]);

                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

                    event.stopImmediatePropagation();
                },

            });
        return ArcLayerView;
    }
);