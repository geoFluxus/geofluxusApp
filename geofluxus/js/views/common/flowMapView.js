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
                    this.flows = [{"origin": {"id": 1, "lon": 4.325247590233912, "lat": 51.92466066267959}, "destination": {"id": 100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7.86, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 2, "lon": 4.471213593466204, "lat": 52.18555390044142}, "destination": {"id": 200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1717.48, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 3, "lon": 4.485117664184377, "lat": 52.15498519760065}, "destination": {"id": 300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 33.56, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 4, "lon": 4.511898057627024, "lat": 52.21400161180224}, "destination": {"id": 400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 60.06, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 5, "lon": 4.629211998666523, "lat": 52.19257983639784}, "destination": {"id": 500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1279.38, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 6, "lon": 4.64097941467185, "lat": 52.11332282182251}, "destination": {"id": 600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 103.44, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 7, "lon": 4.779458145193635, "lat": 52.17079081606919}, "destination": {"id": 700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 14.86, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 8, "lon": 4.803289224783932, "lat": 52.60180952266069}, "destination": {"id": 800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3792.9, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 9, "lon": 4.844598428702875, "lat": 52.67601686335157}, "destination": {"id": 900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 224.6, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 10, "lon": 4.864242047899063, "lat": 52.02745796262166}, "destination": {"id": 1000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7.06, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 11, "lon": 4.917327834076468, "lat": 52.22634381661644}, "destination": {"id": 1100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 198.74, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 12, "lon": 4.948150268813619, "lat": 52.6446917568093}, "destination": {"id": 1200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 29.56, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 13, "lon": 5.099295013512827, "lat": 52.72083944610649}, "destination": {"id": 1300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.8, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 14, "lon": 5.279674109168027, "lat": 52.24988283936158}, "destination": {"id": 1400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 46.37, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 15, "lon": 5.451034703049604, "lat": 52.34599055630678}, "destination": {"id": 1500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1026.92, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 16, "lon": 5.485690372082152, "lat": 52.21083832344267}, "destination": {"id": 1600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 62.86, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 17, "lon": 5.892591663218473, "lat": 52.00115606586915}, "destination": {"id": 1700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8.96, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 18, "lon": 6.233945431628555, "lat": 52.13634276341051}, "destination": {"id": 1800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 516.64, "tag": "Imported waste", "color": "RGB(247,239,169)"}, {"origin": {"id": 19, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1900000, "lon": 4.217378533067335, "lat": 51.99724462193563}, "amount": 83.82, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 20, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2000000, "lon": 4.325247590233912, "lat": 51.92466066267959}, "amount": 885.979, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 21, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2100000, "lon": 4.327862977259868, "lat": 51.91738929206598}, "amount": 201.9, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 22, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2200000, "lon": 4.42195520048784, "lat": 52.01753759718812}, "amount": 90.68, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 23, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2300000, "lon": 4.42451713768903, "lat": 51.51319989568941}, "amount": 48.80600000000002, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 24, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2400000, "lon": 4.438633335884687, "lat": 52.12482383871038}, "amount": 257.34, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 25, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2500000, "lon": 4.471155476758182, "lat": 52.26882663714529}, "amount": 5.98, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 26, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2600000, "lon": 4.505973129820774, "lat": 52.27146479321002}, "amount": 117.08, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 27, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2700000, "lon": 4.506134579291695, "lat": 52.00402315085434}, "amount": 2.665, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 28, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2800000, "lon": 4.511898057627024, "lat": 52.21400161180224}, "amount": 316.235, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 29, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2900000, "lon": 4.525436838272586, "lat": 51.85106590628539}, "amount": 9.6, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 30, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3000000, "lon": 4.541857681155163, "lat": 51.65880967661013}, "amount": 2.325, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 31, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3100000, "lon": 4.545837831280797, "lat": 52.25555551949294}, "amount": 855.1689999999996, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 32, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3200000, "lon": 4.576956515244833, "lat": 52.29677486664884}, "amount": 1309.419999999998, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 33, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3300000, "lon": 4.629211998666523, "lat": 52.19257983639784}, "amount": 400.86, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 34, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3400000, "lon": 4.64097941467185, "lat": 52.11332282182251}, "amount": 2.4, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 35, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3500000, "lon": 4.683009894501053, "lat": 52.55698330338122}, "amount": 222.97, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 36, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3600000, "lon": 4.709540544151912, "lat": 51.78201830662832}, "amount": 0.68, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 37, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3700000, "lon": 4.754160876915306, "lat": 52.922638124743}, "amount": 0.16, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 38, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3800000, "lon": 4.766097062431349, "lat": 52.0654193709487}, "amount": 23.56, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 39, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3900000, "lon": 4.779458145193635, "lat": 52.17079081606919}, "amount": 717.2199999999998, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 40, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4000000, "lon": 4.803289224783932, "lat": 52.60180952266069}, "amount": 431.3550000000001, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 41, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4100000, "lon": 4.844598428702875, "lat": 52.67601686335157}, "amount": 501.86, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 42, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4200000, "lon": 4.917327834076468, "lat": 52.22634381661644}, "amount": 3604.86, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 43, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4300000, "lon": 4.945542460192611, "lat": 51.98535333113123}, "amount": 7.5, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 44, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4400000, "lon": 4.949233794653462, "lat": 52.82970438778289}, "amount": 57.67999999999999, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 45, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4500000, "lon": 4.977078506431726, "lat": 51.83845942844491}, "amount": 23.32, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 46, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4600000, "lon": 5.011820461530924, "lat": 51.69231418456535}, "amount": 5.94, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 47, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4700000, "lon": 5.012587028747504, "lat": 52.17696976174235}, "amount": 558.1399999999999, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 48, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4800000, "lon": 5.074745541761854, "lat": 52.09113829540244}, "amount": 327.46, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 49, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4900000, "lon": 5.085933890003502, "lat": 51.90284850684141}, "amount": 12.66, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 50, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5000000, "lon": 5.094670533025736, "lat": 52.03082202110411}, "amount": 3.695, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 51, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5100000, "lon": 5.181697878400655, "lat": 52.0041018557419}, "amount": 959.5500000000001, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 52, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5200000, "lon": 5.279674109168027, "lat": 52.24988283936158}, "amount": 80.99000000000001, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 53, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5300000, "lon": 5.296288896182794, "lat": 52.15619845634265}, "amount": 75.5, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 54, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5400000, "lon": 5.351790466010224, "lat": 51.71672090175673}, "amount": 0.1, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 55, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5500000, "lon": 5.357980462536765, "lat": 52.23870221981723}, "amount": 1714.104, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 56, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5600000, "lon": 5.384698457206035, "lat": 52.17365620111089}, "amount": 4.146999999999996, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 57, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5700000, "lon": 5.403655790016887, "lat": 51.93832081226911}, "amount": 108.01, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 58, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5800000, "lon": 5.436506954655308, "lat": 51.62210129518245}, "amount": 13.04, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 59, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5900000, "lon": 5.451034703049604, "lat": 52.34599055630678}, "amount": 287.5699999999999, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 60, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6000000, "lon": 5.655443902320496, "lat": 52.33934309453753}, "amount": 14.76, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 61, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6100000, "lon": 5.691697036892088, "lat": 51.2336168105191}, "amount": 2.15, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 62, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6200000, "lon": 5.701863282214817, "lat": 52.50247817243512}, "amount": 108.482, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 63, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6300000, "lon": 5.701890255946667, "lat": 51.81673612355807}, "amount": 7.188, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 64, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6400000, "lon": 5.723530978719164, "lat": 52.91649976485368}, "amount": 70.975, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 65, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6500000, "lon": 5.740270398921716, "lat": 51.86281303230384}, "amount": 0.67, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 66, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6600000, "lon": 5.841993540409356, "lat": 51.61731661102461}, "amount": 36.54, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 67, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6700000, "lon": 5.921845020580252, "lat": 52.18988523534984}, "amount": 228.79, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 68, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6800000, "lon": 5.931250975285516, "lat": 52.5556752998724}, "amount": 166.19, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 69, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6900000, "lon": 5.937633669760289, "lat": 52.45673500652127}, "amount": 13.44, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 70, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7000000, "lon": 6.038961214501948, "lat": 53.1134118184648}, "amount": 19.414, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 71, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7100000, "lon": 6.064357264756678, "lat": 52.60242636227616}, "amount": 4.72, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 72, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7200000, "lon": 6.1183656853076, "lat": 52.51870032468072}, "amount": 0.4, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 73, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7300000, "lon": 6.409536465344809, "lat": 51.90784377183439}, "amount": 0.3, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 74, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7400000, "lon": 6.575589510063545, "lat": 52.00968688152244}, "amount": 6.262999999999999, "tag": "Exported waste", "color": "RGB(198,79,80)"}, {"origin": {"id": 75, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7500000, "lon": 6.880091628464298, "lat": 53.0889904757785}, "amount": 3.73, "tag": "Exported waste", "color": "RGB(198,79,80)"}]

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