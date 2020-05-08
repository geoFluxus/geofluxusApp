define(['views/common/baseview',
        'underscore',
        'd3',
        'visualizations/d3plus',
        'visualizations/simpleSankey',
        'collections/collection',
        'app-config',
        'save-svg-as-png',
        'file-saver',
        'utils/utils',
        'utils/enrichFlows',
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
        enrichFlows,
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

                    this.filtersView = this.options.flowsView.filtersView;

                    // let dim1String = this.options.dimensions[0][0];
                    // let gran1 = this.options.dimensions[0][1];
                    // let dim2String = this.options.dimensions[1][0];
                    // let gran2 = this.options.dimensions[1] ? this.options.dimensions[1][1] : {};

                    let tooltipConfig = {
                        tbody: [
                            ["Waste (metric ton)", function (d) {
                                return d3plus.formatAbbreviate(d["value"], utils.returnD3plusFormatLocale())
                            }]
                        ]
                    };

                    flows = enrichFlows.transformToLinksAndNodes(this.options.flows, this.options.dimensions, this.filtersView);

                   
                    this.SimpleSankey = new SimpleSankey({
                        el: this.options.el,
                        links: flows.links,
                        nodes: flows.nodes,
                        tooltipConfig: tooltipConfig,
                    });

                    // Smooth scroll to top of Viz
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth"
                    });
                },

                
                returnLinkInfo: function (link) {


                    // let fromToText = link.origin.name + ' &#10132; ' + link.destination.name + '<br>'
                    // let dimensionText = "";
                    // let dimensionValue = "";
                    // let amountText = d3plus.formatAbbreviate(link.amount, utils.returnD3plusFormatLocale()) + ' t/year';
                    // let dimensionId;

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