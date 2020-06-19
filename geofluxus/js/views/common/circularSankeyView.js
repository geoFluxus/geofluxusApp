define(['views/common/baseview',
        'utils/utils',
        'save-svg-as-png',
        'file-saver',
        'utils/enrichFlows',
        'react/circularSankey',
        'underscore',
        'd3'
    ],

    function (
        BaseView,
        utils,
        saveSvgAsPng,
        FileSaver,
        enrichFlows,
        CircularSankeyComponent,
        _,
        d3) {

        /**
         *
         * @author Evert Van Hirtum
         * @name module:views/CircularSankeyView
         * @augments module:views/BaseView
         */
        var CircularSankeyView = BaseView.extend(
            /** @lends module:views/CircularSankeyView.prototype */
            {

                /**
                 * @param {Object} options
                 * @param {HTMLElement} options.el                   element the view will be rendered in
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    CircularSankeyView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'toggleFullscreen');
                    _.bindAll(this, 'exportCSV');

                    var _this = this;
                    this.options = options;
                    this.filtersView = this.options.flowsView.filtersView;

                    this.width = $("#" + this.options.el).width();
                    this.height = $("#" + this.options.el).height();

                    this.label = options.dimensions.label;
                    this.isDarkMode = true;
                    this.fontColor = "white";

                    // let tooltipConfig = {
                    //     tbody: [
                    //         ["Waste", function (d) {
                    //             return d3plus.formatAbbreviate(d["value"], utils.returnD3plusFormatLocale()) + " t"
                    //         }]
                    //     ]
                    // };

                    this.flows = this.transformToLinksAndNodes(this.options.flows, this.options.dimensions, this.filtersView);


                    window.addEventListener('resize', function () {
                        if (_this.circularSankey) {
                            _this.circularSankey.close();
                        }
                        _this.render();
                        console.log("Window resize > rerender");
                    })

                    this.render();
                    this.options.flowsView.loader.deactivate();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },
                render: function () {
                    this.circularSankey = new CircularSankeyComponent({
                        el: this.options.el,
                        width: this.width,
                        height: this.height,
                        circularData: this.flows,
                        fontColor: this.fontColor,
                        label: this.label,
                    });

                    utils.scrollToVizRow();
                    this.addButtons();
                },

                addButtons: function () {

                    let buttonFullscreen = d3.select(".fullscreen-toggle")
                    if (buttonFullscreen.empty()) {

                        let _this = this;
                        let vizContainer = d3.select("#circularsankey-wrapper div");
                        vizContainer.append("div")
                            .attr("class", "sankeyControlContainer")
                            .lower();

                        let sankeyControlContainer = vizContainer.select(".sankeyControlContainer")

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button fullscreen-toggle")
                            .attr("title", "View this visualization in fullscreen mode.")
                            .attr("type", "button")
                            .html('<i class="fas fa-expand icon-fullscreen"></i>')
                            .on("click", function () {
                                _this.toggleFullscreen();
                            });

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button export-csv")
                            .attr("title", "Export the data of this visualization as a CSV file.")
                            .attr("type", "button")
                            .html('<i class="fas fa-file icon-export"></i>')
                            .on("click", function () {
                                _this.exportCSV();
                            });

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-darkmode")
                            .attr("title", "Toggle light or dark mode.")
                            .attr("type", "button")
                            .html('<i class="fas icon-toggle-darkmode"></i>')
                            .on("click", function () {
                                _this.toggleDarkMode();
                            });

                        // Check on hover over Viz if it still contains Fullscreen button, if not, readd:
                        vizContainer.on("mouseover", function () {
                            let buttonFullscreen = d3.select(".fullscreen-toggle")
                            if (buttonFullscreen.empty()) {
                                _this.addButtons();
                            }
                        })

                    }


                },

                toggleFullscreen: function (event) {
                    console.log('toggleFullscreen');

                    $("#circularsankey-wrapper").toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$("#circularsankey-wrapper").hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                    }
                    this.render();
                    d3.event.preventDefault();
                },

                toggleDarkMode: function () {
                    this.isDarkMode = !this.isDarkMode;

                    $(".viz-wrapper-div").toggleClass("lightMode");

                    if (this.isDarkMode) {
                        this.fontColor = "white";
                    } else {
                        this.fontColor = "black";
                    }

                    this.render();
                },

                transformToLinksAndNodes: function (flows, dimensions, filtersView) {
                    let nodes = [],
                        links = [];

                    flows.forEach(function (flow, index) {
                        let link = {};
                        let originNode = {};
                        let destinationNode = {};

                        // Gather dimension and gran config:
                        let gran1 = dimensions[0][1];
                        let gran2 = dimensions[1] ? dimensions[1][1] : {};
                        let dimStrings = [];
                        dimensions.forEach(dim => dimStrings.push(dim[0]));

                        // Data:

                        let processGroups = filtersView.processgroups.models;
                        let processes = filtersView.processes.models;

                        // Set value for origin and destination of nodes:
                        originNode.value = destinationNode.value = flow.amount;

                        // Enrich nodes
                        switch (dimensions.length) {
                            case 1:
                                // Only for Treatment method to Treatment method

                                // Gran == Treatment method group
                                if (gran1.includes("group")) {
                                    let processGroupDestinationObject = processGroups.find(processGroup => processGroup.attributes.id == flow.destination.processgroup);
                                    destinationNode.name = enrichFlows.returnCodePlusName(processGroupDestinationObject);
                                    let processGroupOriginObject = processGroups.find(processGroup => processGroup.attributes.id == flow.origin.processgroup);
                                    originNode.name = enrichFlows.returnCodePlusName(processGroupOriginObject);
                                    break;

                                    // Gran == Treatment method
                                } else {
                                    let processDestinationObject = processes.find(process => process.attributes.id == flow.destination.process);
                                    destinationNode.name = enrichFlows.returnCodePlusName(processDestinationObject);
                                    let processOriginObject = processes.find(process => process.attributes.id == flow.origin.process);
                                    originNode.name = enrichFlows.returnCodePlusName(processOriginObject);
                                }

                                break;
                            case 2:
                                // Econ dim1 > Treatment dim2
                                if (dimStrings.includes("economicActivity")) {
                                    let activityGroups = filtersView.activityGroups.models;
                                    let activities = filtersView.activities.models;

                                    switch (gran1) {
                                        case "origin__activity__activitygroup":
                                            let activityGroupOriginObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.origin.activitygroup);
                                            originNode.name = enrichFlows.returnCodePlusName(activityGroupOriginObject);
                                            break;
                                        case "origin__activity":
                                            let activityOriginObject = activities.find(activity => activity.attributes.id == flow.origin.activity);
                                            originNode.name = enrichFlows.returnCodePlusName(activityOriginObject);
                                            break;
                                        case "destination__activity__activitygroup":
                                            let activityGroupDestinationObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.destination.activitygroup);
                                            destinationNode.name = enrichFlows.returnCodePlusName(activityGroupDestinationObject);
                                            break;
                                        case "destination__activity":
                                            let activityDestinationObject = activities.find(activity => activity.attributes.id == flow.destination.activity);
                                            destinationNode.name = enrichFlows.returnCodePlusName(activityDestinationObject);
                                            break;
                                    }

                                }
                                if (dimStrings.includes("material")) {
                                    let ewc2 = filtersView.wastes02.models;
                                    let ewc4 = filtersView.wastes04.models;
                                    let ewc6 = filtersView.wastes06.models;

                                    // Econ dim1 > Material dim2
                                    if (dimStrings.includes("economicActivity")) {
                                        // From econ to material
                                        if (gran1.includes("origin")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.destination.waste02);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.destination.waste04);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.destination.waste06);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                            // From material to econ
                                        } else if (gran1.includes("destination")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.origin.waste02);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.origin.waste04);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.origin.waste06);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                        }


                                        // Material > Treatment method OR Treatment method > Material 
                                    } else if (dimStrings.includes("treatmentMethod")) {

                                        // From treatment to material
                                        if (gran1.includes("origin")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.destination.waste02);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.destination.waste04);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.destination.waste06);
                                                    destinationNode.name = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                            // From material to treatment
                                        } else if (gran1.includes("destination")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.origin.waste02);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.origin.waste04);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.origin.waste06);
                                                    originNode.name = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                        }
                                    }


                                }
                                if (dimStrings.includes("treatmentMethod")) {
                                    let granularity;
                                    // Material dim2 > Treatment dim1
                                    if (dimStrings.includes("economicActivity")) {
                                        granularity = gran2;
                                    } else {
                                        granularity = gran1;
                                    }

                                    // Material dim2 > Treatment dim1
                                    switch (granularity) {
                                        case "destination__process__processgroup":
                                            let processGroupDestinationObject = processGroups.find(processGroup => processGroup.attributes.id == flow.destination.processgroup);
                                            destinationNode.name = enrichFlows.returnCodePlusName(processGroupDestinationObject);
                                            break;
                                        case "destination__process":
                                            let processDestinationObject = processes.find(process => process.attributes.id == flow.destination.process);
                                            destinationNode.name = enrichFlows.returnCodePlusName(processDestinationObject);
                                            break;
                                        case "origin__process__processgroup":
                                            let processGroupOriginObject = processGroups.find(processGroup => processGroup.attributes.id == flow.origin.processgroup);
                                            originNode.name = enrichFlows.returnCodePlusName(processGroupOriginObject);
                                            break;
                                        case "origin__process":
                                            let processOriginObject = processes.find(process => process.attributes.id == flow.origin.process);
                                            originNode.name = enrichFlows.returnCodePlusName(processOriginObject);
                                            break;
                                    }
                                }
                                break;
                        }

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = originNode.name;
                        link.target = destinationNode.name;
                        link.value = flow.amount;

                        links.push(link)

                    }, flows);

                    // Group the nodes by NAME and sum the values:                    
                    var result = [];
                    nodes.reduce(function (res, item) {
                        if (!res[item.name]) {
                            res[item.name] = {
                                name: item.name,
                                value: 0
                            };
                            result.push(res[item.name])
                        }
                        res[item.name].value += item.value;
                        return res;
                    }, {});

                    nodes = result;

                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);

                    return {
                        links: links,
                        nodes: nodes,
                    }
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
                    this.circularSankey.close();
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $("#" + this.options.el).html(""); //empty the DOM element
                },

            });
        return CircularSankeyView;
    }
);