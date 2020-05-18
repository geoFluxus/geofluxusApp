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
                    _.bindAll(this, 'zoomed');

                    this.options = options;
                    this.flows = this.options.flows;

                    this.dimStrings = [];
                    this.options.dimensions.forEach(dim => this.dimStrings.push(dim[0]));
                    this.dim2 = this.options.dimensions.find(dim => dim[0] != "space");
                    this.legendItems = [];


                    this.render();

                    this.rerender(true);

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
                    this.backgroundLayer = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap, © CartoDB'
                    });

                    var _this = this;
                    this.hasLegend = true;

                    // Center of Netherlands
                    var center = [52.1326, 5.2913];


                    $(this.el).html('<div class="flowmap-container d-block" style="width: 100%; height: 100%"></div><div class="flowmap-d3pluslegend-wrapper text-center"><svg class="flowmap-d3pluslegend"></svg></div>')

                    //$(this.el).html('<div class="flowmap-container d-block" style="width: 100%; height: 100%"></div>')

                    this.leafletMap = new L.Map(this.el.firstChild, {
                            center: center,
                            zoomSnap: 0.25,
                            zoom: 10.5,
                            minZoom: 5,
                            maxZoom: 25
                        })
                        .addLayer(this.backgroundLayer);
                    this.flowMap = new FlowMap(this.leafletMap);

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
                    this.leafletMap.on("zoomend", this.zoomed);


                    // Custom controls top left
                    var topLefControls = L.control({
                        position: 'topleft'
                    })
                    var topLeftControlDiv = document.createElement('div')
                    var exportImgBtn = document.createElement('button');
                    var legendToggleBtn = document.createElement('button');
                    
                    // Actual export PNG button:
                    topLeftControlDiv.classList.add("leaflet-control-custom-buttons");
                    exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    exportImgBtn.title = "Export this visualization as a PNG file.";
                    
                    // Legend toggle:
                    legendToggleBtn.classList.add("btn", "btn-primary", "toggle-legend")
                    legendToggleBtn.title = "Toggle the legend on or off."
                    legendToggleBtn.innerHTML = '<i class="fas icon-toggle-legend"></i>';



                    topLeftControlDiv.appendChild(exportImgBtn);
                    topLeftControlDiv.appendChild(legendToggleBtn);


                    topLefControls.onAdd = function (map) {
                        return topLeftControlDiv;
                    };
                    topLefControls.addTo(this.leafletMap);

                    legendToggleBtn.addEventListener('click', function () {
                        _this.toggleLegend();
                        event.preventDefault();
                    })


                    // easyprint is not customizable enough (buttons, remove menu etc.) and not touch friendly
                    // Workaround: hide and pass on click (actually strange, but easyprint was still easiest to use export plugin out there)
                    var easyprintCtrl = this.el.querySelector('.leaflet-control-easyPrint'),
                        easyprintCsBtn = this.el.querySelector('.easyPrintHolder .A4Landscape');
                    easyprintCtrl.style.display = 'none';
                    exportImgBtn.addEventListener('click', function () {
                        easyprintCsBtn.click();
                        event.preventDefault();
                    })


                    // //////////////////////
                    // Custom controls
                    var customControls = L.control({
                        position: 'bottomleft'
                    });
                    this.animationCheck = document.createElement('input');
                    this.actorCheck = document.createElement('input');
                    this.flowCheck = document.createElement('input');
                    this.lightCheck = document.createElement('input');
                    this.flowCheck.checked = true;
                    this.lightCheck.checked = false;

                    var div = document.createElement('div'),
                        aniLabel = document.createElement('label'),
                        actorLabel = document.createElement('label'),
                        flowLabel = document.createElement('label'),
                        lightLabel = document.createElement('label'),
                        _this = this;

                    div.classList.add("leaflet-control-custom-controls");
                    aniLabel.innerHTML = 'Animate';
                    actorLabel.innerHTML = 'Actors';
                    flowLabel.innerHTML = 'Flows';
                    lightLabel.innerHTML = 'Light / Dark';

                    [
                        this.animationCheck, this.actorCheck,
                        this.flowCheck, this.lightCheck
                    ].forEach(function (checkbox) {
                        checkbox.type = "checkbox";
                        checkbox.style.transform = "scale(2)";
                        checkbox.style.pointerEvents = "none";
                        checkbox.style.marginRight = "10px";
                    })

                    div.style.background = "rgba(255, 255, 255, 0.5)";
                    div.style.padding = "10px";
                    div.style.cursor = "pointer";

                    var actorDiv = document.createElement('div'),
                        flowDiv = document.createElement('div'),
                        aniDiv = document.createElement('div'),
                        aniCheckWrap = document.createElement('div'),
                        aniToggleDiv = document.createElement('div'),
                        lightDiv = document.createElement('div');

                    actorDiv.appendChild(this.actorCheck);
                    actorDiv.appendChild(actorLabel);
                    actorDiv.style.cursor = 'pointer';
                    flowDiv.appendChild(this.flowCheck);
                    flowDiv.appendChild(flowLabel);
                    flowDiv.style.cursor = 'pointer';
                    lightDiv.appendChild(this.lightCheck);
                    lightDiv.appendChild(lightLabel);
                    lightDiv.style.cursor = 'pointer';
                    aniCheckWrap.appendChild(this.animationCheck);
                    aniCheckWrap.appendChild(aniLabel);
                    aniDiv.appendChild(aniCheckWrap);
                    aniCheckWrap.style.cursor = 'pointer';

                    var aniLinesLabel = document.createElement('label'),
                        aniDotsLabel = document.createElement('label');

                    aniLinesLabel.classList.add("flowmap-anim-radio-label");
                    aniDotsLabel.classList.add("flowmap-anim-radio-label");

                    this.aniLinesRadio = document.createElement('input');
                    this.aniDotsRadio = document.createElement('input');
                    this.aniLinesRadio.type = 'radio';
                    this.aniDotsRadio.type = 'radio';
                    this.aniLinesRadio.name = 'animation';
                    this.aniDotsRadio.name = 'animation';
                    this.aniLinesRadio.style.transform = 'scale(1.5)';
                    this.aniLinesRadio.style.marginLeft = '5px';
                    this.aniDotsRadio.style.transform = 'scale(1.5)';
                    this.aniDotsRadio.style.marginLeft = '5px';

                    this.aniLinesRadio.checked = true;

                    // aniCheckWrap.style.float = 'left';
                    // aniCheckWrap.style.marginRight = '5px';
                    // aniToggleDiv.style.float = 'left';
                    // aniLinesLabel.style.marginRight = '3px';

                    aniLinesLabel.innerHTML = '<span>Lines</span>';
                    aniDotsLabel.innerHTML = '<span>Dots</span>';
                    aniLinesLabel.appendChild(this.aniLinesRadio);
                    aniDotsLabel.appendChild(this.aniDotsRadio);
                    aniToggleDiv.appendChild(aniLinesLabel);
                    aniToggleDiv.appendChild(aniDotsLabel);

                    aniToggleDiv.classList.add("aniToggleDiv");

                    customControls.onAdd = function (map) {
                        return div;
                    };
                    customControls.addTo(this.leafletMap);

                    flowDiv.addEventListener("click", function () {
                        _this.flowCheck.checked = !_this.flowCheck.checked;
                        _this.rerender();
                    });

                    actorDiv.addEventListener("click", function () {
                        _this.actorCheck.checked = !_this.actorCheck.checked;
                        //if (_this.actorCheck.checked) _this.stockCheck.checked = false;
                        _this.rerender();
                    });
                    lightDiv.addEventListener("click", function () {
                        _this.lightCheck.checked = !_this.lightCheck.checked;
                        _this.rerender();
                    });
                    aniCheckWrap.addEventListener("click", function () {
                        _this.animationCheck.checked = !_this.animationCheck.checked;
                        _this.flowMap.toggleAnimation(_this.animationCheck.checked);
                    });
                    aniToggleDiv.addEventListener("click", function () {
                        if (_this.aniDotsRadio.checked)
                            _this.aniLinesRadio.checked = true;
                        else
                            _this.aniDotsRadio.checked = true;
                        _this.rerender();
                    });

                    div.appendChild(actorDiv);
                    div.appendChild(flowDiv);
                    div.appendChild(lightDiv);
                    div.appendChild(aniDiv);
                    div.appendChild(aniToggleDiv);


                    // OLD LEGEND
                    // var legendControl = L.control({
                    //     position: 'bottomright'
                    // });
                    // this.legend = document.createElement('svg');

                    //this.legend.style.visibility = 'hidden';

                    // this.legend.style.width = "10rem";
                    // this.legend.style.height = "10rem";
                    // legendControl.onAdd = function () {
                    //     return _this.legend;
                    // };
                    // legendControl.addTo(this.leafletMap);
                    //this.el.querySelector('.leaflet-right.leaflet-bottom').classList.add('leaflet-legend-center');
                    //this.el.querySelector('.leaflet-right.leaflet-bottom').firstChild.classList.add("flowmap-legend-wrapper");
                    //this.el.querySelector('.leaflet-right.leaflet-bottom').firstChild.classList.add("flowmap-d3pluslegend");                    

                    // L.DomEvent.disableClickPropagation(this.legend);
                    // L.DomEvent.disableScrollPropagation(this.legend);



                    // `fullscreenchange` Event that's fired when entering or exiting fullscreen.
                    _this.leafletMap.on('fullscreenchange', function () {
                        if (_this.leafletMap.isFullscreen()) {
                            $(".flowmap-d3pluslegend-wrapper").addClass("flowmapLegendFullscreen");
                        } else {
                            $(".flowmap-d3pluslegend-wrapper").removeClass("flowmapLegendFullscreen");
                        }
                    });


                    // Smooth scroll to top of Viz
                    setTimeout(() => {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }, 500);
                    this.options.flowsView.loader.deactivate();
                },

                toggleLight() {
                    var _this = this;
                    var darkBack = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap, © CartoDB'
                    });
                    var lightBack = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap, © CartoDB'
                    });
                    this.leafletMap.removeLayer(this.backgroundLayer);
                    var checked = _this.lightCheck.checked;
                    if (checked) {
                        this.leafletMap.addLayer(lightBack);
                    } else {
                        this.leafletMap.addLayer(darkBack);
                    }
                },

                toggleLegend(){
                    this.hasLegend = !this.hasLegend;
                    this.updateLegend();
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
                            width: "600",
                            align: "center",
                        });
                    } else {
                        $(".flowmap-d3pluslegend-wrapper").fadeOut();
                    }
                },

                zoomed: function () {
                    // zoomend always is triggered before clustering is done -> reset clusters
                    this.clusterGroupsDone = 0;
                },


                resetMapData: function (data, zoomToFit) {
                    this.data = data;
                    this.flowMap.clear();
                    this.flowMap.addNodes(data.nodes);

                    if (this.flowCheck.checked)
                        this.flowMap.addFlows(data.flows);

                    this.flowMap.showNodes = true;
                    this.flowMap.showFlows = true;

                    this.flowMap.showNodes = (this.actorCheck.checked) ? true : false;
                    this.flowMap.showFlows = (this.flowCheck.checked) ? true : false;
                    this.flowMap.dottedLines = (this.aniDotsRadio.checked) ? true : false;

                    this.updateLegend();

                    this.flowMap.toggleTag('actor', this.actorCheck.checked);

                    this.flowMap.resetView();
                    if (zoomToFit) this.flowMap.zoomToFit();
                },

                rerender: function (zoomToFit) {
                    var _this = this;

                    var data = _this.transformToLinksAndNodes(_this.flows);

                    if (_this.displayWarnings && data.warnings.length > 0) {
                        var msg = '';
                        data.warnings.forEach(function (warning) {
                            msg += warning + '<br>';
                        })
                        _this.alert(msg);
                    }
                    _this.resetMapData(data, zoomToFit);
                    _this.toggleLight();
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
                    }

                },

                transformToLinksAndNodes: function (flows) {
                    var _this = this,
                        nodes = [],
                        links = [];

                    //var dimensionAttributeName = ""

                    flows.forEach(function (flow, index) {
                        let originNode = flow.origin;
                        let destinationNode = flow.destination
                        let link = flow;
                        let linkInfo = _this.returnLinkInfo(this[index]);
                        let opacityValue = 0.8;

                        // NODES
                        // Add the origin and destination to Nodes, and include amounts:
                        //originNode.value = flow.amount;
                        originNode.label = linkInfo.amountText + " " + linkInfo.dimensionValue;
                        originNode.opacity = opacityValue
                        // destinationNode.value = flow.amount;
                        // destinationNode.label = linkInfo.amountText + " " + linkInfo.dimensionValue;
                        destinationNode.opacity = opacityValue

                        nodes.push(originNode, destinationNode)

                        // LINKS
                        link.source = this[index].origin.id;
                        link.target = this[index].destination.id;
                        link.value = this[index].amount;
                        link.dimensionId = linkInfo.dimensionId;
                        link.label = linkInfo.toolTipText;
                        link.dimensionValue = linkInfo.dimensionValue;
                        links.push(link)

                        //dimensionAttributeName = linkInfo.dimensionId;
                    }, flows);

                    // Assign colors to links and nodes based on label-prop:
                    links = enrichFlows.assignColorsByProperty(links, "dimensionId");
                    nodes = enrichFlows.assignColorsByProperty(nodes, "label");

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