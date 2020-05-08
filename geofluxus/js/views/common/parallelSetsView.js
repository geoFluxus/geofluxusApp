define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/simpleSankey',
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
        SimpleSankey,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        Slider) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/ParallelSetsView
         * @augments module:views/BaseView
         */
        var ParallelSetsView = BaseView.extend(
            /** @lends module:views/ParallelSetsView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    ParallelSetsView.__super__.initialize.apply(this, [options]);
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

                    let dim1String = this.options.dimensions[0][0];
                    let gran1 = this.options.dimensions[0][1];

                    let groupBy;
                    let tooltipConfig = {
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["amount"], utils.returnD3plusFormatLocale())
                            }]
                        ]
                    };

                    flows = this.transformToLinksAndNodes(this.options.flows);

                    // // /////////////////////////////
                    // // Time dimension
                    // if (dim1String == "time") {
                    //     // Granularity = year
                    //     if (gran1 == "flowchain__month__year") {
                    //         groupBy = ["year"];
                    //         // Granularity = month:
                    //     } else if (gran1 == "flowchain__month") {
                    //         groupBy = ["year", "month"];
                    //     }

                    //     // Space dimension
                    // } else if (dim1String == "space") {

                    //     // Areas:
                    //     if (!this.options.dimensions.isActorLevel) {
                    //         groupBy = ["areaName"];
                    //     } else {
                    //         // Actor level
                    //         groupBy = ["actorName"];
                    //     }

                    //     // Economic Activity dimension
                    // } else if (dim1String == "economicActivity") {
                    //     tooltipConfig.tbody.push(["Activity group", function (d) {
                    //         return d.activityGroupCode + " " + d.activityGroupName;
                    //     }]);

                    //     // Granularity = Activity group
                    //     if (gran1 == "origin__activity__activitygroup" || gran1 == "destination__activity__activitygroup") {
                    //         groupBy = ["activityGroupCode"];
                    //         // Granularity: Activity
                    //     } else if (gran1 == "origin__activity" || gran1 == "destination__activity") {
                    //         groupBy = ["activityGroupCode", "activityCode"];
                    //         tooltipConfig.tbody.push(["Activity", function (d) {
                    //             return d.activityCode + " " + d.activityName;
                    //         }]);
                    //     }

                    //     // Treatment method dimension
                    // } else if (dim1String == "treatmentMethod") {

                    //     tooltipConfig.tbody.push(["Treatment method group", function (d) {
                    //         return d.processGroupCode + " " + d.processGroupName;
                    //     }]);

                    //     if (gran1 == "origin__process__processgroup" || gran1 == "destination__process__processgroup") {
                    //         groupBy = ["processGroupCode"];

                    //         // Granularity: Treatment method
                    //     } else if (gran1 == "origin__process" || gran1 == "destination__process") {
                    //         groupBy = ["processGroupCode", "processCode"];
                    //         tooltipConfig.tbody.push(["Treatment method", function (d) {
                    //             return d.processCode + " " + d.processName;
                    //         }]);
                    //     }

                    //     // Material
                    // } else if (dim1String == "material") {
                    //     tooltipConfig.tbody.push(["EWC Chapter", function (d) {
                    //         return d.ewc2Code + " " + d.ewc2Name;
                    //     }]);

                    //     // ewc2
                    //     if (gran1 == "flowchain__waste06__waste04__waste02") {
                    //         groupBy = ["ewc2Code"];
                    //         tooltipConfig.title = "Waste per EWC Chapter";
                    //         // ewc4
                    //     } else if (gran1 == "flowchain__waste06__waste04") {
                    //         groupBy = ["ewc2Code", "ewc4Code"];
                    //         tooltipConfig.title = "Waste per EWC Sub-Chapter";
                    //         tooltipConfig.tbody.push(["EWC Sub-Chapter", function (d) {
                    //             return d.ewc4Code + " " + d.ewc4Name;
                    //         }]);
                    //         // ewc6
                    //     } else if (gran1 == "flowchain__waste06") {
                    //         groupBy = ["ewc2Code", "ewc4Code", "ewc6Code"];
                    //         tooltipConfig.title = "Waste per Entry";
                    //         tooltipConfig.tbody.push(
                    //             ["EWC Sub-Chapter", function (d) {
                    //                 return d.ewc4Code + " " + d.ewc4Name;
                    //             }],
                    //             ["EWC Entry", function (d) {
                    //                 return d.ewc6Code + " " + d.ewc6Name;
                    //             }]);
                    //     }
                    // }

                    // Create a new D3Plus TreeMap object which will be rendered in this.options.el:
                    this.SimpleSankey = new SimpleSankey({
                        el: this.options.el,
                        data: flows,
                        //groupBy: groupBy,
                        tooltipConfig: tooltipConfig,
                    });

                    // Smooth scroll to top of Viz
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth"
                    });
                },

                transformToLinksAndNodes: function (flows) {
                    var _this = this,
                        nodes = [],
                        links = [];

                    flows.forEach(function (flow, index) {
                        let originNode = flow.origin;
                        let destinationNode = flow.destination
                        let link = flow;
                        let linkInfo = _this.returnLinkInfo(this[index]);

                        // NODES
                        // Add the origin and destination to Nodes, and include amounts:
                        originNode.value = flow.amount;
                        originNode.label = linkInfo.amountText + " " + linkInfo.dimensionValue;
                        originNode.color = linkInfo.color;

                        destinationNode.value = flow.amount;
                        destinationNode.label = linkInfo.amountText + " " + linkInfo.dimensionValue;
                        destinationNode.color = linkInfo.color;

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = this[index].origin.id;
                        link.target = this[index].destination.id;
                        link.value = this[index].amount;
                       
                        link.color = linkInfo.color;
                        link.label = linkInfo.toolTipText;

                        links.push(link)

                    }, flows);

                    nodes.forEach(function (node, index) {
                        //this[index].color = utils.colorByName(this[index].name);
                        //this[index].label = this[index].name;
                        this[index].opacity = 0.8;
                    }, nodes);




                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);

                    return {
                        flows: links,
                        nodes: nodes,
                    }
                },

                returnLinkInfo: function (link) {
                    let fromToText = link.origin.name + ' &#10132; ' + link.destination.name + '<br>'
                    let dimensionText = "";
                    let dimensionValue = "";
                    let amountText = d3plus.formatAbbreviate(link.amount, utils.returnD3plusFormatLocale()) + ' t/year';
                    let dimensionId;

                    switch (this.dim2[0]) {
                        case "time":
                            if (this.dim2[1] == "flowchain__month__year") {
                                dimensionText = "Year";
                                dimensionValue = link.year;
                            } else if (this.dim2[1] == "flowchain__month") {
                                dimensionText = "Month";
                                dimensionValue = link.month;
                            }
                            break;
                        case "economicActivity":
                            if (this.dim2[1] == "origin__activity__activitygroup" || this.dim2[1] == "destination__activity__activitygroup") {
                                dimensionText = "Activity group";
                                dimensionId = link.activitygroup;
                                dimensionValue = link.activityGroupCode + " " + link.activityGroupName;
                            } else if (this.dim2[1] == "origin__activity" || this.dim2[1] == "destination__activity") {
                                dimensionText = "Activity";
                                dimensionId = link.activity;
                                dimensionValue = link.activityCode + " " + link.activityName;
                            }
                            break;
                        case "treatmentMethod":
                            if (this.dim2[1] == "origin__process__processgroup" || this.dim2[1] == "destination__process__processgroup") {
                                dimensionText = "Treatment method group";
                                dimensionValue = link.processGroupCode + " " + link.processGroupName;
                            } else if (this.dim2[1] == "origin__process" || this.dim2[1] == "destination__process") {
                                dimensionText = "Treatment method";
                                dimensionValue = link.processCode + " " + link.processName;
                            }
                            break;
                        case "material":

                            switch (this.dim2[1]) {
                                case "flowchain__waste06__waste04__waste02":
                                    dimensionText = "EWC Chapter";
                                    dimensionValue = link.ewc2Code + " " + link.ewc2Name;
                                    break;
                                case "flowchain__waste06__waste04":
                                    dimensionText = "EWC Sub-Chapter";
                                    dimensionValue = link.ewc4Code + " " + link.ewc4Name;
                                    break;
                                case "flowchain__waste06":
                                    dimensionText = "EWC Entry";
                                    dimensionValue = link.ewc6Code + " " + link.ewc6Name;
                                    break;
                                default:
                                    break;
                            }

                            break;
                        default:
                            break;
                    }

                    let description = '<br><b>' + dimensionText + ':</b> ';

                    return {
                        dimensionValue: dimensionValue,
                        dimensionId: dimensionId,
                        toolTipText: fromToText + description + dimensionValue + '<br><b>Amount: </b>' + amountText,
                        amountText: amountText,
                        color: utils.colorByName(dimensionValue),
                    }

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
        return ParallelSetsView;
    }
);