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
                    this.flows = [{"origin": {"id": 1, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 100000, "lon": 3.647485453003438, "lat": 51.50176340371749}, "amount": 0.98, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 2, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 200000, "lon": 3.812975409160625, "lat": 51.44522775877068}, "amount": 11106.89, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 3, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 300000, "lon": 3.845906416412129, "lat": 51.28792714558965}, "amount": 970.0, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 4, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 400000, "lon": 4.124332339357934, "lat": 51.74718708523173}, "amount": 39.26, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 5, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 500000, "lon": 4.217378533067335, "lat": 51.99724462193563}, "amount": 3386.845, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 6, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 600000, "lon": 4.248861318450683, "lat": 51.92519949938577}, "amount": 37.5, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 7, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 700000, "lon": 4.288292391035712, "lat": 51.50347231418305}, "amount": 2637.466, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 8, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 800000, "lon": 4.300847817836634, "lat": 52.0683145761507}, "amount": 132.56, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 9, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 900000, "lon": 4.325247590233912, "lat": 51.92466066267959}, "amount": 8241.558, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 10, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1000000, "lon": 4.327862977259868, "lat": 51.91738929206598}, "amount": 31932.914, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 11, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1100000, "lon": 4.363104574700214, "lat": 51.99846070915183}, "amount": 24.123, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 12, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1200000, "lon": 4.373384956027281, "lat": 52.13755271112043}, "amount": 950.52, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 13, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1300000, "lon": 4.385257531300422, "lat": 51.92676121577634}, "amount": 121.31, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 14, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1400000, "lon": 4.42195520048784, "lat": 52.01753759718812}, "amount": 1007.92, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 15, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1500000, "lon": 4.422781178035635, "lat": 52.1896314967364}, "amount": 142.72, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 16, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1600000, "lon": 4.42451713768903, "lat": 51.51319989568941}, "amount": 348.545, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 17, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1700000, "lon": 4.438633335884687, "lat": 52.12482383871038}, "amount": 27.46, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 18, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1800000, "lon": 4.471155476758182, "lat": 52.26882663714529}, "amount": 244.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 19, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 1900000, "lon": 4.489775288556642, "lat": 52.06091031044282}, "amount": 17.48, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 20, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2000000, "lon": 4.505973129820774, "lat": 52.27146479321002}, "amount": 218.14, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 21, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2100000, "lon": 4.506134579291695, "lat": 52.00402315085434}, "amount": 44.803, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 22, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2200000, "lon": 4.513833787489122, "lat": 52.11480566806902}, "amount": 688.3, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 23, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2300000, "lon": 4.523117836186343, "lat": 51.5905367842913}, "amount": 657.92, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 24, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2400000, "lon": 4.525436838272586, "lat": 51.85106590628539}, "amount": 2.18, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 25, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2500000, "lon": 4.535199582903982, "lat": 51.79503556495316}, "amount": 161.401, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 26, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2600000, "lon": 4.541857681155163, "lat": 51.65880967661013}, "amount": 6614.02399999999, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 27, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2700000, "lon": 4.545837831280797, "lat": 52.25555551949294}, "amount": 3142.729, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 28, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2800000, "lon": 4.558574515260396, "lat": 51.52267913481363}, "amount": 30.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 29, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 2900000, "lon": 4.576956515244833, "lat": 52.29677486664884}, "amount": 2994.22, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 30, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3000000, "lon": 4.602104302070005, "lat": 51.91469605660366}, "amount": 147.46, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 31, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3100000, "lon": 4.605797757011537, "lat": 51.82184253598317}, "amount": 28.36, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 32, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3200000, "lon": 4.629211998666523, "lat": 52.19257983639784}, "amount": 111.82, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 33, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3300000, "lon": 4.640704243020666, "lat": 52.04239663157308}, "amount": 3019.16, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 34, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3400000, "lon": 4.64097941467185, "lat": 52.11332282182251}, "amount": 21184.01, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 35, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3500000, "lon": 4.644959330627236, "lat": 51.57832800676078}, "amount": 31.8, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 36, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3600000, "lon": 4.665727555369413, "lat": 51.86465506837039}, "amount": 20.24, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 37, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3700000, "lon": 4.670624544912254, "lat": 52.66281626448637}, "amount": 416.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 38, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3800000, "lon": 4.683009894501053, "lat": 52.55698330338122}, "amount": 890.565, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 39, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 3900000, "lon": 4.703345063466144, "lat": 51.83323703312558}, "amount": 132.62, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 40, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4000000, "lon": 4.706204122404936, "lat": 52.01530168087869}, "amount": 582.013, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 41, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4100000, "lon": 4.709540544151912, "lat": 51.78201830662832}, "amount": 6543.501, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 42, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4200000, "lon": 4.737227016098479, "lat": 51.95239394105455}, "amount": 265.76, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 43, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4300000, "lon": 4.748474967147462, "lat": 52.78432488203599}, "amount": 2549.06, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 44, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4400000, "lon": 4.754160876915306, "lat": 52.922638124743}, "amount": 185.84, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 45, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4500000, "lon": 4.761430075250943, "lat": 51.58513304329588}, "amount": 480.668, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 46, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4600000, "lon": 4.766097062431349, "lat": 52.0654193709487}, "amount": 40.91, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 47, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4700000, "lon": 4.772947477971601, "lat": 51.83068677993407}, "amount": 390.82, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 48, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4800000, "lon": 4.779458145193635, "lat": 52.17079081606919}, "amount": 1582.4, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 49, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 4900000, "lon": 4.789431755760129, "lat": 52.69124000381459}, "amount": 21.54, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 50, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5000000, "lon": 4.801551738365686, "lat": 51.89080797585114}, "amount": 298.34, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 51, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5100000, "lon": 4.803289224783932, "lat": 52.60180952266069}, "amount": 70204.724, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 52, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5200000, "lon": 4.805920304076335, "lat": 53.07903413853881}, "amount": 990.05, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 53, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5300000, "lon": 4.844598428702875, "lat": 52.67601686335157}, "amount": 8871.96, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 54, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5400000, "lon": 4.86406208661158, "lat": 51.6377828920238}, "amount": 221.225, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 55, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5500000, "lon": 4.873124918041602, "lat": 51.76709339557473}, "amount": 25.96, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 56, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5600000, "lon": 4.898887123558064, "lat": 52.10694088478698}, "amount": 17.34, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 57, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5700000, "lon": 4.917327834076468, "lat": 52.22634381661644}, "amount": 39785.204, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 58, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5800000, "lon": 4.930038721281569, "lat": 51.87268940500329}, "amount": 2786.8, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 59, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 5900000, "lon": 4.944044638403301, "lat": 52.04771077014856}, "amount": 33.94, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 60, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6000000, "lon": 4.945542460192611, "lat": 51.98535333113123}, "amount": 488.64, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 61, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6100000, "lon": 4.948150268813619, "lat": 52.6446917568093}, "amount": 1676.92, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 62, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6200000, "lon": 4.949233794653462, "lat": 52.82970438778289}, "amount": 6006.69, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 63, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6300000, "lon": 4.953480479296998, "lat": 52.71528752708128}, "amount": 1439.83, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 64, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6400000, "lon": 4.977078506431726, "lat": 51.83845942844491}, "amount": 1784.897, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 65, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6500000, "lon": 4.981275953248933, "lat": 52.38835384734762}, "amount": 138.53, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 66, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6600000, "lon": 4.994771275662413, "lat": 51.78257279491478}, "amount": 17.24, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 67, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6700000, "lon": 5.011820461530924, "lat": 51.69231418456535}, "amount": 510.382, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 68, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6800000, "lon": 5.012587028747504, "lat": 52.17696976174235}, "amount": 2126.581, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 69, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 6900000, "lon": 5.013353738491563, "lat": 51.93236621847721}, "amount": 16.26, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 70, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7000000, "lon": 5.068529638469106, "lat": 51.57963046311951}, "amount": 1118.36, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 71, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7100000, "lon": 5.069977699722709, "lat": 52.65601760807805}, "amount": 1857.661, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 72, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7200000, "lon": 5.074745541761854, "lat": 52.09113829540244}, "amount": 116193.541, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 73, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7300000, "lon": 5.085933890003502, "lat": 51.90284850684141}, "amount": 41.26, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 74, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7400000, "lon": 5.089311292524694, "lat": 51.84758658767632}, "amount": 661.178, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 75, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7500000, "lon": 5.094670533025736, "lat": 52.03082202110411}, "amount": 2093.316, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 76, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7600000, "lon": 5.099295013512827, "lat": 52.72083944610649}, "amount": 80.5, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 77, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7700000, "lon": 5.111424248432994, "lat": 51.96940836758485}, "amount": 463.664, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 78, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7800000, "lon": 5.15842949244213, "lat": 51.79227982236395}, "amount": 6961.52, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 79, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7900000, "lon": 5.174306045006063, "lat": 52.14174148223032}, "amount": 2798.28, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 80, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8000000, "lon": 5.181697878400655, "lat": 52.0041018557419}, "amount": 4535.7, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 81, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8100000, "lon": 5.19752836629799, "lat": 51.5521068158966}, "amount": 3.448, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 82, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8200000, "lon": 5.210387873825256, "lat": 51.94577863044218}, "amount": 142.95, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 83, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8300000, "lon": 5.216923373772734, "lat": 52.04092103230172}, "amount": 1430.36, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 84, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8400000, "lon": 5.218094612352713, "lat": 51.6260543029173}, "amount": 435.98, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 85, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8500000, "lon": 5.220939469470252, "lat": 51.88784352217424}, "amount": 706.923, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 86, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8600000, "lon": 5.2551818400124, "lat": 52.10197570307093}, "amount": 87.2, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 87, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8700000, "lon": 5.279674109168027, "lat": 52.24988283936158}, "amount": 6117.37, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 88, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8800000, "lon": 5.282895004196338, "lat": 51.83536693797807}, "amount": 42.7, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 89, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8900000, "lon": 5.296288896182794, "lat": 52.15619845634265}, "amount": 12815.04, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 90, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9000000, "lon": 5.296959460599407, "lat": 51.77625221785452}, "amount": 8.78, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 91, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9100000, "lon": 5.325054837274503, "lat": 51.98924653511317}, "amount": 2169.096, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 92, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9200000, "lon": 5.326575274905196, "lat": 51.57825568557919}, "amount": 465.92, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 93, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9300000, "lon": 5.351790466010224, "lat": 51.71672090175673}, "amount": 327.238, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 94, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9400000, "lon": 5.357980462536765, "lat": 52.23870221981723}, "amount": 20587.952, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 95, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9500000, "lon": 5.3832525336216, "lat": 51.41189484537368}, "amount": 59.16, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 96, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9600000, "lon": 5.384698457206035, "lat": 52.17365620111089}, "amount": 34026.7, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 97, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9700000, "lon": 5.38829245859376, "lat": 52.03463684291109}, "amount": 24.84, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 98, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9800000, "lon": 5.39646542146872, "lat": 51.51365667149392}, "amount": 81.013, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 99, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9900000, "lon": 5.403655790016887, "lat": 51.93832081226911}, "amount": 460.65, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 100, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10000000, "lon": 5.406878781614007, "lat": 51.88508448582916}, "amount": 330.06, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 101, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10100000, "lon": 5.416462424594803, "lat": 52.12221993938348}, "amount": 316.8, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 102, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10200000, "lon": 5.436506954655308, "lat": 51.62210129518245}, "amount": 2168.98, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 103, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10300000, "lon": 5.451034703049604, "lat": 52.34599055630678}, "amount": 8948.81, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 104, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10400000, "lon": 5.45172169645809, "lat": 53.17538275437199}, "amount": 6182.14, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 105, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10500000, "lon": 5.45888400722391, "lat": 51.45003100501821}, "amount": 1616.637, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 106, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10600000, "lon": 5.482462224211758, "lat": 51.51637512637151}, "amount": 1174.14, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 107, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10700000, "lon": 5.485690372082152, "lat": 52.21083832344267}, "amount": 291.65, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 108, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10800000, "lon": 5.500493411442505, "lat": 52.08932413362098}, "amount": 30.6, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 109, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10900000, "lon": 5.526405078435736, "lat": 51.78154937233781}, "amount": 226.16, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 110, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11000000, "lon": 5.53416544636836, "lat": 52.06895095283515}, "amount": 77.58, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 111, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11100000, "lon": 5.537188082261407, "lat": 53.01409788567045}, "amount": 1539.88, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 112, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11200000, "lon": 5.555655910801532, "lat": 52.02367981353829}, "amount": 19.48, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 113, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11300000, "lon": 5.56051624302366, "lat": 51.98076721540656}, "amount": 424.17, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 114, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11400000, "lon": 5.574139163859766, "lat": 51.59992091708303}, "amount": 21.62, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 115, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11500000, "lon": 5.584277515411839, "lat": 52.24324181541805}, "amount": 163.338, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 116, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11600000, "lon": 5.586876551117894, "lat": 51.91586959903646}, "amount": 13.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 117, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11700000, "lon": 5.587571809951587, "lat": 51.43127359836577}, "amount": 164.722, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 118, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11800000, "lon": 5.623141102799542, "lat": 52.66626282296497}, "amount": 0.53, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 119, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11900000, "lon": 5.641901995597006, "lat": 52.16828544017348}, "amount": 2261.69, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 120, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12000000, "lon": 5.651829180085864, "lat": 51.65548690865531}, "amount": 9093.14, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 121, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12100000, "lon": 5.655443902320496, "lat": 52.33934309453753}, "amount": 4007.886, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 122, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12200000, "lon": 5.656962653780621, "lat": 51.47614961756382}, "amount": 10.952, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 123, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12300000, "lon": 5.658943093891821, "lat": 51.71665822532144}, "amount": 126.41, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 124, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12400000, "lon": 5.668142172187994, "lat": 52.28772136068733}, "amount": 10771.06, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 125, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12500000, "lon": 5.691697036892088, "lat": 51.2336168105191}, "amount": 127.885, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 126, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12600000, "lon": 5.699548394080463, "lat": 50.85292036518911}, "amount": 131.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 127, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12700000, "lon": 5.701863282214817, "lat": 52.50247817243512}, "amount": 981.32, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 128, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12800000, "lon": 5.701890255946667, "lat": 51.81673612355807}, "amount": 1.501, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 129, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12900000, "lon": 5.723530978719164, "lat": 52.91649976485368}, "amount": 94.333, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 130, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13000000, "lon": 5.728037332781155, "lat": 52.0764230491388}, "amount": 988.991, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 131, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13100000, "lon": 5.740270398921716, "lat": 51.86281303230384}, "amount": 916.353, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 132, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13200000, "lon": 5.767503478515616, "lat": 52.71251081177863}, "amount": 1.96, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 133, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13300000, "lon": 5.778317765655077, "lat": 51.92430193715403}, "amount": 65.99, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 134, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13400000, "lon": 5.786567139247583, "lat": 52.33899093017093}, "amount": 334.8, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 135, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13500000, "lon": 5.826307715868444, "lat": 53.15377008001284}, "amount": 453.96, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 136, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13600000, "lon": 5.828226907620992, "lat": 51.00484275259176}, "amount": 3.1, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 137, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13700000, "lon": 5.836773480615486, "lat": 51.83850663485318}, "amount": 45.88, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 138, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13800000, "lon": 5.841993540409356, "lat": 51.61731661102461}, "amount": 26.82, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 139, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13900000, "lon": 5.849955364360524, "lat": 52.41202642318937}, "amount": 3767.49, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 140, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14000000, "lon": 5.851362585783989, "lat": 51.71830538744143}, "amount": 43.98, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 141, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14100000, "lon": 5.859620038980434, "lat": 50.90542151663896}, "amount": 175.76, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 142, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14200000, "lon": 5.884885860133362, "lat": 51.23946177248358}, "amount": 3.78, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 143, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14300000, "lon": 5.908293898865145, "lat": 51.08503674612556}, "amount": 10.82, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 144, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14400000, "lon": 5.921845020580252, "lat": 52.18988523534984}, "amount": 12194.702, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 145, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14500000, "lon": 5.931250975285516, "lat": 52.5556752998724}, "amount": 2941.184, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 146, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14600000, "lon": 5.937633669760289, "lat": 52.45673500652127}, "amount": 788.94, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 147, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14700000, "lon": 5.942222750823784, "lat": 51.90153683455047}, "amount": 15.2, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 148, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14800000, "lon": 5.954985362480004, "lat": 52.32551946962143}, "amount": 594.43, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 149, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14900000, "lon": 5.969410619753102, "lat": 50.89333930523874}, "amount": 17.67, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 150, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15000000, "lon": 5.970719241193182, "lat": 51.95751959679475}, "amount": 680.32, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 151, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15100000, "lon": 5.977913026752349, "lat": 52.99598529542541}, "amount": 303.33, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 152, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15200000, "lon": 6.017773869849699, "lat": 52.87574113629628}, "amount": 497.76, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 153, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15300000, "lon": 6.0181771147733, "lat": 51.94655324401823}, "amount": 27.05, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 154, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15400000, "lon": 6.029977579399572, "lat": 52.75558401608868}, "amount": 862.04, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 155, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15500000, "lon": 6.038961214501948, "lat": 53.1134118184648}, "amount": 423.41, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 156, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15600000, "lon": 6.050334399052928, "lat": 52.40606248006126}, "amount": 819.67, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 157, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15700000, "lon": 6.050958652625533, "lat": 50.87182225062738}, "amount": 0.267, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 158, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15800000, "lon": 6.051269160502984, "lat": 52.03354629807594}, "amount": 0.278, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 159, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15900000, "lon": 6.053254924930916, "lat": 52.47478376381806}, "amount": 501.96, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 160, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16000000, "lon": 6.064357264756678, "lat": 52.60242636227616}, "amount": 4389.68, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 161, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16100000, "lon": 6.099081486608263, "lat": 52.22560493832282}, "amount": 6552.46, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 162, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16200000, "lon": 6.112848014923356, "lat": 53.04914212090364}, "amount": 13.18, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 163, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16300000, "lon": 6.1183656853076, "lat": 52.51870032468072}, "amount": 11334.21, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 164, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16400000, "lon": 6.143136325054241, "lat": 53.21667994913061}, "amount": 17741.0, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 165, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16500000, "lon": 6.159151436536577, "lat": 51.39100777694384}, "amount": 19.38, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 166, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16600000, "lon": 6.207083866169604, "lat": 52.63350687306885}, "amount": 5297.84, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 167, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16700000, "lon": 6.233945431628555, "lat": 52.13634276341051}, "amount": 1889.44, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 168, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16800000, "lon": 6.235793755285278, "lat": 52.26822967743637}, "amount": 14.136, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 169, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 16900000, "lon": 6.27664810656606, "lat": 52.51476125247179}, "amount": 3.94, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 170, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17000000, "lon": 6.279019541440415, "lat": 52.38785759493486}, "amount": 71.7, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 171, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17100000, "lon": 6.286691879285025, "lat": 51.96077191298796}, "amount": 327.26, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 172, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17200000, "lon": 6.409536465344809, "lat": 51.90784377183439}, "amount": 79.04, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 173, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17300000, "lon": 6.433980474150056, "lat": 52.29142455006288}, "amount": 30.7, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 174, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17400000, "lon": 6.450917604116669, "lat": 52.38638332036147}, "amount": 867.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 175, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17500000, "lon": 6.513553259446505, "lat": 52.72310359940973}, "amount": 165.88, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 176, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17600000, "lon": 6.54266625135195, "lat": 52.86740520786586}, "amount": 3362.02, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 177, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17700000, "lon": 6.574071653174544, "lat": 52.58564249460619}, "amount": 72.94, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 178, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17800000, "lon": 6.575589510063545, "lat": 52.00968688152244}, "amount": 827.163, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 179, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 17900000, "lon": 6.589990763030781, "lat": 52.23643372191186}, "amount": 14.46, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 180, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18000000, "lon": 6.658197512338412, "lat": 52.3479024603495}, "amount": 331.4, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 181, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18100000, "lon": 6.673953536020385, "lat": 53.42067328351118}, "amount": 12106.06, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 182, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18200000, "lon": 6.725865028002612, "lat": 51.96987169898907}, "amount": 0.78, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 183, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18300000, "lon": 6.727329821473273, "lat": 52.99302415278586}, "amount": 0.86, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 184, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18400000, "lon": 6.735914396962516, "lat": 52.74030922025383}, "amount": 191.22, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 185, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18500000, "lon": 6.746794111632094, "lat": 53.14734501789835}, "amount": 298.66, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 186, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18600000, "lon": 6.755840309642, "lat": 52.1554987892827}, "amount": 3.76, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 187, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18700000, "lon": 6.778222742059631, "lat": 52.25491825839312}, "amount": 2539.817, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 188, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18800000, "lon": 6.877808366309683, "lat": 52.22081456113992}, "amount": 24.62, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 189, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 18900000, "lon": 6.880091628464298, "lat": 53.0889904757785}, "amount": 41.732, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 190, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19000000, "lon": 6.911043515802117, "lat": 52.30772695306445}, "amount": 166.63, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 191, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19100000, "lon": 6.914211526206672, "lat": 52.37302464701727}, "amount": 453.8, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 192, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19200000, "lon": 6.929903725229917, "lat": 53.3200296433896}, "amount": 1791.951, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 193, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19300000, "lon": 6.961984552119418, "lat": 52.74972016120728}, "amount": 2.12, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 194, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19400000, "lon": 7.010322201476536, "lat": 53.00217146170223}, "amount": 8.0, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 195, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19500000, "lon": 7.055730796451056, "lat": 53.19510627105819}, "amount": 590.78, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 196, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 19600000, "lon": 8.469121004807434, "lat": 52.30268000395095}, "amount": 254.08, "tag": "Exported waste", "color": "RGB(237, 230, 174)"}, {"origin": {"id": 197, "lon": 3.647485453003438, "lat": 51.50176340371749}, "destination": {"id": 19700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 512.42, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 198, "lon": 4.124332339357934, "lat": 51.74718708523173}, "destination": {"id": 19800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.98, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 199, "lon": 4.248861318450683, "lat": 51.92519949938577}, "destination": {"id": 19900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 48.48, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 200, "lon": 4.300847817836634, "lat": 52.0683145761507}, "destination": {"id": 20000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 317.37, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 201, "lon": 4.325247590233912, "lat": 51.92466066267959}, "destination": {"id": 20100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2518.56, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 202, "lon": 4.326016420114463, "lat": 52.03617538316274}, "destination": {"id": 20200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.55, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 203, "lon": 4.327862977259868, "lat": 51.91738929206598}, "destination": {"id": 20300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 11676.32, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 204, "lon": 4.363104574700214, "lat": 51.99846070915183}, "destination": {"id": 20400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 61.88, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 205, "lon": 4.373384956027281, "lat": 52.13755271112043}, "destination": {"id": 20500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3.68, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 206, "lon": 4.413381228565627, "lat": 51.80970448545062}, "destination": {"id": 20600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.1, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 207, "lon": 4.42195520048784, "lat": 52.01753759718812}, "destination": {"id": 20700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 5275.76, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 208, "lon": 4.422307274084313, "lat": 52.09032829480052}, "destination": {"id": 20800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 545.63, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 209, "lon": 4.422781178035635, "lat": 52.1896314967364}, "destination": {"id": 20900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 28.52, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 210, "lon": 4.471155476758182, "lat": 52.26882663714529}, "destination": {"id": 21000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 97.46, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 211, "lon": 4.471213593466204, "lat": 52.18555390044142}, "destination": {"id": 21100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 71.7, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 212, "lon": 4.485117664184377, "lat": 52.15498519760065}, "destination": {"id": 21200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7817.9, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 213, "lon": 4.489775288556642, "lat": 52.06091031044282}, "destination": {"id": 21300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7.8, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 214, "lon": 4.505973129820774, "lat": 52.27146479321002}, "destination": {"id": 21400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1100.98, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 215, "lon": 4.506134579291695, "lat": 52.00402315085434}, "destination": {"id": 21500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 679.98, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 216, "lon": 4.511898057627024, "lat": 52.21400161180224}, "destination": {"id": 21600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1759.86, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 217, "lon": 4.513833787489122, "lat": 52.11480566806902}, "destination": {"id": 21700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1283.92, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 218, "lon": 4.525436838272586, "lat": 51.85106590628539}, "destination": {"id": 21800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1311.6, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 219, "lon": 4.535199582903982, "lat": 51.79503556495316}, "destination": {"id": 21900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.5, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 220, "lon": 4.541857681155163, "lat": 51.65880967661013}, "destination": {"id": 22000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 16940.82, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 221, "lon": 4.545837831280797, "lat": 52.25555551949294}, "destination": {"id": 22100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4122.35, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 222, "lon": 4.558574515260396, "lat": 51.52267913481363}, "destination": {"id": 22200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 96.22, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 223, "lon": 4.576956515244833, "lat": 52.29677486664884}, "destination": {"id": 22300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 850.78, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 224, "lon": 4.580142054298716, "lat": 51.93493218703784}, "destination": {"id": 22400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.26, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 225, "lon": 4.596107073378834, "lat": 51.86879658564256}, "destination": {"id": 22500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 479.72, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 226, "lon": 4.602104302070005, "lat": 51.91469605660366}, "destination": {"id": 22600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.3, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 227, "lon": 4.605797757011537, "lat": 51.82184253598317}, "destination": {"id": 22700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 294.02, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 228, "lon": 4.629211998666523, "lat": 52.19257983639784}, "destination": {"id": 22800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 894.16, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 229, "lon": 4.640704243020666, "lat": 52.04239663157308}, "destination": {"id": 22900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 44.84, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 230, "lon": 4.64097941467185, "lat": 52.11332282182251}, "destination": {"id": 23000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 957.35, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 231, "lon": 4.644959330627236, "lat": 51.57832800676078}, "destination": {"id": 23100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 306.46, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 232, "lon": 4.670624544912254, "lat": 52.66281626448637}, "destination": {"id": 23200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6354.92, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 233, "lon": 4.683009894501053, "lat": 52.55698330338122}, "destination": {"id": 23300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 683.82, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 234, "lon": 4.703345063466144, "lat": 51.83323703312558}, "destination": {"id": 23400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 503.82, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 235, "lon": 4.706204122404936, "lat": 52.01530168087869}, "destination": {"id": 23500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 31.76, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 236, "lon": 4.709540544151912, "lat": 51.78201830662832}, "destination": {"id": 23600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2715.789, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 237, "lon": 4.748474967147462, "lat": 52.78432488203599}, "destination": {"id": 23700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1056.02, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 238, "lon": 4.761430075250943, "lat": 51.58513304329588}, "destination": {"id": 23800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.4, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 239, "lon": 4.766097062431349, "lat": 52.0654193709487}, "destination": {"id": 23900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.14, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 240, "lon": 4.772947477971601, "lat": 51.83068677993407}, "destination": {"id": 24000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2835.96, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 241, "lon": 4.779458145193635, "lat": 52.17079081606919}, "destination": {"id": 24100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1627.16, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 242, "lon": 4.789431755760129, "lat": 52.69124000381459}, "destination": {"id": 24200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1.86, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 243, "lon": 4.803289224783932, "lat": 52.60180952266069}, "destination": {"id": 24300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6004.22, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 244, "lon": 4.805920304076335, "lat": 53.07903413853881}, "destination": {"id": 24400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 245.38, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 245, "lon": 4.844598428702875, "lat": 52.67601686335157}, "destination": {"id": 24500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 14069.695, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 246, "lon": 4.864242047899063, "lat": 52.02745796262166}, "destination": {"id": 24600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 22.65, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 247, "lon": 4.898887123558064, "lat": 52.10694088478698}, "destination": {"id": 24700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 37.08, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 248, "lon": 4.917327834076468, "lat": 52.22634381661644}, "destination": {"id": 24800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1324.33, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 249, "lon": 4.948150268813619, "lat": 52.6446917568093}, "destination": {"id": 24900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 26.48, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 250, "lon": 4.949233794653462, "lat": 52.82970438778289}, "destination": {"id": 25000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2536.38, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 251, "lon": 4.977078506431726, "lat": 51.83845942844491}, "destination": {"id": 25100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 411.36, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 252, "lon": 4.981275953248933, "lat": 52.38835384734762}, "destination": {"id": 25200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9.92, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 253, "lon": 5.012587028747504, "lat": 52.17696976174235}, "destination": {"id": 25300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6.16, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 254, "lon": 5.068529638469106, "lat": 51.57963046311951}, "destination": {"id": 25400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8.95, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 255, "lon": 5.069977699722709, "lat": 52.65601760807805}, "destination": {"id": 25500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1.96, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 256, "lon": 5.074745541761854, "lat": 52.09113829540244}, "destination": {"id": 25600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4508.335, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 257, "lon": 5.089311292524694, "lat": 51.84758658767632}, "destination": {"id": 25700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 286.0, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 258, "lon": 5.094670533025736, "lat": 52.03082202110411}, "destination": {"id": 25800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 24.38, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 259, "lon": 5.099295013512827, "lat": 52.72083944610649}, "destination": {"id": 25900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3562.78, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 260, "lon": 5.111424248432994, "lat": 51.96940836758485}, "destination": {"id": 26000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 224.46, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 261, "lon": 5.164952804096339, "lat": 52.66395566963561}, "destination": {"id": 26100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 81.84, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 262, "lon": 5.174306045006063, "lat": 52.14174148223032}, "destination": {"id": 26200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 34.28, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 263, "lon": 5.181697878400655, "lat": 52.0041018557419}, "destination": {"id": 26300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.45, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 264, "lon": 5.2551818400124, "lat": 52.10197570307093}, "destination": {"id": 26400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 66.06, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 265, "lon": 5.273361737765303, "lat": 52.71638365490615}, "destination": {"id": 26500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 64.24, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 266, "lon": 5.279674109168027, "lat": 52.24988283936158}, "destination": {"id": 26600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 27074.77, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 267, "lon": 5.296288896182794, "lat": 52.15619845634265}, "destination": {"id": 26700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 283.08, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 268, "lon": 5.325054837274503, "lat": 51.98924653511317}, "destination": {"id": 26800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 35.3, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 269, "lon": 5.326575274905196, "lat": 51.57825568557919}, "destination": {"id": 26900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 58.64, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 270, "lon": 5.351790466010224, "lat": 51.71672090175673}, "destination": {"id": 27000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 302.4, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 271, "lon": 5.357980462536765, "lat": 52.23870221981723}, "destination": {"id": 27100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2762.24, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 272, "lon": 5.384698457206035, "lat": 52.17365620111089}, "destination": {"id": 27200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 413.22, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 273, "lon": 5.38829245859376, "lat": 52.03463684291109}, "destination": {"id": 27300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3.62, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 274, "lon": 5.406878781614007, "lat": 51.88508448582916}, "destination": {"id": 27400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.24, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 275, "lon": 5.416462424594803, "lat": 52.12221993938348}, "destination": {"id": 27500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 42.76, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 276, "lon": 5.451034703049604, "lat": 52.34599055630678}, "destination": {"id": 27600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 81.27, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 277, "lon": 5.45888400722391, "lat": 51.45003100501821}, "destination": {"id": 27700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6.3, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 278, "lon": 5.56051624302366, "lat": 51.98076721540656}, "destination": {"id": 27800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.08, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 279, "lon": 5.584277515411839, "lat": 52.24324181541805}, "destination": {"id": 27900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 38.4, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 280, "lon": 5.623141102799542, "lat": 52.66626282296497}, "destination": {"id": 28000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 211.04, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 281, "lon": 5.641901995597006, "lat": 52.16828544017348}, "destination": {"id": 28100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9.84, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 282, "lon": 5.651829180085864, "lat": 51.65548690865531}, "destination": {"id": 28200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 12950.46, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 283, "lon": 5.655443902320496, "lat": 52.33934309453753}, "destination": {"id": 28300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 613.82, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 284, "lon": 5.656962653780621, "lat": 51.47614961756382}, "destination": {"id": 28400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 259.04, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 285, "lon": 5.699548394080463, "lat": 50.85292036518911}, "destination": {"id": 28500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 19.3, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 286, "lon": 5.701863282214817, "lat": 52.50247817243512}, "destination": {"id": 28600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 121.5, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 287, "lon": 5.701890255946667, "lat": 51.81673612355807}, "destination": {"id": 28700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.92, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 288, "lon": 5.728037332781155, "lat": 52.0764230491388}, "destination": {"id": 28800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 89.44, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 289, "lon": 5.767503478515616, "lat": 52.71251081177863}, "destination": {"id": 28900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 319.46, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 290, "lon": 5.786567139247583, "lat": 52.33899093017093}, "destination": {"id": 29000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4476.731, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 291, "lon": 5.826307715868444, "lat": 53.15377008001284}, "destination": {"id": 29100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1964.96, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 292, "lon": 5.828226907620992, "lat": 51.00484275259176}, "destination": {"id": 29200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 255.86, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 293, "lon": 5.836773480615486, "lat": 51.83850663485318}, "destination": {"id": 29300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2281.5, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 294, "lon": 5.851362585783989, "lat": 51.71830538744143}, "destination": {"id": 29400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.25, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 295, "lon": 5.884885860133362, "lat": 51.23946177248358}, "destination": {"id": 29500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 12.52, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 296, "lon": 5.921845020580252, "lat": 52.18988523534984}, "destination": {"id": 29600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.59, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 297, "lon": 5.931250975285516, "lat": 52.5556752998724}, "destination": {"id": 29700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1820.51, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 298, "lon": 5.937633669760289, "lat": 52.45673500652127}, "destination": {"id": 29800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 311.51, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 299, "lon": 5.969410619753102, "lat": 50.89333930523874}, "destination": {"id": 29900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.32, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 300, "lon": 6.064357264756678, "lat": 52.60242636227616}, "destination": {"id": 30000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 78.66, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 301, "lon": 6.1183656853076, "lat": 52.51870032468072}, "destination": {"id": 30100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 26.36, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 302, "lon": 6.153362200131085, "lat": 52.36681020720226}, "destination": {"id": 30200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 21.12, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 303, "lon": 6.159151436536577, "lat": 51.39100777694384}, "destination": {"id": 30300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6.48, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 304, "lon": 6.233945431628555, "lat": 52.13634276341051}, "destination": {"id": 30400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 302.02, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 305, "lon": 6.563401670147096, "lat": 53.22224340143406}, "destination": {"id": 30500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1911.1, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 306, "lon": 6.574071653174544, "lat": 52.58564249460619}, "destination": {"id": 30600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1085.19, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 307, "lon": 6.673953536020385, "lat": 53.42067328351118}, "destination": {"id": 30700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 648.8, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 308, "lon": 6.735914396962516, "lat": 52.74030922025383}, "destination": {"id": 30800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 308.9, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 309, "lon": 6.755840309642, "lat": 52.1554987892827}, "destination": {"id": 30900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2.44, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 310, "lon": 6.778222742059631, "lat": 52.25491825839312}, "destination": {"id": 31000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1.52, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 311, "lon": 6.877808366309683, "lat": 52.22081456113992}, "destination": {"id": 31100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 0.215, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 312, "lon": 6.961984552119418, "lat": 52.74972016120728}, "destination": {"id": 31200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 25.9, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 313, "lon": 7.010322201476536, "lat": 53.00217146170223}, "destination": {"id": 31300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 405.8, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}, {"origin": {"id": 314, "lon": 7.055730796451056, "lat": 53.19510627105819}, "destination": {"id": 31400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7459.021, "tag": "Imported waste", "color": "RGB(136, 46, 74)"}]

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