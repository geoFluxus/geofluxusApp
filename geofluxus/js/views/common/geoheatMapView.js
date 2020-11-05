var GeoHeatMap = require('react/geoHeatMap').default;

define(['views/common/deckglView',
        'utils/utils',
        'file-saver',
        'underscore',
        'react',
        'react-dom',
    ],

    function (
        DeckglView,
        utils,
        FileSaver,
        _,
        React,
        ReactDOM,
    ) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/GeoHeatMapView
         * @augments module:views/BaseView
         */
        var GeoHeatMapView = DeckglView.extend(
            /** @lends module:views/GeoHeatMapView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    GeoHeatMapView.__super__.initialize.apply(this, [options]);

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

                    // this.props = {
                    //     'activitygroup': 'Activity group',
                    //     'activity': 'Activity',
                    //     'processgroup': 'Treatment method group',
                    //     'process': 'Treatment method',
                    // }

                    this.radiusMap = {
                        "1": 25000,
                        "2": 10000,
                        "3": 7500,
                        "1000": 3000
                    }
                    this.areaLevel = this.filtersView.collections.arealevels.find(areaLevelObject => areaLevelObject.attributes.id == this.dim1[1].adminlevel).attributes.level;
                    this.radius = this.radiusMap[this.areaLevel];

                    this.flows.forEach(function (flow, index) {
                        if (_this.isActorLevel) {
                            this[index] = [this[index].actorLon, this[index].actorLat, this[index].amount];
                        } else {
                            this[index] = [this[index].areaLon, this[index].areaLat, this[index].amount, this[index].areaName];
                        }
                    }, this.flows);

                    this.render();
                    this.loader.deactivate();
                },

                events: {

                },

                render: function () {
                    var _this = this;

                    ReactDOM.render(React.createElement(GeoHeatMap, {
                        data: _this.flows,
                        radius: _this.radius,
                        label: _this.label,
                        isActorLevel: _this.isActorLevel,
                        isDarkMode: _this.isDarkMode,
                    }), document.querySelector(this.options.el));
                    utils.scrollToVizRow();

                    this.addButtons();
                },

                exportCSV: function () {
                    const items = this.options.flows;
                    var csv = "Longitude,Lattitude,Amount,Name\n" + items.map(function (d) {
                        return d.join();
                    }).join('\r\n');

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");
                },

                // close: function () {
                //     try {
                //         var isNotEmpty = document.querySelector("#geoheatmap").html() != "";
                //         if (isNotEmpty) {
                //             console.log("Element is not empty")
                //         }
                //         ReactDOM.unmountComponentAtNode(document.querySelector("#geoheatmap"));
                //         this.undelegateEvents(); // remove click events
                //         this.unbind(); // Unbind all local event bindings
                //     } catch (error) {

                //     }
                // },

            });
        return GeoHeatMapView;
    }
);