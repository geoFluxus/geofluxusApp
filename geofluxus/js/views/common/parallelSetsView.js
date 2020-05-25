define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/simpleSankey',
        'utils/enrichFlows',
        'd3',
        'visualizations/d3plus',
        'utils/utils',
    ],

    function (
        D3plusVizView,
        _,
        SimpleSankey,
        enrichFlows,
        d3,
        d3plus,
        utils) {

        /**
         * @author Evert Van Hirtum
         * @name module:views/ParallelSetsView
         * @augments module:views/D3plusVizView
         */
        var ParallelSetsView = D3plusVizView.extend(
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
                    _.bindAll(this, 'toggleDarkMode');

                    this.canHaveLegend = false;
                    this.isDarkMode = true;
                    this.options = options;

                    this.filtersView = this.options.flowsView.filtersView;
                    this.flows = this.transformToLinksAndNodes(this.options.flows, this.options.dimensions, this.filtersView);

                    this.tooltipConfig = {
                        tbody: [
                            ["Waste", function (d) {
                                return d3plus.formatAbbreviate(d["value"], utils.returnD3plusFormatLocale()) + " t"
                            }]
                        ]
                    };

                    this.render();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                    'click .toggle-darkmode': 'toggleDarkMode',                    
                },

                /**
                 * Create a new D3Plus SimpleSankey object which will be rendered in this.options.el:
                 */
                render: function () {
                    this.SimpleSankey = new SimpleSankey({
                        el: this.options.el,
                        links: this.flows.links,
                        nodes: this.flows.nodes,
                        tooltipConfig: this.tooltipConfig,
                        canHaveLegend: this.canHaveLegend,
                        isDarkMode: this.isDarkMode,
                    });
                    this.scrollToVisualization();
                    this.options.flowsView.loader.deactivate();
                },

                toggleDarkMode: function() {
                    this.isDarkMode = !this.isDarkMode;

                    if (this.isDarkMode) {
                        d3.selectAll(".d3plus-Links .d3plus-Path")
                        .attr("stroke", "#DBDBDB")
                    } else {
                            d3.selectAll(".d3plus-Links .d3plus-Path")
                        .attr("stroke", "#393939")
                    }

                    $(".viz-wrapper-div").toggleClass("lightMode");
                    $(".parallelsets-container").toggleClass("lightMode");
                },

                /**
                 * Takes flows-data in origin/destination format and outputs it according to supplied dimensions into links and nodes format
                 * 
                 * @param {array} flows Array of flows containing origin and destination attributes
                 * @param {object} dimensions object containing dimension information
                 * @param {object} filtersView Backbone.js filtersView
                 */
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
                                    destinationNode.id = enrichFlows.returnCodePlusName(processGroupDestinationObject) + " ";
                                    let processGroupOriginObject = processGroups.find(processGroup => processGroup.attributes.id == flow.origin.processgroup);
                                    originNode.id = enrichFlows.returnCodePlusName(processGroupOriginObject);
                                    // Gran == Treatment method
                                } else {
                                    let processDestinationObject = processes.find(process => process.attributes.id == flow.destination.process);
                                    destinationNode.id = enrichFlows.returnCodePlusName(processDestinationObject) + " ";
                                    let processOriginObject = processes.find(process => process.attributes.id == flow.origin.process);
                                    originNode.id = enrichFlows.returnCodePlusName(processOriginObject);
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
                                            originNode.id = enrichFlows.returnCodePlusName(activityGroupOriginObject);
                                            break;
                                        case "origin__activity":
                                            let activityOriginObject = activities.find(activity => activity.attributes.id == flow.origin.activity);
                                            originNode.id = enrichFlows.returnCodePlusName(activityOriginObject);
                                            break;
                                        case "destination__activity__activitygroup":
                                            let activityGroupDestinationObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.destination.activitygroup);
                                            destinationNode.id = enrichFlows.returnCodePlusName(activityGroupDestinationObject);
                                            break;
                                        case "destination__activity":
                                            let activityDestinationObject = activities.find(activity => activity.attributes.id == flow.destination.activity);
                                            destinationNode.id = enrichFlows.returnCodePlusName(activityDestinationObject);
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
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.destination.waste04);
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.destination.waste06);
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                            // From material to econ
                                        } else if (gran1.includes("destination")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.origin.waste02);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.origin.waste04);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.origin.waste06);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc6Object);
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
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.destination.waste04);
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.destination.waste06);
                                                    destinationNode.id = enrichFlows.returnEwcCodePlusName(ewc6Object);
                                                    break;
                                            }
                                            // From material to treatment
                                        } else if (gran1.includes("destination")) {
                                            switch (gran2) {
                                                case "flowchain__waste06__waste04__waste02":
                                                    let ewc2Object = ewc2.find(ewc => ewc.attributes.id == flow.origin.waste02);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc2Object);
                                                    break;
                                                case "flowchain__waste06__waste04":
                                                    let ewc4Object = ewc4.find(ewc => ewc.attributes.id == flow.origin.waste04);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc4Object);
                                                    break;
                                                case "flowchain__waste06":
                                                    let ewc6Object = ewc6.find(ewc => ewc.attributes.id == flow.origin.waste06);
                                                    originNode.id = enrichFlows.returnEwcCodePlusName(ewc6Object);
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
                                            destinationNode.id = enrichFlows.returnCodePlusName(processGroupDestinationObject);
                                            break;
                                        case "destination__process":
                                            let processDestinationObject = processes.find(process => process.attributes.id == flow.destination.process);
                                            destinationNode.id = enrichFlows.returnCodePlusName(processDestinationObject);
                                            break;
                                        case "origin__process__processgroup":
                                            let processGroupOriginObject = processGroups.find(processGroup => processGroup.attributes.id == flow.origin.processgroup);
                                            originNode.id = enrichFlows.returnCodePlusName(processGroupOriginObject);
                                            break;
                                        case "origin__process":
                                            let processOriginObject = processes.find(process => process.attributes.id == flow.origin.process);
                                            originNode.id = enrichFlows.returnCodePlusName(processOriginObject);
                                            break;
                                    }
                                }
                                break;
                        }

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = originNode.id;
                        link.target = destinationNode.id;
                        link.value = flow.amount;

                        links.push(link)

                    }, flows);


                    // Group the nodes by id and sum the values:                    
                    let summed_by_type = _(nodes).reduce(function (mem, d) {
                        mem[d.id] = (mem[d.id] || 0) + d.value
                        return mem
                    }, {})
                    nodes = _(summed_by_type).map(function (v, k) {
                        return {
                            id: k,
                            value: v,
                        }
                    })

                    // Assign colors by id:
                    nodes = enrichFlows.assignColorsByProperty(nodes, "id");

                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);

                    return {
                        links: links,
                        nodes: nodes,
                    }
                }
            });
        return ParallelSetsView;
    }
);