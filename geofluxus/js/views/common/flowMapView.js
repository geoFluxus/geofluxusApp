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
                    this.flows = [{"origin": {"id": 1, "lon": -1.61778, "lat": 54.978252}, "destination": {"id": 100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 20998, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 2, "lon": -5.3417241, "lat": 36.1440934}, "destination": {"id": 200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2001, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 3, "lon": -52.101445, "lat": -32.0395116}, "destination": {"id": 300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 11871, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 4, "lon": -78.9768999, "lat": -8.2141205}, "destination": {"id": 400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2865, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 5, "lon": -81.0962172, "lat": -5.0938488}, "destination": {"id": 500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3373, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 6, "lon": -84.9479378, "lat": 10.0674635}, "destination": {"id": 600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6465, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 7, "lon": -90.0715323, "lat": 29.9510658}, "destination": {"id": 700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 10126, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 8, "lon": -90.3231349, "lat": 29.9468716}, "destination": {"id": 800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 11685, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 9, "lon": -90.7580342, "lat": 13.9306292}, "destination": {"id": 900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6789, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 10, "lon": -94.9027002, "lat": 29.383845}, "destination": {"id": 1000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 22522, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 11, "lon": 103.819836, "lat": 1.352083}, "destination": {"id": 1100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 403, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 12, "lon": 11.1868822, "lat": 63.7011075}, "destination": {"id": 1200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 89601, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 13, "lon": 118.3307461, "lat": 5.024206}, "destination": {"id": 1300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9812, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 14, "lon": 119.221611, "lat": 34.596653}, "destination": {"id": 1400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7716, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 15, "lon": 128.581433, "lat": 35.213516}, "destination": {"id": 1500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3041, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 16, "lon": 130.9805119, "lat": 33.7759741}, "destination": {"id": 1600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6643, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 17, "lon": 132.4553055, "lat": 34.3852894}, "destination": {"id": 1700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9135, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 18, "lon": 135.1956311, "lat": 34.6900806}, "destination": {"id": 1800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3306, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 19, "lon": 135.4560944, "lat": 34.5107752}, "destination": {"id": 1900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 104, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 20, "lon": 136.9065571, "lat": 35.1814506}, "destination": {"id": 2000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 21, "lon": 139.6379639, "lat": 35.4436739}, "destination": {"id": 2100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 268, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 22, "lon": 139.6721655, "lat": 35.281498}, "destination": {"id": 2200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 23, "lon": 139.7029125, "lat": 35.5308325}, "destination": {"id": 2300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 224, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 24, "lon": 140.5347934, "lat": 36.3966506}, "destination": {"id": 2400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 13156, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 25, "lon": 150.8995794, "lat": -34.485392}, "destination": {"id": 2500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 26, "lon": 2.1734035, "lat": 41.3850639}, "destination": {"id": 2600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2744, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 27, "lon": 25.6652739, "lat": 60.3931919}, "destination": {"id": 2700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 13464, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 28, "lon": 3.2068507, "lat": 51.3189468}, "destination": {"id": 2800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 154, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 29, "lon": 4.325247590233912, "lat": 51.92466066267959}, "destination": {"id": 2900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 58, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 30, "lon": 55.0272904, "lat": 24.9857145}, "destination": {"id": 3000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 14295, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 31, "lon": 67.0011364, "lat": 24.8607343}, "destination": {"id": 3100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 23933, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 32, "lon": 8.459405, "lat": 55.476466}, "destination": {"id": 3200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 85, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 33, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3300000, "lon": -0.026577, "lat": 52.97894}, "amount": 31540, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 34, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3400000, "lon": -17.4676861, "lat": 14.716677}, "amount": 1604, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 35, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3500000, "lon": -2.342378, "lat": 49.4466698}, "amount": 7023, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 36, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3600000, "lon": -3.8099803, "lat": 43.4623057}, "amount": 30, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 37, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3700000, "lon": -4.4217199, "lat": 36.7211784}, "amount": 3478, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 38, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3800000, "lon": 0.0302354, "lat": 5.7348119}, "amount": 3555, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 39, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3900000, "lon": 0.107929, "lat": 49.49437}, "amount": 1, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 40, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4000000, "lon": 0.14743, "lat": 51.53889}, "amount": 3604, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 41, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4100000, "lon": 0.33694, "lat": 51.441072}, "amount": 24686, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 42, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4200000, "lon": 103.819836, "lat": 1.352083}, "amount": 11, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 43, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4300000, "lon": 11.1868822, "lat": 63.7011075}, "amount": 2040, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 44, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4400000, "lon": 11.97456, "lat": 57.70887}, "amount": 8253, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 45, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4500000, "lon": 114.1693611, "lat": 22.3193039}, "amount": 25, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 46, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4600000, "lon": 14.2678989, "lat": 32.6509505}, "amount": 10952, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 47, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4700000, "lon": 144.9630576, "lat": -37.8136276}, "amount": 101, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 48, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4800000, "lon": 18.7922809, "lat": 57.7182365}, "amount": 15845, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 49, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4900000, "lon": 2.1734035, "lat": 41.3850639}, "amount": 55, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 50, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5000000, "lon": 2.3912362, "lat": 6.3702928}, "amount": 2133, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 51, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5100000, "lon": 20.0867909, "lat": 32.1194242}, "amount": 11572, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 52, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5200000, "lon": 22.0250874, "lat": 60.4660876}, "amount": 3017, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 53, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5300000, "lon": 25.6022423, "lat": -33.9608369}, "amount": 5, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 54, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5400000, "lon": 25.6652739, "lat": 60.3931919}, "amount": 7987, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 55, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5500000, "lon": 31.0218404, "lat": -29.8586804}, "amount": 399, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 56, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5600000, "lon": 4.4024643, "lat": 51.2194475}, "amount": 303, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 57, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5700000, "lon": 5.5740963, "lat": 58.9361824}, "amount": 127, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 58, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5800000, "lon": 55.0272904, "lat": 24.9857145}, "amount": 24, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 59, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5900000, "lon": 57.5012222, "lat": -20.1608912}, "amount": 39, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 60, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6000000, "lon": 8.5661121, "lat": 62.6735166}, "amount": 33, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 61, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6100000, "lon": 8.5809425, "lat": 53.5395845}, "amount": 25, "tag": "Exported material", "color": "RGB(255, 242, 0)"}]

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