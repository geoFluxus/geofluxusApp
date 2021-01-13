define(['views/common/d3plusVizView',
        'underscore',
        'visualizations/simpleSankey',
        'utils/enrichFlows',
        'd3',
        'visualizations/d3plus',
        'utils/utils',
        'file-saver'
    ],

    function (
        D3plusVizView,
        _,
        SimpleSankey,
        enrichFlows,
        d3,
        d3plus,
        utils,
        FileSaver) {

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

                    this.props = Object.assign(...Object.values(this.dimensions));

                    this.canHaveLegend = false;
                    this.isDarkMode = true;
                    this.options = options;

                    this.filtersView = this.options.flowsView.filtersView;
                    this.flows = this.transformToLinksAndNodes(this.options.flows, this.options.dimensions, this.filtersView);

                    this.tooltipConfig = {
                        tbody: [
                            [this.label, function (d) {
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

                toggleDarkMode: function () {
                    this.isDarkMode = !this.isDarkMode;

                    d3.selectAll(".d3plus-Links .d3plus-Path")
                      .attr("stroke", this.isDarkMode ? "#DBDBDB" : "#393939")

                    $(".viz-wrapper-div").toggleClass("lightMode");
                    $(".visualizationBlock .card").toggleClass("lightMode");
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
                    let collections = filtersView.collections,
                        tags =  filtersView.tags;
                    let nodes = [],
                        links = [];

                    // parallel sets for at least two dimensions
                    // if only one, create a dummy
                    if (dimensions.length == 1) {
                        var name = dimensions[0][0],
                            gran = dimensions[0][1].split("__");
                        gran.shift(); // pop first element

                        dimensions = [];
                        ['origin', 'destination'].forEach(function(node) {
                            var dimension = [name, node + "__" + gran.join("__")];
                            dimensions.push(dimension);
                        })
                    }

                    // convert flows to links & nodes
                    flows.forEach(function (flow, index) {
                        let link = {};
                        let originNode = {};
                        let destinationNode = {};

                        // process dimensions
                        dimensions.forEach(function(dim, i) {
                            // get info about node & property to search
                            var gran = dim[1].split('__'),
                                prop = gran.pop();

                            // check node by property
                            var is_origin = flow.origin[prop],
                                is_destination = flow.destination[prop],
                                node = is_origin != undefined ? 'origin' : 'destination';

                            // if origin & destination have same property, fetch node from granularity
                            var extra = "";
                            if (is_origin != undefined && is_destination != undefined) {
                                node = gran.shift();

                                // add extra character for circular nodes
                                extra = i ? " " : "";
                            }

                            // get node item
                            var item = node == 'origin' ? originNode : destinationNode;

                            // pass amount
                            item.value = flow.amount;

                            // retrieve property info
                            var collection = collections[tags[prop]],
                                obj = collection.find(model => model.attributes.id == flow[node][prop]);

                            // update item
                            var attr = obj.attributes,
                                code = attr.code || attr.nace || attr.ewc_code,
                                name = utils.capitalizeFirstLetter(attr.name || attr.ewc_name);
                            item.id = code + " " + name + extra;
                        })

                        // NODES
                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = originNode.id;
                        link.target = destinationNode.id;
                        link.value = flow.amount;

                        links.push(link)
                    }, flows);

                    // Group the nodes by id and sum the values:
                    var result = [];
                    nodes.reduce(function (res, item) {
                        if (!res[item.id]) {
                            res[item.id] = {
                                id: item.id,
                                value: 0
                            };
                            result.push(res[item.id])
                        }
                        res[item.id].value += item.value;
                        return res;
                    }, {});

                    nodes = result;

                    // Assign colors by id:
                    nodes = enrichFlows.assignColorsByProperty(nodes, "id");

                    return {
                        links: links,
                        nodes: nodes,
                    }
                },

                exportCSV: function (event) {
                    const items = this.flows.links;
                    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

                    let header = Object.keys(items[0]);

                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    csv.unshift(header.join(','))
                    csv = csv.join('\r\n')

                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");

                    //event.stopImmediatePropagation();
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