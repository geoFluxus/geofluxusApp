define(['views/common/baseview',
        'utils/utils',
        'save-svg-as-png',
        'file-saver',
        'utils/enrichFlows',
        'visualizations/d3SankeyCircular',
        'underscore',
        'd3'
    ],

    function (
        BaseView,
        utils,
        saveSvgAsPng,
        FileSaver,
        enrichFlows,
        D3SankeyCircular,
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

                    $(this.options.el).css({
                        "display": "flex",
                        "align-items": "center"
                    })

                   
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
                        _this.circularSankey.close();
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
                    // this.circularSankey = new CircularSankeyComponent({
                    //     el: this.options.el,
                    //     width: this.width,
                    //     height: this.height,
                    //     circularData: this.flows,
                    //     fontColor: this.fontColor,
                    //     label: this.label,
                    // });

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

                    // flows = [{
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 4,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "O PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY (O)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 19,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "Q HUMAN HEALTH AND SOCIAL WORK ACTIVITIES (Q)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 496,
                    //         "composition": "47.984% Fat, water and sludge | 31.048% Edible oils and fats | 20.968% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "destination": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "amount": 22,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "A AGRICULTURE, FORESTRY AND FISHING (A)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 12,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "P EDUCATION (P)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 19,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "S OTHER SERVICE ACTIVITIES (S)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 37,
                    //         "composition": "91.892% Fat, water and sludge | 2.703% Edible oils and fats | 5.405% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 25,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1.307,
                    //         "composition": "1.683% Fats | 98.317% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1.025,
                    //         "composition": "13.561% Fats | 86.439% Emulsion"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 2,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "N ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES (N)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 86,
                    //         "composition": "44.186% Fat, water and sludge | 30.233% Edible oils and fats | 25.581% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "J INFORMATION AND COMMUNICATION (J)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 4,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "D ELECTRICITY, GAS, STEAM AND AIR CONDITIONING SUPPLY (D)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 2,
                    //         "composition": "100% Fat, water and sludge"
                    //     },
                    //     {
                    //         "origin": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "destination": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "amount": 23,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "V NON-ECONOMIC ACTIVITIES (V)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 2,
                    //         "composition": "100% Fat, water and sludge"
                    //     },
                    //     {
                    //         "origin": "C MANUFACTURING (C)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "H TRANSPORTATION AND STORAGE (H)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 17,
                    //         "composition": "23.529% Fat, water and sludge | 76.471% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "R ARTS, ENTERTAINMENT AND RECREATION (R)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 241,
                    //         "composition": "46.473% Fat, water and sludge | 36.929% Edible oils and fats | 16.598% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "H TRANSPORTATION AND STORAGE (H)",
                    //         "amount": 1.434,
                    //         "composition": "100% Sludge"
                    //     },
                    //     {
                    //         "origin": "I ACCOMMODATION AND FOOD SERVICE ACTIVITIES (I)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1.493,
                    //         "composition": "71.132% Fat, water and sludge | 6.43% Edible oils and fats | 22.438% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 24,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "L REAL ESTATE ACTIVITIES (L)",
                    //         "destination": "I ACCOMMODATION AND FOOD SERVICE ACTIVITIES (I)",
                    //         "amount": 1,
                    //         "composition": "100% Fat, water and sludge"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 323,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "L REAL ESTATE ACTIVITIES (L)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 10,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "C MANUFACTURING (C)",
                    //         "amount": 656,
                    //         "composition": "42.683% Used frying oil | 57.317% Recovered vegetable oil"
                    //     },
                    //     {
                    //         "origin": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 217,
                    //         "composition": "81.106% Fat, water and sludge | 11.06% Edible oils and fats | 7.834% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "F CONSTRUCTION (F)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1.489,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "O PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY (O)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 426,
                    //         "composition": "91.549% Fat, water and sludge | 6.103% Edible oils and fats | 2.347% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "F CONSTRUCTION (F)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 828,
                    //         "composition": "1.932% Fat, water and sludge | 98.068% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "O PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY (O)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 45,
                    //         "composition": "100% Sludge"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "amount": 521,
                    //         "composition": "100% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "Q HUMAN HEALTH AND SOCIAL WORK ACTIVITIES (Q)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 16,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "M PROFESSIONAL, SCIENTIFIC AND TECHNICAL ACTIVITIES (M)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 62,
                    //         "composition": "85.484% Fat, water and sludge | 6.452% Edible oils and fats | 8.065% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "P EDUCATION (P)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 23,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "S OTHER SERVICE ACTIVITIES (S)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 14,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "D ELECTRICITY, GAS, STEAM AND AIR CONDITIONING SUPPLY (D)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 18,
                    //         "composition": "100% Fat, water and sludge"
                    //     },
                    //     {
                    //         "origin": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 34,
                    //         "composition": "52.941% Fat, water and sludge | 5.882% Fats | 14.706% Edible oils and fats | 26.471% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 86,
                    //         "composition": "100% Used frying oil"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 674,
                    //         "composition": "97.774% Fat, water and sludge | 2.226% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 20,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "destination": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "amount": 646,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "F CONSTRUCTION (F)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 1.51,
                    //         "composition": "2.715% Fats | 97.285% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "F CONSTRUCTION (F)",
                    //         "destination": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "amount": 1.853,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "J INFORMATION AND COMMUNICATION (J)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 126,
                    //         "composition": "10.317% Fat, water and sludge | 64.286% Edible oils and fats | 25.397% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "H TRANSPORTATION AND STORAGE (H)",
                    //         "destination": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "amount": 1.434,
                    //         "composition": "100% Sludge"
                    //     },
                    //     {
                    //         "origin": "I ACCOMMODATION AND FOOD SERVICE ACTIVITIES (I)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 10,
                    //         "composition": "90% Edible oils and fats | 10% Unused frying oil"
                    //     },
                    //     {
                    //         "origin": "N ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES (N)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 2,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "N ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES (N)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 68,
                    //         "composition": "100% Vegetal oil"
                    //     },
                    //     {
                    //         "origin": "CA MANUFACTURE OF FOOD PRODUCTS, BEVERAGES AND TOBACCO PRODUCTS (CA)",
                    //         "destination": "G WHOLESALE AND RETAIL TRADE (G)",
                    //         "amount": 1.025,
                    //         "composition": "13.561% Fats | 86.439% Emulsion"
                    //     },
                    //     {
                    //         "origin": "I ACCOMMODATION AND FOOD SERVICE ACTIVITIES (I)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 6,
                    //         "composition": "100% Edible oils and fats"
                    //     },
                    //     {
                    //         "origin": "I ACCOMMODATION AND FOOD SERVICE ACTIVITIES (I)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 101,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "R ARTS, ENTERTAINMENT AND RECREATION (R)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 7,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "C MANUFACTURING (C)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 75,
                    //         "composition": "18.667% Fat, water and sludge | 12% Edible oils and fats | 69.333% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "K FINANCIAL AND INSURANCE ACTIVITIES (K)",
                    //         "destination": "F CONSTRUCTION (F)",
                    //         "amount": 15,
                    //         "composition": "100% Fats"
                    //     },
                    //     {
                    //         "origin": "L REAL ESTATE ACTIVITIES (L)",
                    //         "destination": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "amount": 105,
                    //         "composition": "63.81% Fat, water and sludge | 30.476% Edible oils and fats | 5.714% Trapped grease"
                    //     },
                    //     {
                    //         "origin": "E WATER SUPPLY, SEWERAGE, WASTE MANAGEMENT AND REMEDIATION (E)",
                    //         "destination": "C MANUFACTURING (C)",
                    //         "amount": 1,
                    //         "composition": "100% Vegetal oil"
                    //     }
                    // ]

                    // flows.forEach(flow => {
                    //     flow.origin = {
                    //         activitygroup: flow.origin
                    //     }
                    //     flow.destination = {
                    //         activitygroup: flow.destination
                    //     }
                    // });

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

                        let processGroups = filtersView.collections['processgroups'].models;
                        let processes = filtersView.collections['processes'].models;

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


                                // UNCOMMENT THIS FOR RUSNES DATA EXAMPLE
                                // // Gran == Treatment method group
                                // if (gran1.includes("group")) {
                                //     destinationNode.name = flow.destination.activitygroup;
                                //     originNode.name = flow.origin.activitygroup;
                                //     break;

                                //     // Gran == Treatment method
                                // } else {
                                //     destinationNode.name = flow.destination.activity;
                                //     originNode.name = flow.origin.activity;
                                // }

                                break;
                            case 2:
                                // Econ dim1 > Treatment dim2
                                if (dimStrings.includes("economicActivity")) {
                                    let activityGroups = filtersView.collections['activitygroups'].models;
                                    let activities = filtersView.collections['activities'].models;

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
                    //this.circularSankey.close();
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