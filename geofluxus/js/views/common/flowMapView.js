define(['underscore',
        'views/common/baseview',
        'collections/collection',
        'collections/geolocation',
        'collections/flows',
        'visualizations/flowmap',
        'visualizations/d3plusLegend',
        'd3',
        'visualizations/d3plus',
        'openlayers',
        'utils/utils',
        'utils/enrichFlows',
        'leaflet',
        'leaflet-easyprint',
        'leaflet-fullscreen',
        'leaflet.markercluster',
        'leaflet.markercluster/dist/MarkerCluster.css',
        'leaflet.markercluster/dist/MarkerCluster.Default.css',
        'leaflet/dist/leaflet.css',
        'static/css/flowmap.css',
        'leaflet-fullscreen/dist/leaflet.fullscreen.css'
    ],

    function (_, BaseView, Collection, GeoLocation, Flows, FlowMap, D3plusLegend, d3, d3plus, ol, utils, enrichFlows, L) {

        /**
         *
         * @author Christoph Franke, Vilma Jochim, Evert Van Hirtum
         * @name module:views/FlowMapView
         * @augments module:views/BaseView
         */
        var FlowMapView = BaseView.extend(
            /** @lends module:views/FlowSankeyView.prototype */
            {

                /**
                 * view on a leaflet map with flows and nodes overlayed
                 *
                 * @param {Object} options
                 * @param {HTMLElement} options.el      element the map will be rendered in
                 * @param {string} options.template     id of the script element containing the underscore template to render this view
                 * @param {Number} options.caseStudyId  id of the casestudy
                 * @param {Number} options.keyflowId    id of the keyflow
                 * @param {Number} options.materials    materials, should contain all materials used inside the keyflow
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    FlowMapView.__super__.initialize.apply(this, [options]);
                    //_.bindAll(this, 'zoomed');

                    var _this = this;
                    this.options = options;
                    this.flows = this.options.flows;

                    this.dimStrings = [];
                    this.options.dimensions.forEach(dim => this.dimStrings.push(dim[0]));
                    this.dim2 = this.options.dimensions.find(dim => dim[0] != "space");
                    this.legendItems = [];

                    this.dimensionIsOrigin;
                    this.adminLevel = this.options.dimensions.find(dim => dim[0] == "space")[1].adminlevel;
                    this.isActorLevel = this.options.dimensions.isActorLevel;

                    this.areas = new Collection([], {
                        apiTag: 'areas',
                        apiIds: [this.adminLevel]
                    });

                    var promises = [this.areas.fetch()];

                    Promise.all(promises).then(function () {
                        _this.render();
                        _this.rerender(true);
                    })
                },

                /*
                 * dom events (managed by jquery)
                 */
                events: {},

                /*
                 * render the view
                 */
                render: function () {
                    //this.backgroundLayer = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

                    this.tileUrl = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/"
                    this.tileType = "dark_all"
                    this.tileSuffix = "/{z}/{x}/{y}.png"

                    this.backgroundLayer = new L.TileLayer(this.tileUrl + this.tileType + this.tileSuffix, {
                        attribution: '© OpenStreetMap, © CartoDB'
                    });

                    $(this.el).html('<div class="flowmap-container d-block" style="width: 100%; height: 100%"></div><div class="flowmap-d3pluslegend-wrapper text-center"><svg class="flowmap-d3pluslegend"></svg></div>')

                    var _this = this;
                    this.hasLegend = true;
                    this.isDarkMode = true;
                    this.animationOn = false;
                    this.animationLines = true;
                    this.animationDots = false;

                    //$(this.el).html('<div class="flowmap-container d-block" style="width: 100%; height: 100%"></div>')

                    this.leafletMap = new L.Map(this.el.firstChild, {
                            center: [52.1326, 5.2913], // Center of Netherlands
                            zoomSnap: 0.25,
                            zoom: 10.5,
                            minZoom: 5,
                            maxZoom: 25
                        })
                        .addLayer(this.backgroundLayer);

                    // If the flows are aggregated by geographic region, increase the maximum flow width:
                    if (!this.isActorLevel) {
                        this.maxFlowWidth = 50;
                    }

                    // filter areas
                    var areaIds = new Set();
                    this.flows.forEach(function(flow) {
                        areaIds.add(flow.origin.id);
                        areaIds.add(flow.destination.id);
                    })

                    // retrieve area geometry
                    var areas = [];
                    this.areas.forEach(function(area) {
                        var id = area.get('id'),
                            geom = area.get('geom').coordinates;
                        if (areaIds.has(id)) {
                            areas.push(geom);
                        }
                    })

                    this.flowMap = new FlowMap(this.leafletMap, {
                        maxFlowWidth: this.maxFlowWidth,
                        toolTipContainer: this.el,
                        areas: areas
                    });
                    this.flowMap.showFlows = true;
                    this.flowMap.showNodes = false;

                    // //////////////////////
                    // Fullscreen button
                    this.leafletMap.addControl(new L.Control.Fullscreen({
                        position: 'topleft',
                        pseudoFullscreen: true,
                    }));

                    // //////////////////////
                    // Export PNG button
                    this.leafletMap.addControl(new L.easyPrint({
                        position: 'topleft',
                        filename: 'flowmap',
                        exportOnly: true,
                        hideControlContainer: true,
                        sizeModes: ['A4Landscape'],
                    }));

                    // Event fired when zooming stops:
                    //this.leafletMap.on("zoomend", this.zoomed);



                    // Add reset button to map to refocus on original position:

                    var resetViewBtn = document.createElement('a');
                    //resetViewBtn.classList.add("btn", "btn-primary", "btn-reset-view")
                    resetViewBtn.classList.add("btn-reset-view")
                    resetViewBtn.title = "Reset the map to the original position."
                    resetViewBtn.innerHTML = '<i class="fas fa-undo"></i>';
                    $(".leaflet-control-zoom.leaflet-bar.leaflet-control").append(resetViewBtn);
                    resetViewBtn.addEventListener('click', function (event) {
                        // _this.toggleAnimation();
                        _this.flowMap.zoomToFit();
                        console.log("reset map view");
                        event.preventDefault(event);
                    })



                    // Custom controls top left
                    var topLefControls = L.control({
                        position: 'topleft'
                    })
                    var topLeftControlDiv = document.createElement('div')
                    topLeftControlDiv.classList.add("leaflet-control-custom-buttons");

                    // Actual export PNG button:
                    var exportImgBtn = document.createElement('button');
                    exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    exportImgBtn.title = "Export this visualization as a PNG file.";

                    // Legend toggle:
                    var legendToggleBtn = document.createElement('button');
                    legendToggleBtn.classList.add("btn", "btn-primary", "toggle-legend")
                    legendToggleBtn.title = "Toggle the legend on or off."
                    legendToggleBtn.innerHTML = '<i class="fas icon-toggle-legend"></i>';

                    // Dark mode toggle
                    var darkmodeToggleBtn = document.createElement('button');
                    darkmodeToggleBtn.classList.add("btn", "btn-primary", "toggle-darkmode")
                    darkmodeToggleBtn.title = "Toggle light or dark mode."
                    darkmodeToggleBtn.innerHTML = '<i class="fas icon-toggle-darkmode"></i>';

                    // Flows toggle
                    var showFlowsToggleBtn = document.createElement('button');
                    showFlowsToggleBtn.classList.add("btn", "btn-primary", "toggle-flows")
                    showFlowsToggleBtn.title = "Toggle the flows on or off."
                    showFlowsToggleBtn.innerHTML = '<i class="fas icon-toggle-flowmap-flows"></i>';

                    // Flows toggle
                    var showNodesToggleBtn = document.createElement('button');
                    showNodesToggleBtn.classList.add("btn", "btn-primary", "toggle-nodes")
                    showNodesToggleBtn.title = "Toggle the nodes on or off."
                    showNodesToggleBtn.innerHTML = '<i class="fas icon-toggle-flowmap-nodes"></i>';

                    // Animation toggle
                    var animationToggleBtn = document.createElement('button');
                    animationToggleBtn.classList.add("btn", "btn-primary", "toggle-animation")
                    animationToggleBtn.title = "Toggle the animation of the flows."
                    animationToggleBtn.innerHTML = '<i class="fas icon-toggle-flowmap-animation"></i>';

                    topLeftControlDiv.appendChild(exportImgBtn);
                    topLeftControlDiv.appendChild(legendToggleBtn);
                    topLeftControlDiv.appendChild(darkmodeToggleBtn);
                    topLeftControlDiv.appendChild(showFlowsToggleBtn);
                    topLeftControlDiv.appendChild(showNodesToggleBtn);
                    topLeftControlDiv.appendChild(animationToggleBtn);

                    topLefControls.onAdd = function (map) {
                        return topLeftControlDiv;
                    };
                    topLefControls.addTo(this.leafletMap);

                    legendToggleBtn.addEventListener('click', function (event) {
                        _this.toggleLegend();
                        event.preventDefault();
                    })
                    darkmodeToggleBtn.addEventListener('click', function (event) {
                        _this.isDarkMode = !_this.isDarkMode;
                        _this.toggleLight();
                        event.preventDefault();
                    })
                    showFlowsToggleBtn.addEventListener('click', function (event) {
                        _this.flowMap.showFlows = !_this.flowMap.showFlows;
                        _this.rerender();
                        event.preventDefault();
                    })
                    showNodesToggleBtn.addEventListener('click', function (event) {
                        _this.flowMap.showNodes = !_this.flowMap.showNodes;
                        _this.rerender();
                        event.preventDefault();
                    })
                    animationToggleBtn.addEventListener('click', function (event) {
                        _this.toggleAnimation();
                        event.preventDefault();
                    })


                    // easyprint is not customizable enough (buttons, remove menu etc.) and not touch friendly
                    // Workaround: hide and pass on click (actually strange, but easyprint was still easiest to use export plugin out there)
                    var easyprintCtrl = this.el.querySelector('.leaflet-control-easyPrint'),
                        easyprintCsBtn = this.el.querySelector('.easyPrintHolder .A4Landscape');
                    easyprintCtrl.style.display = 'none';
                    exportImgBtn.addEventListener('click', function (event) {
                        easyprintCsBtn.click();
                        event.preventDefault();
                    })


                    // Check this later for other buttons:
                    // L.DomEvent.disableClickPropagation(this.legend);
                    // L.DomEvent.disableScrollPropagation(this.legend);


                    // When user sets map to fullscreen, also change legend:
                    _this.leafletMap.on('fullscreenchange', function () {
                        if (_this.leafletMap.isFullscreen()) {
                            $(".flowmap-d3pluslegend-wrapper").addClass("flowmapLegendFullscreen");
                        } else {
                            $(".flowmap-d3pluslegend-wrapper").removeClass("flowmapLegendFullscreen");
                        }
                    });


                    // Smooth scroll to top of Viz after rendering
                    setTimeout(() => {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "nearest"
                        });
                    }, 500);
                    this.options.flowsView.loader.deactivate();
                },

                toggleLight() {
                    var _this = this;
                    if (this.isDarkMode) {
                        this.tileType = "dark_all"
                    } else {
                        this.tileType = "light_all"
                    }

                    this.updateLegend();
                    this.leafletMap.removeLayer(this.backgroundLayer);
                    this.backgroundLayer.setUrl(this.tileUrl + this.tileType + this.tileSuffix)
                    this.leafletMap.addLayer(this.backgroundLayer);
                },

                toggleLegend() {
                    this.hasLegend = !this.hasLegend;
                    this.updateLegend();
                },

                toggleAnimation() {
                    var _this = this;

                    // If animation is off, turn it on and set to lines:
                    if (_this.animationOn == false) {
                        _this.animationOn = true;

                        _this.flowMap.dottedLines = false;
                        _this.flowMap.toggleAnimation(true);

                        _this.animationLines = true;
                        _this.animationDots = false;

                        // If animation is on, and type == lines, set to dots:
                    } else if (_this.animationOn && _this.animationLines) {
                        _this.animationLines = false;
                        _this.animationDots = true;

                        _this.flowMap.dottedLines = true;
                        _this.flowMap.toggleAnimation(true);

                        // If animation is on, and type == dots, turn off:
                    } else if (_this.animationOn && _this.animationDots) {
                        _this.flowMap.toggleAnimation(false);
                        _this.animationOn = false;
                    }
                    _this.rerender();
                },

                updateLegend() {
                    if (this.hasLegend) {
                        var _this = this;

                        $(".flowmap-d3pluslegend-wrapper").fadeIn();

                        console.log("______ legend data _______")
                        console.log(_this.legendItems);

                        this.d3plusLegend = new D3plusLegend({
                            el: ".flowmap-d3pluslegend",
                            data: _this.legendItems,
                            flowMapView: _this,
                            label: function (d) {
                                return utils.textEllipsis(d.label, 10);
                            },
                            shapeConfigFill: function (d) {
                                return d.color;
                            },
                            height: 100,
                            width: "800",
                            align: "center",
                            isDarkMode: _this.isDarkMode,
                        });
                    } else {
                        $(".flowmap-d3pluslegend-wrapper").fadeOut();
                    }
                },

                // zoomed: function () {
                //     // zoomend always is triggered before clustering is done -> reset clusters
                //     this.clusterGroupsDone = 0;
                // },

                resetMapData: function (data, zoomToFit) {
                    this.data = data;
                    this.flowMap.clear();

                    this.flowMap.addNodes(data.nodes);

                    if (this.flowMap.showFlows) {
                        this.flowMap.addFlows(data.flows);
                    }

                    this.updateLegend();

                    //this.flowMap.toggleTag('actor', this.actorCheck.checked);

                    this.flowMap.resetView();
                    if (zoomToFit) this.flowMap.zoomToFit();
                },

                rerender: function (zoomToFit) {
                    var _this = this;

                    var data = _this.transformToLinksAndNodes(_this.flows);

                    _this.resetMapData(data, zoomToFit);
                },

                /*
                additional to the usual attributes the flow should have the attribute
                'color'
                */
                addFlows: function (flows) {
                    var _this = this;
                    flows = (flows.forEach != null) ? flows : [flows];
                    flows.forEach(function (flow) {
                        _this.flows.add(flow);
                    })
                },

                getFlows: function () {
                    return this.flows.models;
                },

                removeFlows: function (flows) {
                    var flows = (flows instanceof Array) ? flows : [flows];
                    this.flows.remove(flows);
                },

                clear: function () {
                    //this.flows.reset();
                    //this.legend.innerHTML = '';
                    //this.clusterGroups = {};
                    //this.data = null;
                    if (this.flowMap) {
                        this.flowMap.clear();
                        this.el = "";
                    }

                    if (this.leafletMap) {
                        this.leafletMap.eachLayer(function (layer) {
                            layer.remove();
                        });
                        this.leafletMap.remove();
                        this.leafletMap = null;
                    }
                },

                returnLinkInfo: function (link) {
                    let fromToText = link.origin.name + ' &#10132; ' + link.destination.name + '<br>'
                    let dimensionText = "";
                    let dimensionValue = "";
                    let amountText = d3plus.formatAbbreviate(link.amount, utils.returnD3plusFormatLocale()) + ' t';
                    let dimensionId;

                    switch (this.dim2[0]) {
                        case "time":
                            if (this.dim2[1] == "flowchain__month__year") {
                                dimensionText = "Year";
                                dimensionId = dimensionValue = link.year;
                            } else if (this.dim2[1] == "flowchain__month") {
                                dimensionText = "Month";
                                dimensionId = dimensionValue = link.month;
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
                                dimensionId = link.processgroup;
                                dimensionValue = link.processGroupCode + " " + link.processGroupName;
                            } else if (this.dim2[1] == "origin__process" || this.dim2[1] == "destination__process") {
                                dimensionId = link.process
                                dimensionText = "Treatment method";
                                dimensionValue = link.processCode + " " + link.processName;
                            }
                            break;
                        case "material":

                            switch (this.dim2[1]) {
                                case "flowchain__waste06__waste04__waste02":
                                    dimensionId = link.waste02;
                                    dimensionText = "EWC Chapter";
                                    dimensionValue = link.ewc2Code + " " + link.ewc2Name;
                                    break;
                                case "flowchain__waste06__waste04":
                                    dimensionId = link.waste04;
                                    dimensionText = "EWC Sub-Chapter";
                                    dimensionValue = link.ewc4Code + " " + link.ewc4Name;
                                    break;
                                case "flowchain__waste06":
                                    dimensionId = link.waste06;
                                    dimensionText = "EWC Entry";
                                    dimensionValue = link.ewc6Code + " " + link.ewc6Name;
                                    break;
                            }

                            break;
                    }

                    let description = '<br><b>' + dimensionText + ':</b> ';

                    return {
                        dimensionValue: dimensionValue.toString(),
                        dimensionId: dimensionId,
                        toolTipText: fromToText + description + dimensionValue + '<br><b>Amount: </b>' + amountText,
                        amountText: amountText,
                        dimensionText: dimensionText,
                    }

                },

                transformToLinksAndNodes: function (flows) {
                    var _this = this,
                        nodes = [],
                        links = [];

                    if (this.dim2[1].includes("origin")) {
                        this.dimensionIsOrigin = true;
                    } else {
                        this.dimensionIsOrigin = false;
                    }
                    console.log("this.dimensionIsOrigin: ", this.dimensionIsOrigin)


                    flows.forEach(function (flow, index) {
                        let originNode = flow.origin;
                        let destinationNode = flow.destination
                        let link = flow;
                        let linkInfo = _this.returnLinkInfo(this[index]);
                        let nodeOpacity = 1;

                        // NODES
                        // Add the origin and destination to Nodes, and include amounts:
                        originNode.value = flow.amount;
                        originNode.dimensionValue = linkInfo.dimensionValue;
                        originNode.dimensionText = linkInfo.dimensionText;
                        originNode.amountText = linkInfo.amountText
                        originNode.opacity = nodeOpacity;
                        originNode.displayNode = _this.dimensionIsOrigin;

                        destinationNode.value = flow.amount;
                        destinationNode.dimensionValue = linkInfo.dimensionValue;
                        destinationNode.dimensionText = linkInfo.dimensionText;
                        destinationNode.amountText = linkInfo.amountText
                        destinationNode.opacity = nodeOpacity;
                        destinationNode.displayNode = !_this.dimensionIsOrigin;

                        // Store info of source/destination as prop:
                        originNode.destination = destinationNode;
                        destinationNode.origin = originNode;

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = originNode.id;
                        link.sourceName = originNode.name;
                        link.target = destinationNode.id;
                        link.targetName = destinationNode.name;

                        link.value = flow.amount;
                        link.dimensionId = linkInfo.dimensionId;

                        //link.label = linkInfo.toolTipText;
                        link.amountText = linkInfo.amountText;
                        link.dimensionText = linkInfo.dimensionText;
                        link.dimensionValue = linkInfo.dimensionValue;
                        links.push(link)
                    }, flows);

                    // Assign colors to links and nodes based on label-prop:
                    links = enrichFlows.assignColorsByProperty(links, "dimensionId");
                    nodes = enrichFlows.assignColorsByProperty(nodes, "dimensionValue");

                    nodes = _.sortBy(nodes, 'value').reverse();

                    // Get all unique occurences for legend:
                    links.forEach(link => {
                        _this.legendItems.push({
                            id: link.dimensionId,
                            label: link.dimensionValue,
                            color: link.color,
                        })
                    });

                    _this.legendItems = _.uniq(_this.legendItems, 'label');

                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);

                    return {
                        flows: links,
                        nodes: nodes,
                    }
                },

                close: function () {
                    this.clear();
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return FlowMapView;
    }
);