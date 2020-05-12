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
                    _.bindAll(this, 'exportCSV');

                    this.options = options;

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },

                render: function (data) {
                    let _this = this;
                    let flows = this.options.flows;
                    let occurances = [];

                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];
                    // let dim2String = this.options.dimensions[1][0];
                    let gran2 = this.options.dimensions[1] ? this.options.dimensions[1][1] : {};

                    let dimStrings = [];
                    this.options.dimensions.forEach(dim => dimStrings.push(dim[0]));

                    let groupBy;
                    let x;
                    let isActorLevel = false;
                    let hasMultipleLines = this.options.hasMultipleLines;
                    let tooltipConfig = {
                        tbody: [
                            ["Waste", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };


                    // /////////////////////////////
                    // 1D - Time dimension

                    // Granularity = year
                    if (gran1 == "flowchain__month__year") {
                        x = ["year"];
                        tooltipConfig.title = "Waste totals per year";
                        tooltipConfig.tbody.push(["Year", function (d) {
                            return d.year
                        }]);

                        // Granularity = month:
                    } else if (gran1 == "flowchain__month") {
                        x = ["yearMonthCode"];

                        // Only for time
                        if (dim1String.length == 1 && hasMultipleLines) {
                            groupBy = ["year"];
                            x = ["monthName"];
                        }
                        tooltipConfig.title = "Waste totals per month";
                        tooltipConfig.tbody.push(["Month", function (d) {
                            return d.month
                        }]);
                    }


                    // //////////////////////////////////////////
                    // 2D - Time & Space
                    if (dimStrings.includes("space")) {

                        if (!this.options.dimensions.isActorLevel) {
                            groupBy = ["areaName"];
                            tooltipConfig.tbody.push(["Area", function (d) {
                                return d.areaName
                            }]);


                            // Get all unique occurences
                            occurances = flows.map(x => x.areaName);
                            occurances = _.unique(occurances);

                            // Create array with unique colors:
                            colorArray = utils.interpolateColors(occurances.length);

                            // Create array with prop of areaName and prop of matching color:
                            occurances.forEach(function (areaName, index) {
                                this[index] = {
                                    areaName: this[index],
                                    color: colorArray[index],
                                };
                            }, occurances);
                            console.log(occurances)


                            // Asisgn a color for each areaName:
                            flows.forEach(function (flow, index) {
                                this[index].color = occurances.find(occ => occ.areaName == flow.areaName).color;
                            }, flows);

                            console.log(flows);



                        } else {
                            isActorLevel = true;
                            groupBy = ["actorId"];
                            tooltipConfig.tbody.push(["Company", function (d) {
                                return d.actorName
                            }]);
                            // Get all unique occurences
                            occurances = flows.map(x => x.actorId);
                        }



                        // //////////////////////////////////////////
                        // 2D - Time & Economic Activity
                    } else if (dimStrings.includes("economicActivity")) {

                        tooltipConfig.tbody.push(["Activity group", function (d) {
                            return d.activityGroupCode + " " + d.activityGroupName;
                        }, ])

                        if (gran2 == "origin__activity__activitygroup" || gran2 == "destination__activity__activitygroup") {
                            groupBy = ["activityGroupCode"];
                        } else if (gran2 == "origin__activity" || gran2 == "destination__activity") {
                            groupBy = ["activityCode"];
                            tooltipConfig.tbody.push(["Activity", function (d) {
                                return d.activityCode + " " + d.activityName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // 2D - Time & Treatment method
                    } else if (dimStrings.includes("treatmentMethod")) {

                        tooltipConfig.tbody.push(["Treatment method group", function (d) {
                            return d.processGroupCode + " " + d.processGroupName;
                        }])

                        if (gran2 == "origin__process__processgroup" || gran2 == "destination__process__processgroup") {
                            groupBy = ["processGroupCode"];
                        } else if (gran2 == "origin__process" || gran2 == "destination__process") {
                            groupBy = ["processCode"];
                            tooltipConfig.tbody.push(["Treatment method", function (d) {
                                return d.processCode + " " + d.processName;
                            }]);
                        }

                        // //////////////////////////////////////////
                        // 2D - Time & Material
                    } else if (dimStrings.includes("material")) {

                        tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                            return d.ewc2Code + " " + d.ewc2Name;
                        }]);

                        // ewc2
                        if (gran2 == "flowchain__waste06__waste04__waste02") {
                            groupBy = ["ewc2Code"];
                            tooltipConfig.title = "Waste per EWC Chapter";
                            // ewc4
                        } else if (gran2 == "flowchain__waste06__waste04") {
                            groupBy = ["ewc4Code"];
                            tooltipConfig.title = "Waste per EWC Sub-Chapter";
                            tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                                return d.ewc4Code + " " + d.ewc4Name;
                            }]);
                            // ewc6
                        } else if (gran2 == "flowchain__waste06") {
                            groupBy = ["ewc6Code"];
                            tooltipConfig.title = "Waste per Entry";
                            tooltipConfig.tbody.push(
                                ["EWC Sub-Chapter", function (d) {
                                    return d.ewc4Code + " " + d.ewc4Name;
                                }],
                                ["EWC Entry", function (d) {
                                    return d.ewc6Code + " " + d.ewc6Name;
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
        return LinePlotView;
    }
);