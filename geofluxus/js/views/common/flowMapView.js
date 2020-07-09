define(['underscore',
        'views/common/baseview',
        'collections/collection',
        'visualizations/flowmap',
        'visualizations/d3plusLegend',
        'd3',
        'visualizations/d3plus',
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

    function (_, BaseView, Collection, FlowMap, D3plusLegend, d3, d3plus, utils, enrichFlows, L) {

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

                    this.label = options.dimensions.label;
                    this.props = {
                        'year'          : 'Year',
                        'month'         : 'Month',
                        'activitygroup' : 'Activity group',
                        'activity'      : 'Activity',
                        'processgroup'  : 'Treatment method group',
                        'process'       : 'Treatment method',
                        'waste02'       : 'EWC Chapter',
                        'waste04'       : 'EWC Sub-Chapter',
                        'waste06'       : 'EWC Entry'
                    }

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
                events: {
                    'click .toggle-legend': 'toggleLegend',

                },

                /*
                 * render the view
                 */
                render: function () {
                    this.tileUrl = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/"
                    this.tileType = "dark_all"
                    this.tileSuffix = "/{z}/{x}/{y}.png"
                    this.backgroundLayer = new L.TileLayer(this.tileUrl + this.tileType + this.tileSuffix, {
                        attribution: '© <a style="color:#0078A8" href="http://cartodb.com/attributions">CartoDB</a>'
                    });

                    $(this.el).html(`<div class="flowmap-container d-block" style="width: 100%; height: 100%"></div>
                                     <div class="flowmap-d3pluslegend-wrapper text-center">
                                     <svg class="flowmap-d3pluslegend"></svg></div>`);

                    var _this = this;
                    this.hasLegend = true;
                    this.isDarkMode = true;
                    this.animationOn = false;

                    this.leafletMap = new L.Map(this.el.firstChild, {
                        center: [52.1326, 5.2913], // Center of Netherlands
                            zoomSnap: 0.25,
                            zoom: 10.5,
                            minZoom: 5,
                            maxZoom: 25
                        })
                    .addLayer(this.backgroundLayer);

                    // Disable zoom on scroll:
                    this.leafletMap.scrollWheelZoom.disable();

                    // If the flows are aggregated by geographic region, increase the maximum flow width:
                    if (!this.isActorLevel) {
                        this.maxFlowWidth = 50;
                    }

                    // Filter areas
                    var areaIds = new Set();
                    this.flows.forEach(function (flow) {
                        areaIds.add(flow.origin.id);
                        areaIds.add(flow.destination.id);
                    })

                    // Retrieve area geometry
                    var areas = [];
                    this.areas.forEach(function(area) {
                        let newArea = {
                            id: area.get('id'),
                            name: area.get('name'),
                            geom: area.get('geom').coordinates,
                        }
                        if (areaIds.has(newArea.id)) {
                            areas.push(newArea);
                        }
                    })

                    // Instantiate Flowmap object:
                    this.flowMap = new FlowMap(this.leafletMap, {
                        maxFlowWidth: this.maxFlowWidth,
                        toolTipContainer: this.el,
                        areas: areas,
                        label: this.label,
                    });

                    this.flowMap.dottedLines = false;
                    this.flowMap.showFlows = true;
                    this.flowMap.showNodes = false;

                    this.flowMap.showAreas = false;
                    this.flowMap.showAreaBorders = false;
                    this.flowMap.showAreaFilled = false;

                    if (!this.isActorLevel) {
                        this.flowMap.showAreas = true;
                        this.flowMap.showAreaBorders = true;
                    }

                    // //////////////////////
                    // Leaflet buttons

                    // Fullscreen button
                    this.leafletMap.addControl(new L.Control.Fullscreen({
                        position: 'topleft',
                        pseudoFullscreen: true,
                    }));

                    // Event fired when zooming stops:
                    //this.leafletMap.on("zoomend", this.zoomed);

                    // Add reset button to map to refocus on original position:
                    var resetViewBtn = document.createElement('a');
                    resetViewBtn.classList.add("btn-reset-view")
                    resetViewBtn.title = "Reset the map to the original position."
                    resetViewBtn.innerHTML = '<i class="fas fa-undo"></i>';
                    $(".leaflet-control-zoom.leaflet-bar.leaflet-control").append(resetViewBtn);
                    resetViewBtn.addEventListener('click', function (event) {
                        _this.flowMap.zoomToFit();
                        event.preventDefault(event);
                    })

                    // /////////////////////////////////////
                    // Custom, non-leaflet controls top left
                    var topLefControls = L.control({
                        position: 'topleft'
                    })
                    var topLeftControlDiv = document.createElement('div')
                    topLeftControlDiv.classList.add("leaflet-control-custom-buttons");

                    // Actual export PNG button:
                    var exportImgBtn = document.createElement('button');
                    exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    exportImgBtn.title = "Export this visualization as a PNG file.";

                    // HIDDEN Leaflet easyPrint button
                    this.leafletMap.addControl(new L.easyPrint({
                        position: 'topleft',
                        filename: 'flowmap',
                        exportOnly: true,
                        hideControlContainer: true,
                        sizeModes: ['A4Landscape'],
                    }));
                    // Easyprint is not customizable enough (buttons, remove menu etc.) and not touch friendly
                    // Workaround: hide and pass on click (actually strange, but easyprint was still easiest to use export plugin out there)
                    var easyprintCtrl = this.el.querySelector('.leaflet-control-easyPrint'),
                        easyprintCsBtn = this.el.querySelector('.easyPrintHolder .A4Landscape');
                    easyprintCtrl.style.display = 'none';
                    exportImgBtn.addEventListener('click', function (event) {
                        easyprintCsBtn.click();
                        event.preventDefault();
                    })

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

                    // Nodes toggle
                    var showNodesToggleBtn = document.createElement('button');
                    showNodesToggleBtn.classList.add("btn", "btn-primary", "toggle-nodes")
                    showNodesToggleBtn.title = "Toggle the nodes on or off."
                    showNodesToggleBtn.innerHTML = '<i class="fas icon-toggle-flowmap-nodes"></i>';

                    // Areas toggle
                    if (!this.isActorLevel) {
                        var showAreasToggleBtn = document.createElement('button');
                        showAreasToggleBtn.classList.add("btn", "btn-primary", "toggle-areas")
                        showAreasToggleBtn.title = "Toggle the areas on or off."
                        showAreasToggleBtn.innerHTML = '<i class="fas icon-toggle-flowmap-areas"></i>';
                    }

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
                    if (!this.isActorLevel) {
                        topLeftControlDiv.appendChild(showAreasToggleBtn);
                    }

                    topLefControls.onAdd = function (map) {
                        return topLeftControlDiv;
                    };
                    topLefControls.addTo(this.leafletMap);

                    darkmodeToggleBtn.addEventListener('click', function (event) {
                        _this.isDarkMode = !_this.isDarkMode;
                        _this.toggleLight();
                    })
                    showFlowsToggleBtn.addEventListener('click', function (event) {
                        _this.flowMap.showFlows = !_this.flowMap.showFlows;
                        _this.rerender();
                    })
                    showNodesToggleBtn.addEventListener('click', function (event) {
                        _this.flowMap.showNodes = !_this.flowMap.showNodes;
                        _this.rerender();
                    })
                    if (!this.isActorLevel) {
                        showAreasToggleBtn.addEventListener('click', function (event) {
                            _this.toggleAreas();
                        })
                    }
                    animationToggleBtn.addEventListener('click', function (event) {
                        _this.toggleAnimation();
                    })

                    // Prevent event propagation on button clicks:
                    L.DomEvent.disableClickPropagation(document.querySelector(".leaflet-top.leaflet-left"));
                    L.DomEvent.disableClickPropagation(document.querySelector(".leaflet-control-fullscreen.leaflet-bar.leaflet-control"));

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
                        utils.scrollToVizRow();
                    }, 500);
                    this.options.flowsView.loader.deactivate();
                },

                toggleLight() {
                    this.tileType = this.isDarkMode ? "dark_all" : "light_all";

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
                    if (this.animationOn == this.flowMap.dottedLines) {
                        // when turn on/off the animation,
                        // turn off the dotted lines
                        this.animationOn = !this.animationOn;
                        this.flowMap.dottedLines = false;
                    } else {
                        this.flowMap.dottedLines = true;
                    }
                    this.flowMap.toggleAnimation(this.animationOn);
                    this.rerender();
                },

                toggleAreas() {
                    // If showAreas is off, turn on and show borders:
                    if (this.flowMap.showAreas == false) {
                        this.flowMap.showAreas = true;
                        this.flowMap.showAreaBorders = true;

                        // If showAreas is on, and type == borders, set to filled:
                    } else if (this.flowMap.showAreas && this.flowMap.showAreaBorders) {
                        this.flowMap.showAreaBorders = false;
                        this.flowMap.showAreaFilled = true;

                        // If animation is on, and type == dots, turn off:
                    } else if (this.flowMap.showAreas && this.flowMap.showAreaFilled) {
                        this.flowMap.showAreas = false;
                        this.flowMap.showAreaBorders = false;
                        this.flowMap.showAreaFilled = false;
                    }
                    this.rerender();
                },

                updateLegend() {
                    if (this.hasLegend) {
                        var _this = this;

                        $(".flowmap-d3pluslegend-wrapper").fadeIn();

                        // console.log("______ legend data _______")
                        // console.log(_this.legendItems);

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

                rerender: function (zoomToFit) {
                    var _this = this;

                    var data = _this.transformToLinksAndNodes(_this.flows);

                    _this.resetMapData(data, zoomToFit);
                },

                resetMapData: function (data, zoomToFit) {
                    this.data = data;
                    this.flowMap.clear();
                    this.flowMap.addNodes(data.nodes);

                    if (this.flowMap.showFlows) {
                        this.flowMap.addFlows(data.flows);
                    }

                    this.updateLegend();
                    this.flowMap.resetView();

                    if (zoomToFit) {
                        this.flowMap.zoomToFit();
                    }
                },

                addFlows: function (flows) {
                    var _this = this;
                    flows = (flows.forEach != null) ? flows : [flows];
                    flows.forEach(function (flow) {
                        _this.flows.add(flow);
                    })
                },

                clear: function () {
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
                    let amountText = d3plus.formatAbbreviate(link.amount, utils.returnD3plusFormatLocale()) + ' t';

                    let prop = this.dim2[1].split("__").pop(),
                        dimensionText = this.props[prop],
                        dimensionId = link[prop],
                        dimensionCode = link[prop + 'Code'],
                        dimensionName = link[prop + 'Name'],
                        dimensionValue = dimensionCode + [dimensionName != undefined ? " " + dimensionName : ""];

                    let description = '<br><b>' + dimensionText + ':</b> ';

                    return {
                        dimensionValue: dimensionValue.toString(),
                        dimensionId: dimensionId,
                        toolTipText: fromToText + description + dimensionValue + '<br><b>' + this.label + ': </b>' + amountText,
                        amountText: amountText,
                        dimensionText: dimensionText,
                    }

                },

                transformToLinksAndNodes: function (flows) {
                    var _this = this,
                        nodes = [],
                        links = [];

                    this.dimensionIsOrigin = this.dim2[1].includes("origin");

                    flows.forEach(function (flow, index) {
                        let originNode = flow.origin;
                        let destinationNode = flow.destination;
                        let link = flow;
                        let linkInfo = _this.returnLinkInfo(this[index]);
                        let nodeOpacity = 1;

                        // NODES
                        // Add the origin and destination to Nodes, and include amounts:
                        originNode.value = destinationNode.value = flow.amount;
                        originNode.dimensionValue = destinationNode.dimensionValue = linkInfo.dimensionValue;
                        originNode.dimensionText = destinationNode.dimensionText = linkInfo.dimensionText;
                        originNode.amountText = destinationNode.amountText = linkInfo.amountText;
                        originNode.opacity = destinationNode.opacity = nodeOpacity;

                        originNode.displayNode = _this.dimensionIsOrigin;
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

                    // console.log("Links:");
                    // console.log(links);
                    // console.log("Nodes:");
                    // console.log(nodes);

                    return {
                        flows: links,
                        nodes: nodes,
                    }
                },

                // zoomed: function () {
                //     // zoomend always is triggered before clustering is done -> reset clusters
                //     this.clusterGroupsDone = 0;
                // },

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