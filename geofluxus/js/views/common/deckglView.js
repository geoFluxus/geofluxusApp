var GeoHeatMap = require('react/geoHeatMap').default;

define(['views/common/baseview',
        'file-saver',
        'underscore',
        'd3',
        'react-dom',
    ],

    function (
        BaseView,
        FileSaver,
        _,
        d3,
        ReactDOM,
    ) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/DeckglView
         * @augments module:views/BaseView
         */
        var DeckglView = BaseView.extend(
            /** @lends module:views/DeckglView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    DeckglView.__super__.initialize.apply(this, [options]);

                    var _this = this;
                    this.options = options;

                    this.options.subContainer = ".subContainer";

                    if ($(this.options.el).html() == "") {
                        $(this.options.el).append('<div class="subContainer" style="width: 100%; height: 100%; position: relative"></div>');;
                    }
                    this.options.el = this.options.el + " div";

                    this.ReactDOM = ReactDOM;
                },

                events: {

                },

                render: function () {
                   
                },

                addButtons: function () {
                    let buttonFullscreen = d3.select(this.options.el + " " +".fullscreen-toggle")
                    if (buttonFullscreen.empty()) {

                        let _this = this;

                        let vizContainer = d3.select(this.options.el.split(' ')[0] + " " + this.options.subContainer);
                        vizContainer.append("div")
                            .attr("class", "controlContainer")
                            .style("top", "0px")
                            .style("position", "relative")
                            .style("z-index", "100")
                            .lower();

                        let controlContainer = vizContainer.select(".controlContainer")

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button fullscreen-toggle")
                            .attr("title", "View this visualization in fullscreen mode.")
                            .attr("type", "button")
                            .html('<i class="fas fa-expand icon-fullscreen"></i>')
                            .on("click", function () {
                                _this.toggleFullscreen();
                            });

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button export-csv")
                            .attr("title", "Export the data of this visualization as a CSV file.")
                            .attr("type", "button")
                            .html('<i class="fas fa-file icon-export"></i>')
                            .on("click", function () {
                                _this.exportCSV();
                                d3.event.preventDefault();
                            });

                        controlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-darkmode")
                            .attr("title", "Toggle light or dark mode.")
                            .attr("type", "button")
                            .html('<i class="fas icon-toggle-darkmode"></i>')
                            .on("click", function () {
                                _this.toggleDarkMode();
                            });
                    }
                },

                toggleFullscreen: function (event) {
                    $(this.options.subContainer).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.options.el).hasClass('fullscreen')) {
                        window.scrollTo({
                            top: $(".visualizationRow")[0].getBoundingClientRect().top + window.pageYOffset - 20,
                            block: "start",
                            inline: "nearest",
                        });
                    }
                    // this.render();
                },

                toggleDarkMode: function () {
                    this.isDarkMode = !this.isDarkMode;
                    if (this.isDarkMode) {
                        const mapStyle = "mapbox://styles/mapbox/dark-v9"
                    } else {
                        const mapStyle = "mapbox://styles/mapbox/light-v9"
                    }

                    $(".viz-wrapper-div").toggleClass("lightMode");
                    this.fontColor = this.isDarkMode ? "white" : "black";
                    this.render();
                },

                exportCSV: function () {

                    // TO DO

                    // const items = this.options.flows;
                    // var csv = "Longitude,Lattitude,Amount,Name\n" + items.map(function (d) {
                    //     return d.join();
                    // }).join('\r\n');

                    // var blob = new Blob([csv], {
                    //     type: "text/plain;charset=utf-8"
                    // });
                    // FileSaver.saveAs(blob, "data.csv");
                },

                close: function () {
                    try {
                        this.ReactDOM.unmountComponentAtNode(document.querySelector(this.options.subContainer));
                        $(this.options.subContainer + " .controlContainer").html("");
                        this.undelegateEvents(); // remove click events
                        this.unbind(); // Unbind all local event bindings
                    } catch (error) {
                        console.log("Error during closing: ", error);
                    }
                },

            });
        return DeckglView;
    }
);