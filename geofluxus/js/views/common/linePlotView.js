define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/linePlot',
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
        d3plus,
        LinePlot,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/LinePlotView
         * @augments module:views/BaseView
         */
        var LinePlotView = BaseView.extend(
            /** @lends module:views/LinePlotView.prototype */
            {
                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    LinePlotView.__super__.initialize.apply(this, [options]);
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

                    let dimensionsActual = [];
                    this.options.dimensions.forEach(dim => dimensionsActual.push(dim[0]));

                    let hasMultipleLines = this.options.hasMultipleLines;
                    let tooltipConfig = {
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }]
                        ]
                    };
                    let groupBy;
                    let x;

                    let isActorLevel = false;

                    // /////////////////////////////
                    // Time dimension
                    if (this.options.dimensions[0][0] == "time") {

                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            x = ["year"];
                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];
                            if (hasMultipleLines) {
                                groupBy = ["year"];
                                x = ["monthName"];
                            }
                            tooltipConfig.title = "Waste totals per month";
                            tooltipConfig.tbody.push(["Month", function (d) {
                                return d.month
                            }]);
                        }

                    }

                    // ///////////////////////////////////////////////////////////////////////////////////////////////////

                    // //////////////////////////////////////////
                    // Time & Space
                    if (dimensionsActual.includes("time") && dimensionsActual.includes("space")) {

                        // TIME ----------------
                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            x = ["year"];
                            tooltipConfig.tbody.push(["Year", function (d) {
                                return d.year
                            }]);

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];
                            tooltipConfig.tbody.push(["Month", function (d) {
                                return d.month
                            }]);
                        }

                        // SPACE ----------------
                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                            tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);
                        } else {
                            isActorLevel = true;
                            groupBy = ["actorId"];
                            tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                        }

                        // //////////////////////////////////////////
                        // Time & Economic Activity
                    } else if (dimensionsActual.includes("time") && dimensionsActual.includes("economicActivity")) {

                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            x = ["year"];
                            tooltipConfig.tbody.push(["Year", function (d) {
                                return d.year
                            }]);

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];

                            if (hasMultipleLines) {
                                groupBy = ["year"];
                                x = ["monthName"];
                            }
                            tooltipConfig.tbody.push(["Month", function (d) {
                                return d.month
                            }]);
                        }

                        tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }, ])

                        if (this.options.dimensions[1][1] == "origin__activity__activitygroup" || this.options.dimensions[1][1] == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];
                        } else if (this.options.dimensions[1][1] == "origin__activity" || this.options.dimensions[1][1] == "destination__activity") {
                            groupBy = ["activityCode"];
                            tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // Time & Treatment method
                    } else if (dimensionsActual.includes("time") && dimensionsActual.includes("treatmentMethod")) {

                        // ///////////////
                        // Time dimension

                        // Granularity = year
                        if (this.options.dimensions[0][1] == "flowchain__month__year") {
                            x = ["year"];
                            tooltipConfig.tbody.push(["Year", function (d) {
                                return d.year
                            }]);

                            // Granularity = month:
                        } else if (this.options.dimensions[0][1] == "flowchain__month") {
                            x = ["yearMonthCode"];

                            if (hasMultipleLines) {
                                groupBy = ["year"];
                                x = ["monthName"];
                            }
                            tooltipConfig.tbody.push(["Month", function (d) {
                                return d.month
                            }]);
                        }

                        // ///////////////
                        // Treatment method dimension
                        tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }])

                        if (this.options.dimensions[1][1] == "origin__process__processgroup" || this.options.dimensions[1][1] == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];
                        } else if (this.options.dimensions[1][1] == "origin__process" || this.options.dimensions[1][1] == "destination__process") {
                            groupBy = ["processCode"];
                            tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }
                    }


                    // Create a new D3Plus linePlot object which will be rendered in this.options.el:
                    this.linePlot = new LinePlot({
                        el: this.options.el,
                        data: flows,
                        groupBy: groupBy,
                        x: x,
                        tooltipConfig: tooltipConfig,
                        isActorLevel: isActorLevel,
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
        return LinePlotView;
    }
);