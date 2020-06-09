define(['views/common/baseview',
        'underscore',
        'utils/utils',
        'save-svg-as-png',
        'file-saver',
        'utils/enrichFlows',
        'react/circularSankey',
        'react',
        'react-dom',
    ],

    function (
        BaseView,
        _,
        utils,
        saveSvgAsPng,
        FileSaver,
        enrichFlows,
        CircularSankeyComponent,
        React,
        ReactDOM) {

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
                    

                    // let tooltipConfig = {
                    //     tbody: [
                    //         ["Waste", function (d) {
                    //             return d3plus.formatAbbreviate(d["value"], utils.returnD3plusFormatLocale()) + " t"
                    //         }]
                    //     ]
                    // };

                    this.flows = this.transformToLinksAndNodes(this.options.flows, this.options.dimensions, this.filtersView);


                    window.addEventListener('resize', function () {
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
                        width: $("#" + this.options.el).width(),
                        height: $("#" + this.options.el).height(),
                        circularData: this.flows,
                    });

                    //this.setSvgDimensions();

                    // Smooth scroll to top of Viz
                    $("#apply-filters")[0].scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                },

                setSvgDimensions: function () {
                    $("#circularsankey-wrapper svg").width($("#" + this.options.el).width());
                    $("#circularsankey-wrapper svg").height($("#" + this.options.el).height());
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
                                    destinationNode.name = enrichFlows.returnCodePlusName(processGroupDestinationObject) + " ";
                                    let processGroupOriginObject = processGroups.find(processGroup => processGroup.attributes.id == flow.origin.processgroup);
                                    originNode.name = enrichFlows.returnCodePlusName(processGroupOriginObject);
                                    break;

                                    // Gran == Treatment method
                                } else {
                                    let processDestinationObject = processes.find(process => process.attributes.id == flow.destination.process);
                                    destinationNode.name = enrichFlows.returnCodePlusName(processDestinationObject) + " ";
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
                    let summed_by_type = _(nodes).reduce(function (mem, d) {
                        mem[d.name] = (mem[d.name] || 0) + d.value
                        return mem
                    }, {})
                    nodes = _(summed_by_type).map(function (v, k) {
                        return {
                            name: k,
                            value: v
                        }
                    })


                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);

                    return {
                        links: links,
                        nodes: nodes,
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
                    this.circularSankey.close();
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $("#" + this.options.el).html(""); //empty the DOM element
                },

            });
        return CircularSankeyView;
    }
);