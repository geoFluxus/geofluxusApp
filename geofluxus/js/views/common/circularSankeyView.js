define(['views/common/baseview',
        'utils/utils',
        'save-svg-as-png',
        'file-saver',
        'utils/enrichFlows',
        'visualizations/d3SankeyCircular',
        'underscore',
        'd3',
        'visualizations/d3plus'
    ],

    function (
        BaseView,
        utils,
        saveSvgAsPng,
        FileSaver,
        enrichFlows,
        D3SankeyCircular,
        _,
        d3,
        d3plus) {

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
                    this.dim1 = this.options.dimensions[0];
                    this.dim2 = this.options.dimensions[1];

                    this.label = options.dimensions.label;
                    this.props = {
                        'activitygroup': 'Activity group',
                        'activity': 'Activity',
                        'processgroup': 'Treatment method group',
                        'process': 'Treatment method',
                    }


                    this.filtersView = this.options.flowsView.filtersView;

                    $(this.options.el).css({
                        "display": "flex",
                        "align-items": "center"
                    })


                    this.label = options.dimensions.label;
                    this.isDarkMode = true;
                    this.fontColor = "white";

                    this.showNodeLabels = true;
                    this.showArrows = true;
                    this.linkColourOptions = {
                        "isNone": "true",
                        "isSource": "false",
                        "isDestination": "false",
                    }

                    this.flows = this.options.flows;
                    this.flows = this.enrichFlows(this.flows)
                    this.flows = this.transformToLinksAndNodes(this.flows, this.options.dimensions, this.filtersView);

                    window.addEventListener('resize', function () {
                        _this.render();
                    })

                    this.render();
                    this.options.flowsView.loader.deactivate();
                },

                events: {
                    'click .fullscreen-toggle': 'toggleFullscreen',
                    'click .export-csv': 'exportCSV',
                },
                render: function () {
                    if (this.circularSankey) {
                        this.circularSankey.close();
                    }

                    this.width = $(this.options.el).width() - 150;
                    this.height = $(this.options.el).height() - 150;

                    this.circularSankey = new D3SankeyCircular({
                        el: this.options.el,
                        width: this.width,
                        height: this.height,
                        data: this.flows,
                        fontColor: this.fontColor,
                        label: this.label,
                        isDarkMode: this.isDarkMode,
                        showNodeLabels: this.showNodeLabels,
                        showArrows: this.showArrows,
                        linkColourOptions: this.linkColourOptions,
                    })

                    utils.scrollToVizRow();
                    this.addButtons();
                },

                addButtons: function () {
                    let buttonFullscreen = d3.select(".fullscreen-toggle")
                    if (buttonFullscreen.empty()) {

                        let _this = this;
                        let vizContainer = d3.select(this.options.el);
                        vizContainer.append("div")
                            .attr("class", "sankeyControlContainer")
                            .style("top", "0px")
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

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-nodelabels")
                            .attr("title", "Toggle the labels above the nodes.")
                            .attr("type", "button")
                            .html('<i class="fa fa-tag icon-toggle-nodelabels"></i>')
                            .on("click", function () {
                                _this.toggleNodeLabels();
                            });

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-linkColor")
                            .attr("title", "Toggle the colours of the Sankey links.")
                            .attr("type", "button")
                            .html('<i class="fa icon-toggle-sankey-link-color"></i>')
                            .on("click", function () {
                                _this.toggleLinkColor();
                            });

                        sankeyControlContainer.append("button")
                            .attr("class", "btn btn-sm btn-primary d3plus-Button toggle-linkArrows")
                            .attr("title", "Toggle the arrows in the Sankey links.")
                            .attr("type", "button")
                            .html('<i class="fa fa-arrow-right icon-toggle-linkArrows"></i>')
                            .on("click", function () {
                                _this.toggleArrows();
                            });
                    }
                },

                toggleFullscreen: function (event) {
                    console.log('toggleFullscreen');

                    $(this.options.el).toggleClass('fullscreen');
                    // Only scroll when going to normal view:
                    if (!$(this.options.el).hasClass('fullscreen')) {
                        utils.scrollToVizRow();
                    }
                    this.render();
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

                toggleNodeLabels: function () {
                    this.showNodeLabels = !this.showNodeLabels;
                    this.render();
                },

                toggleArrows: function () {
                    this.showArrows = !this.showArrows;
                    this.render();
                },

                toggleLinkColor: function () {
                    if (this.linkColourOptions.isNone) {
                        this.linkColourOptions.isNone = false;
                        this.linkColourOptions.isSource = true;
                    } else if (this.linkColourOptions.isSource) {
                        this.linkColourOptions.isSource = false;
                        this.linkColourOptions.isDestination = true;
                    } else if (this.linkColourOptions.isDestination) {
                        this.linkColourOptions.isDestination = false;
                        this.linkColourOptions.isNone = true;
                    }
                    this.render();
                },

                enrichFlows: function (flows) {
                    let collections = this.filtersView.collections,
                        tags = this.filtersView.tags;

                    flows.forEach(function (flow, index) {
                        var _this = this;

                        // get all properties of flow
                        ["origin", "destination"].forEach(block => {
                            var properties = Object.keys(flow[block]);

                            properties.forEach(function (property) {
                                // fetch corresponding collection
                                var collection = collections[tags[property]];

                                if (collection != undefined) {
                                    // find corresponding model by ID
                                    var model = collection.find(model => model.attributes.id == flow[block][property]);

                                    // fetch attributes
                                    var attr = model.attributes,
                                        code = attr.code || attr.nace || attr.ewc_code,
                                        name = utils.capitalizeFirstLetter(attr.name || attr.ewc_name || "");

                                    // add attributes to flows
                                    _this[index][block][property + 'Code'] = code;
                                    _this[index][block][property + 'Name'] = name;
                                }
                            })
                        });
                    }, flows);

                    return flows
                },

                returnLinkInfo: function (link) {
                    let linkInfo = {
                        origin: {},
                        destination: {}
                    };

                    let props = [{
                        dim: this.dim1[1].split("__").pop(),
                        direction: this.dim1[1].split("__")[0] == "origin" ? "origin" : "destination"
                    }]

                    // If there are two dimensions:
                    if (this.dim2) {
                        props.push({
                            dim: this.dim2[1].split("__").pop(),
                            direction: this.dim2[1].split("__")[0] == "origin" ? "origin" : "destination"
                        })
                    } else {
                        props.push({
                            dim: this.dim1[1].split("__").pop(),
                            direction: "destination"
                        })
                    }
                    ["origin", "destination"].forEach(block => {
                        props.forEach(prop => {
                            if (block == prop.direction) {
                                linkInfo[block].dimensionText = this.props[prop.dim];
                                linkInfo[block].dimensionId = link[block][prop.dim];
                                linkInfo[block].dimensionCode = link[block][prop.dim + 'Code'];
                                linkInfo[block].dimensionName = link[block][prop.dim + 'Name'];
                                linkInfo[block].dimensionValue = linkInfo[block].dimensionCode + "." + [linkInfo[block].dimensionName != undefined ? " " + linkInfo[block].dimensionName : ""];
                            }
                        });
                    });

                    let originProp = props.find(prop => prop.direction == "origin");
                    let destinationProp = props.find(prop => prop.direction == "destination");
                    linkInfo.fromToText = link.origin[originProp.dim + "Name"] + ' &#10132; ' + link.destination[destinationProp.dim + "Name"] + '<br>';
                    linkInfo.amountText = d3plus.formatAbbreviate(link.amount, utils.returnD3plusFormatLocale()) + ' t';

                    return linkInfo
                },

                transformToLinksAndNodes: function (flows) {
                    var _this = this,
                        nodes = [],
                        links = [];

                    flows.forEach(function (flow, index) {
                        let originNode = flow.origin;
                        let destinationNode = flow.destination;
                        let link = flow;
                        let linkInfo = _this.returnLinkInfo(this[index]);

                        // NODES
                        originNode.value = destinationNode.value = flow.amount;

                        originNode.dimensionValue = linkInfo.origin.dimensionValue;
                        destinationNode.dimensionValue = linkInfo.destination.dimensionValue;

                        originNode.dimensionText = linkInfo.origin.dimensionText;
                        destinationNode.dimensionText = linkInfo.destination.dimensionText;

                        originNode.amountText = destinationNode.amountText = linkInfo.amountText;
                        originNode.opacity = destinationNode.opacity = 1;

                        // displayNode
                        originNode.displayNode = _this.dimensionIsOrigin;
                        destinationNode.displayNode = !_this.dimensionIsOrigin;

                        // Store info of source/destination as prop:
                        originNode.destination = destinationNode;
                        destinationNode.origin = originNode;

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = linkInfo.origin.dimensionValue;
                        link.target = linkInfo.destination.dimensionValue;

                        link.value = flow.amount;

                        link.amountText = linkInfo.amountText;
                        // link.dimensionText = linkInfo.dimensionText;
                        // link.dimensionValue = linkInfo.dimensionValue;
                        links.push(link)
                    }, flows);

                    // Assign colors to links and nodes based on label-prop:
                    links = enrichFlows.assignColorsByProperty(links, "dimensionId");
                    nodes = _.uniq(nodes, "dimensionValue");
                    nodes = _.sortBy(nodes, 'dimensionValue');
                    nodes = enrichFlows.assignColorsByProperty(nodes, "dimensionValue");
                    //nodes = nodes.reverse();

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
                    $(this.options.el).css({
                        "display": "none",
                    })
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return CircularSankeyView;
    }
);