define(['underscore',
        'views/common/baseview',
        'collections/collection',
        'visualizations/flowmap',
        'visualizations/d3plusLegend',
        'd3',
        'visualizations/d3plus',
        'utils/utils',
        'utils/enrichFlows',
        'file-saver',
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

    function (_, BaseView, Collection, FlowMap, D3plusLegend, d3, d3plus, utils, enrichFlows, FileSaver, L) {

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
                    this.flows = [{"origin": {"id": 1, "lon": 4.422781178035635, "lat": 52.1896314967364}, "destination": {"id": 100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 210.16, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 2, "lon": 4.541857681155163, "lat": 51.65880967661013}, "destination": {"id": 200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 13.78, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 3, "lon": 4.640704243020666, "lat": 52.04239663157308}, "destination": {"id": 300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 33.14, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 4, "lon": 4.779458145193635, "lat": 52.17079081606919}, "destination": {"id": 400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1185.92, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 5, "lon": 4.844598428702875, "lat": 52.67601686335157}, "destination": {"id": 500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2552.04, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 6, "lon": 4.86406208661158, "lat": 51.6377828920238}, "destination": {"id": 600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6454.463, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 7, "lon": 5.068529638469106, "lat": 51.57963046311951}, "destination": {"id": 700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2384.08, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 8, "lon": 5.282895004196338, "lat": 51.83536693797807}, "destination": {"id": 800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 420.9, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 9, "lon": 5.331155132182385, "lat": 53.3983559811574}, "destination": {"id": 900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.33, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 10, "lon": 5.384698457206035, "lat": 52.17365620111089}, "destination": {"id": 1000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 891.32, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 11, "lon": 5.668142172187994, "lat": 52.28772136068733}, "destination": {"id": 1100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 33.64, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 12, "lon": 6.038961214501948, "lat": 53.1134118184648}, "destination": {"id": 1200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 70.76, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 13, "lon": 6.099081486608263, "lat": 52.22560493832282}, "destination": {"id": 1300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 300.3, "tag": "Imported secondary material", "color": "RGB(0,195,255)"}, {"origin": {"id": 14, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1400000, "lon": 4.545837831280797, "lat": 52.25555551949294}, "amount": 464.78, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 15, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1500000, "lon": 4.803289224783932, "lat": 52.60180952266069}, "amount": 23.3, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 16, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1600000, "lon": 4.949233794653462, "lat": 52.82970438778289}, "amount": 767.3599999999999, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 17, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1700000, "lon": 5.225225349687499, "lat": 52.7009764101599}, "amount": 105.56, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 18, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1800000, "lon": 5.238733860654663, "lat": 51.3723076359888}, "amount": 136.24, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 19, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1900000, "lon": 5.282895004196338, "lat": 51.83536693797807}, "amount": 27.88, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 20, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2000000, "lon": 5.296959460599407, "lat": 51.77625221785452}, "amount": 98.76, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 21, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2100000, "lon": 5.406878781614007, "lat": 51.88508448582916}, "amount": 4.3, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 22, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2200000, "lon": 5.451034703049604, "lat": 52.34599055630678}, "amount": 3178.76, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 23, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2300000, "lon": 5.555655910801532, "lat": 52.02367981353829}, "amount": 131.34, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 24, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2400000, "lon": 5.641901995597006, "lat": 52.16828544017348}, "amount": 189.52, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 25, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2500000, "lon": 5.701863282214817, "lat": 52.50247817243512}, "amount": 8163.179999999998, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 26, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2600000, "lon": 5.723530978719164, "lat": 52.91649976485368}, "amount": 1311.12, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 27, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2700000, "lon": 5.754279379912139, "lat": 51.54075482856837}, "amount": 571.22, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 28, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2800000, "lon": 5.767503478515616, "lat": 52.71251081177863}, "amount": 6674.679999999998, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 29, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2900000, "lon": 5.779206165133881, "lat": 51.38641544509816}, "amount": 2113.4, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}, {"origin": {"id": 30, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3000000, "lon": 5.921845020580252, "lat": 52.18988523534984}, "amount": 33.54, "tag": "Exported secondary material", "color": "RGB(82,163,71)"}]

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

                    $(".export-csv").on("click", function() {
                        _this.exportCSV();
                    })

                    $(".export-png").on("click", function(event) {
                        // _this.exportPNG();
                        _this.easyprintCsBtn.click();
                        event.preventDefault();
                    })

                    this.render();
                    this.rerender(true);
                },

                /*
                 * dom events (managed by jquery)
                 */
                events: {
                    'click .toggle-legend': 'toggleLegend',
                    'click .toggle-darkmode': 'toggleDarkMode',
                    'click .toggle-animation': 'toggleAnimation',
                    'click .toggle-flows': 'toggleFlows',
                    'click .toggle-nodes': 'toggleNodes',
                    'click .toggle-areas': 'toggleAreas'
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
                            minZoom: 1,
                            maxZoom: 25
                        })
                    .addLayer(this.backgroundLayer);

                    // Disable zoom on scroll:
                    this.leafletMap.scrollWheelZoom.disable();

                    // Retrieve area geometry
                    var areas = [];
                    if (!this.isActorLevel) {
                        this.areas = Object.values(this.flows.pop());
                        
                        this.areas.forEach(function(area) {
                            let newArea = {
                                id: area['id'],
                                name: area['name'],
                                geom: area['geom'].coordinates,
                            }
                            areas.push(newArea);
                        })
                    }

                    // Instantiate Flowmap object:
                    this.flowMap = new FlowMap(this.leafletMap, {
                        maxFlowWidth: this.isActorLevel ? null : 50,
                        toolTipContainer: this.el,
                        areas: areas,
                        label: this.label,
                    });
                    this.flowMap.dottedLines = false;
                    this.flowMap.showFlows = true;
                    this.flowMap.showNodes = false;
                    this.flowMap.showAreas = !this.isActorLevel;
                    this.flowMap.showAreaBorders = !this.isActorLevel;
                    this.flowMap.showAreaFilled = false;

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
                    // var exportImgBtn = document.createElement('button');
                    // exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    // exportImgBtn.title = "Export this visualization as a PNG file.";
                    // topLeftControlDiv.appendChild(exportImgBtn);

                    // // Export CSV
                    // var exportCSVBtn = document.createElement('button');
                    // exportCSVBtn.classList.add('fas', 'fa-file', 'btn', 'btn-primary', 'inverted');
                    // exportCSVBtn.title = "Export this visualization as a CSV file.";
                    // topLeftControlDiv.appendChild(exportCSVBtn);
                    // exportCSVBtn.addEventListener('click', function(event) {
                    //     _this.exportCSV();
                    // })

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
                    var easyprintCtrl = this.el.querySelector('.leaflet-control-easyPrint');
                    this.easyprintCsBtn = this.el.querySelector('.easyPrintHolder .A4Landscape');
                    easyprintCtrl.style.display = 'none';
                    // exportImgBtn.addEventListener('click', function (event) {
                    //     easyprintCsBtn.click();
                    //     event.preventDefault();
                    // })

                    buttons = {
                        'legend':            'Toggle the legend on or off.',
                        'darkmode':          'Toggle light or dark mode.',
                        'flowmap-animation': 'Toggle the animation of the flows.',
                        'flowmap-flows':     'Toggle the flows on or off.',
                        'flowmap-nodes':     'Toggle the nodes on or off.',
                        'flowmap-areas':     'Toggle the areas on or off.'
                    }

                    Object.entries(buttons).forEach(function(button) {
                        [icon, title] = button;
                        var className = icon.split('-').pop(),
                            btn = document.createElement('button');

                        btn.classList.add("btn", "btn-primary", "toggle-" + className);
                        btn.title = title;
                        btn.innerHTML = '<i class="fas icon-toggle-' + icon + '"></i>';

                        topLeftControlDiv.appendChild(btn);
                    })

                    topLefControls.onAdd = function (map) {
                        return topLeftControlDiv;
                    };
                    topLefControls.addTo(this.leafletMap);

                    if (this.isActorLevel) $('.toggle-areas').hide();

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

                toggleLegend() {
                    this.hasLegend = !this.hasLegend;
                    this.updateLegend();
                },

                toggleDarkMode() {
                    this.isDarkMode = !this.isDarkMode;
                    this.tileType = this.isDarkMode ? "dark_all" : "light_all";

                    this.updateLegend();
                    this.leafletMap.removeLayer(this.backgroundLayer);
                    this.backgroundLayer.setUrl(this.tileUrl + this.tileType + this.tileSuffix)
                    this.leafletMap.addLayer(this.backgroundLayer);
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

                toggleFlows() {
                    this.flowMap.showFlows = !this.flowMap.showFlows;
                    this.rerender();
                },

                toggleNodes() {
                    this.flowMap.showNodes = !this.flowMap.showNodes;
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

                rerender: function (zoomToFit) {
                    var data = this.transformToLinksAndNodes(this.flows);
                    this.resetMapData(data, zoomToFit);
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

                        // NODES
                        originNode.value = destinationNode.value = flow.amount;
                        originNode.dimensionValue = destinationNode.dimensionValue = linkInfo.dimensionValue;
                        originNode.dimensionText = destinationNode.dimensionText = linkInfo.dimensionText;
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
//                    links = enrichFlows.assignColorsByProperty(links, "dimensionId");
//                    nodes = enrichFlows.assignColorsByProperty(nodes, "dimensionValue");

                    nodes = _.sortBy(nodes, 'value').reverse();

                    // Get all unique occurences for legend:
                    links.forEach(link => {
                        _this.legendItems = [];
                    });

                    _this.legendItems = _.uniq(_this.legendItems, 'label');

                    return {
                        flows: links,
                        nodes: nodes,
                    }
                },

                exportCSV: function () {
                    // export nodes
                    let items = _.uniq(this.data.nodes, 'id'),
                        replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

                    let fields = ["name", "lon", "lat"];
                    let header = Object.keys(items[0]);
                    header = header.filter(prop => {
                        return fields.some(f => prop.includes(f))
                    })

                    let nodeCSV = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    nodeCSV.unshift(header.join(','))
                    nodeCSV = nodeCSV.join('\r\n')

                    // export flows
                    items = this.data.flows;

                    fields = ["amount", "Code", "Name"];
                    header = Object.keys(items[0]);
                    header = header.filter(prop => {
                        return fields.some(f => prop.includes(f))
                    })

                    let flowCSV = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
                    flowCSV.unshift(header.join(','))
                    flowCSV = flowCSV.join('\r\n')

                    // export all
                    let csv = nodeCSV + '\n\n' + flowCSV;
                    var blob = new Blob([csv], {
                        type: "text/plain;charset=utf-8"
                    });
                    FileSaver.saveAs(blob, "data.csv");
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