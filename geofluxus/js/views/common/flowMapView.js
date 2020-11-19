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
                    this.flows = [{"origin": {"id": 1, "lon": 4.325247590233912, "lat": 51.92466066267959}, "destination": {"id": 100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 20748.731, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 2, "lon": 4.327862977259868, "lat": 51.91738929206598}, "destination": {"id": 200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 12102.14, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 3, "lon": 4.422781178035635, "lat": 52.1896314967364}, "destination": {"id": 300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 598.04, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 4, "lon": 4.471155476758182, "lat": 52.26882663714529}, "destination": {"id": 400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2745.16, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 5, "lon": 4.505973129820774, "lat": 52.27146479321002}, "destination": {"id": 500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4440.38, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 6, "lon": 4.709540544151912, "lat": 51.78201830662832}, "destination": {"id": 600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3284.38, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 7, "lon": 4.754160876915306, "lat": 52.922638124743}, "destination": {"id": 700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9.76, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 8, "lon": 4.779458145193635, "lat": 52.17079081606919}, "destination": {"id": 800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 18270.06, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 9, "lon": 4.844598428702875, "lat": 52.67601686335157}, "destination": {"id": 900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 29621.46999999999, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 10, "lon": 4.86406208661158, "lat": 51.6377828920238}, "destination": {"id": 1000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1020.42, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 11, "lon": 5.074745541761854, "lat": 52.09113829540244}, "destination": {"id": 1100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 159227.317, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 12, "lon": 5.181697878400655, "lat": 52.0041018557419}, "destination": {"id": 1200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 10494.58, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 13, "lon": 5.279674109168027, "lat": 52.24988283936158}, "destination": {"id": 1300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 199.27, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 14, "lon": 5.282895004196338, "lat": 51.83536693797807}, "destination": {"id": 1400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 420.9, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 15, "lon": 5.296288896182794, "lat": 52.15619845634265}, "destination": {"id": 1500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 690.0, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 16, "lon": 5.325054837274503, "lat": 51.98924653511317}, "destination": {"id": 1600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 25.76, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 17, "lon": 5.351790466010224, "lat": 51.71672090175673}, "destination": {"id": 1700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 838.52, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 18, "lon": 5.384698457206035, "lat": 52.17365620111089}, "destination": {"id": 1800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1.5, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 19, "lon": 5.406878781614007, "lat": 51.88508448582916}, "destination": {"id": 1900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 23.2, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 20, "lon": 5.691697036892088, "lat": 51.2336168105191}, "destination": {"id": 2000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 93.26, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 21, "lon": 5.728037332781155, "lat": 52.0764230491388}, "destination": {"id": 2100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 78.86, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 22, "lon": 5.836773480615486, "lat": 51.83850663485318}, "destination": {"id": 2200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1159.21, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 23, "lon": 5.859620038980434, "lat": 50.90542151663896}, "destination": {"id": 2300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8586.819999999998, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 24, "lon": 5.977913026752349, "lat": 52.99598529542541}, "destination": {"id": 2400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 378.3, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 25, "lon": 6.233945431628555, "lat": 52.13634276341051}, "destination": {"id": 2500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 446.54, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 26, "lon": 6.235793755285278, "lat": 52.26822967743637}, "destination": {"id": 2600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 15185.56, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 27, "lon": 6.302944597898288, "lat": 52.04524043526054}, "destination": {"id": 2700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 21537.6, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 28, "lon": 6.570826628664647, "lat": 52.10087813257437}, "destination": {"id": 2800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6516.540000000001, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 29, "lon": 6.743560210366507, "lat": 52.31233170057833}, "destination": {"id": 2900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4098.88, "tag": "Imported secondary material", "color": "RGB(88,180,187)"}, {"origin": {"id": 30, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3000000, "lon": 19.40107115035469, "lat": 47.17056030057577}, "amount": 5.04, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 31, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3100000, "lon": 4.09156161265729, "lat": 51.89508643937823}, "amount": 2525.6, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 32, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3200000, "lon": 4.137285952391374, "lat": 51.43706479310183}, "amount": 407.94, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 33, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3300000, "lon": 4.137334541954859, "lat": 51.8463352794762}, "amount": 32.04, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 34, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3400000, "lon": 4.300847817836634, "lat": 52.0683145761507}, "amount": 402.14, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 35, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3500000, "lon": 4.325247590233912, "lat": 51.92466066267959}, "amount": 5353.3, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 36, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3600000, "lon": 4.422781178035635, "lat": 52.1896314967364}, "amount": 1127.0, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 37, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3700000, "lon": 4.42451713768903, "lat": 51.51319989568941}, "amount": 1969.78, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 38, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3800000, "lon": 4.471155476758182, "lat": 52.26882663714529}, "amount": 10.28, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 39, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3900000, "lon": 4.485117664184377, "lat": 52.15498519760065}, "amount": 1476.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 40, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4000000, "lon": 4.505973129820774, "lat": 52.27146479321002}, "amount": 74.38, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 41, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4100000, "lon": 4.506134579291695, "lat": 52.00402315085434}, "amount": 657.72, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 42, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4200000, "lon": 4.511898057627024, "lat": 52.21400161180224}, "amount": 30.06, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 43, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4300000, "lon": 4.541857681155163, "lat": 51.65880967661013}, "amount": 2623.0, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 44, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4400000, "lon": 4.542008120085821, "lat": 52.15665370878714}, "amount": 140.98, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 45, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4500000, "lon": 4.545837831280797, "lat": 52.25555551949294}, "amount": 23009.97, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 46, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4600000, "lon": 4.576956515244833, "lat": 52.29677486664884}, "amount": 5701.28, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 47, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4700000, "lon": 4.580142054298716, "lat": 51.93493218703784}, "amount": 51.98, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 48, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4800000, "lon": 4.602104302070005, "lat": 51.91469605660366}, "amount": 1362.66, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 49, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4900000, "lon": 4.638790142985359, "lat": 51.84179479393779}, "amount": 1512.588, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 50, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5000000, "lon": 4.640704243020666, "lat": 52.04239663157308}, "amount": 1029.64, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 51, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5100000, "lon": 4.64097941467185, "lat": 52.11332282182251}, "amount": 5412.659999999999, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 52, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5200000, "lon": 4.670624544912254, "lat": 52.66281626448637}, "amount": 1869.96, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 53, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5300000, "lon": 4.683009894501053, "lat": 52.55698330338122}, "amount": 1160.06, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 54, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5400000, "lon": 4.703345063466144, "lat": 51.83323703312558}, "amount": 1033.7, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 55, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5500000, "lon": 4.706204122404936, "lat": 52.01530168087869}, "amount": 5374.280000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 56, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5600000, "lon": 4.708572769593354, "lat": 52.59985506343158}, "amount": 59.34, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 57, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5700000, "lon": 4.737227016098479, "lat": 51.95239394105455}, "amount": 7449.540000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 58, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5800000, "lon": 4.748474967147462, "lat": 52.78432488203599}, "amount": 5485.32, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 59, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5900000, "lon": 4.766097062431349, "lat": 52.0654193709487}, "amount": 230.24, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 60, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6000000, "lon": 4.779458145193635, "lat": 52.17079081606919}, "amount": 6012.82, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 61, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6100000, "lon": 4.803289224783932, "lat": 52.60180952266069}, "amount": 11342.93, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 62, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6200000, "lon": 4.844598428702875, "lat": 52.67601686335157}, "amount": 21419.18, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 63, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6300000, "lon": 4.86406208661158, "lat": 51.6377828920238}, "amount": 65.42, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 64, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6400000, "lon": 4.864242047899063, "lat": 52.02745796262166}, "amount": 653.74, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 65, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6500000, "lon": 4.873124918041602, "lat": 51.76709339557473}, "amount": 77.25999999999999, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 66, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6600000, "lon": 4.881580996773531, "lat": 51.69714370757789}, "amount": 1707.52, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 67, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6700000, "lon": 4.898887123558064, "lat": 52.10694088478698}, "amount": 537.7800000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 68, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6800000, "lon": 4.917327834076468, "lat": 52.22634381661644}, "amount": 5157.699999999999, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 69, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6900000, "lon": 4.944044638403301, "lat": 52.04771077014856}, "amount": 11.22, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 70, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7000000, "lon": 4.945542460192611, "lat": 51.98535333113123}, "amount": 82.66, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 71, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7100000, "lon": 4.948150268813619, "lat": 52.6446917568093}, "amount": 17090.41, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 72, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7200000, "lon": 4.949233794653462, "lat": 52.82970438778289}, "amount": 27097.6, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 73, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7300000, "lon": 4.953480479296998, "lat": 52.71528752708128}, "amount": 54.8, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 74, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7400000, "lon": 5.012587028747504, "lat": 52.17696976174235}, "amount": 1500.22, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 75, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7500000, "lon": 5.013353738491563, "lat": 51.93236621847721}, "amount": 11236.37, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 76, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7600000, "lon": 5.074745541761854, "lat": 52.09113829540244}, "amount": 11391.3, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 77, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7700000, "lon": 5.085933890003502, "lat": 51.90284850684141}, "amount": 50.6, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 78, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7800000, "lon": 5.094670533025736, "lat": 52.03082202110411}, "amount": 10708.68, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 79, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7900000, "lon": 5.099295013512827, "lat": 52.72083944610649}, "amount": 2124.74, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 80, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8000000, "lon": 5.111424248432994, "lat": 51.96940836758485}, "amount": 218.0, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 81, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8100000, "lon": 5.15842949244213, "lat": 51.79227982236395}, "amount": 2336.52, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 82, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8200000, "lon": 5.164952804096339, "lat": 52.66395566963561}, "amount": 48.8, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 83, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8300000, "lon": 5.174306045006063, "lat": 52.14174148223032}, "amount": 1864.18, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 84, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8400000, "lon": 5.181697878400655, "lat": 52.0041018557419}, "amount": 63.68000000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 85, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8500000, "lon": 5.220939469470252, "lat": 51.88784352217424}, "amount": 11457.44, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 86, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8600000, "lon": 5.238733860654663, "lat": 51.3723076359888}, "amount": 605.0, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 87, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8700000, "lon": 5.279674109168027, "lat": 52.24988283936158}, "amount": 1540.28, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 88, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8800000, "lon": 5.282895004196338, "lat": 51.83536693797807}, "amount": 2769.24, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 89, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8900000, "lon": 5.296959460599407, "lat": 51.77625221785452}, "amount": 13.32, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 90, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9000000, "lon": 5.351790466010224, "lat": 51.71672090175673}, "amount": 6142.065000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 91, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9100000, "lon": 5.357980462536765, "lat": 52.23870221981723}, "amount": 2602.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 92, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9200000, "lon": 5.384698457206035, "lat": 52.17365620111089}, "amount": 20.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 93, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9300000, "lon": 5.403655790016887, "lat": 51.93832081226911}, "amount": 695.22, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 94, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9400000, "lon": 5.451034703049604, "lat": 52.34599055630678}, "amount": 5221.34, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 95, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9500000, "lon": 5.45888400722391, "lat": 51.45003100501821}, "amount": 1187.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 96, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9600000, "lon": 5.482462224211758, "lat": 51.51637512637151}, "amount": 653.5400000000001, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 97, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9700000, "lon": 5.485690372082152, "lat": 52.21083832344267}, "amount": 2406.44, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 98, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9800000, "lon": 5.496599012735339, "lat": 51.85162884056038}, "amount": 847.46, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 99, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9900000, "lon": 5.520681008786766, "lat": 51.68469408011434}, "amount": 105.98, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 100, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10000000, "lon": 5.53416544636836, "lat": 52.06895095283515}, "amount": 1076.94, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 101, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10100000, "lon": 5.536257765112265, "lat": 53.19627988094779}, "amount": 1410.0, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 102, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10200000, "lon": 5.537188082261407, "lat": 53.01409788567045}, "amount": 4832.98, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 103, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10300000, "lon": 5.56051624302366, "lat": 51.98076721540656}, "amount": 6.32, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 104, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10400000, "lon": 5.586876551117894, "lat": 51.91586959903646}, "amount": 36.72, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 105, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10500000, "lon": 5.623141102799542, "lat": 52.66626282296497}, "amount": 150.38, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 106, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10600000, "lon": 5.641901995597006, "lat": 52.16828544017348}, "amount": 664.54, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 107, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10700000, "lon": 5.655443902320496, "lat": 52.33934309453753}, "amount": 2335.8, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 108, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10800000, "lon": 5.658943093891821, "lat": 51.71665822532144}, "amount": 18.28, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 109, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10900000, "lon": 5.668142172187994, "lat": 52.28772136068733}, "amount": 5625.26, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 110, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11000000, "lon": 5.701863282214817, "lat": 52.50247817243512}, "amount": 3546.9, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 111, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11100000, "lon": 5.723530978719164, "lat": 52.91649976485368}, "amount": 2440.56, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 112, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11200000, "lon": 5.728037332781155, "lat": 52.0764230491388}, "amount": 4202.22, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 113, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11300000, "lon": 5.767503478515616, "lat": 52.71251081177863}, "amount": 980.56, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 114, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11400000, "lon": 5.836773480615486, "lat": 51.83850663485318}, "amount": 19660.057, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 115, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11500000, "lon": 5.849955364360524, "lat": 52.41202642318937}, "amount": 8631.02, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 116, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11600000, "lon": 5.899661668778553, "lat": 51.74736986900555}, "amount": 15.56, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 117, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11700000, "lon": 5.921845020580252, "lat": 52.18988523534984}, "amount": 42287.84, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 118, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11800000, "lon": 5.931250975285516, "lat": 52.5556752998724}, "amount": 1477.34, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 119, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11900000, "lon": 5.937633669760289, "lat": 52.45673500652127}, "amount": 44005.9, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 120, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12000000, "lon": 5.954985362480004, "lat": 52.32551946962143}, "amount": 42117.08, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 121, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12100000, "lon": 5.962899930371608, "lat": 51.51536279630268}, "amount": 137.08, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 122, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12200000, "lon": 5.977913026752349, "lat": 52.99598529542541}, "amount": 1646.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 123, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12300000, "lon": 6.029977579399572, "lat": 52.75558401608868}, "amount": 124.32, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 124, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12400000, "lon": 6.038961214501948, "lat": 53.1134118184648}, "amount": 5271.34, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 125, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12500000, "lon": 6.050334399052928, "lat": 52.40606248006126}, "amount": 1199.06, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 126, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12600000, "lon": 6.053254924930916, "lat": 52.47478376381806}, "amount": 9.98, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 127, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12700000, "lon": 6.064357264756678, "lat": 52.60242636227616}, "amount": 4739.16, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 128, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12800000, "lon": 6.193813473470791, "lat": 52.71593800220008}, "amount": 389.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 129, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12900000, "lon": 6.207083866169604, "lat": 52.63350687306885}, "amount": 101.36, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 130, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13000000, "lon": 6.27664810656606, "lat": 52.51476125247179}, "amount": 162.46, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 131, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13100000, "lon": 6.374584258486443, "lat": 53.27322329451551}, "amount": 481.2, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 132, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13200000, "lon": 6.43475489053506, "lat": 52.51614426347839}, "amount": 367.3, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 133, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13300000, "lon": 6.450917604116669, "lat": 52.38638332036147}, "amount": 920.4, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 134, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13400000, "lon": 6.552482761761146, "lat": 53.00128811214121}, "amount": 312.46, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 135, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13500000, "lon": 6.575589510063545, "lat": 52.00968688152244}, "amount": 54.6, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 136, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13600000, "lon": 6.778222742059631, "lat": 52.25491825839312}, "amount": 131.56, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 137, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13700000, "lon": 6.877808366309683, "lat": 52.22081456113992}, "amount": 80.5, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}, {"origin": {"id": 138, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13800000, "lon": 6.87846487209221, "lat": 53.16681155462729}, "amount": 119.94, "tag": "Exported secondary material", "color": "RGB(3,96,54)"}]

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