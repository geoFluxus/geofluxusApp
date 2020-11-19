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
                    this.flows = [{"origin": {"id": 1, "lon": -0.215913, "lat": 53.614012}, "destination": {"id": 100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4950, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 2, "lon": -1.212926, "lat": 54.691745}, "destination": {"id": 200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3666, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 3, "lon": -1.234956, "lat": 54.574227}, "destination": {"id": 300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 31320, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 4, "lon": -1.7830973, "lat": 4.9015794}, "destination": {"id": 400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 40999, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 5, "lon": -118.2922461, "lat": 33.7360619}, "destination": {"id": 500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6006, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 6, "lon": -13.1990758, "lat": 27.1500384}, "destination": {"id": 600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3266, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 7, "lon": -2.342378, "lat": 49.4466698}, "destination": {"id": 700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9109, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 8, "lon": -46.3367247, "lat": -23.9475247}, "destination": {"id": 800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 563943, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 9, "lon": -48.4901785, "lat": -1.4557292}, "destination": {"id": 900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 117, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 10, "lon": -48.5226223, "lat": -25.5148758}, "destination": {"id": 1000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 483541, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 11, "lon": -5.3417241, "lat": 36.1440934}, "destination": {"id": 1100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 33000, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 12, "lon": -54.7009228, "lat": -2.4506291}, "destination": {"id": 1200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 51187, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 13, "lon": -58.4002165, "lat": -33.877469}, "destination": {"id": 1300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 27499, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 14, "lon": -58.6776801, "lat": -27.050733}, "destination": {"id": 1400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 58128, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 15, "lon": -58.9592643, "lat": -34.1633346}, "destination": {"id": 1500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 720, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 16, "lon": -6.2603097, "lat": 53.3498053}, "destination": {"id": 1600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 30155, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 17, "lon": -6.2885962, "lat": 36.5270612}, "destination": {"id": 1700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 33000, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 18, "lon": -60.6930416, "lat": -32.9587022}, "destination": {"id": 1800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 141764, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 19, "lon": -60.7341297, "lat": -32.7477485}, "destination": {"id": 1900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 139856, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 20, "lon": -7.1144039, "lat": 43.5122469}, "destination": {"id": 2000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 36832, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 21, "lon": -7.5898434, "lat": 33.5731104}, "destination": {"id": 2100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1004, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 22, "lon": -8.7020824, "lat": 42.3914848}, "destination": {"id": 2200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8526, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 23, "lon": -80.0533746, "lat": 26.7153424}, "destination": {"id": 2300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 26412, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 24, "lon": -82.4571776, "lat": 27.950575}, "destination": {"id": 2400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 11043, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 25, "lon": -87.9064736, "lat": 43.0389025}, "destination": {"id": 2500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 19236, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 26, "lon": -89.8270894, "lat": 13.5957}, "destination": {"id": 2600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 5850, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 27, "lon": -90.8865834, "lat": 13.9824116}, "destination": {"id": 2700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4601, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 28, "lon": 0.174675, "lat": 51.480818}, "destination": {"id": 2800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 5313, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 29, "lon": 0.360498, "lat": 51.463024}, "destination": {"id": 2900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 129, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 30, "lon": 0.4022963, "lat": 52.7516798}, "destination": {"id": 3000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3133, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 31, "lon": 1.14822, "lat": 52.056736}, "destination": {"id": 3100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4041, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 32, "lon": 1.728047, "lat": 52.598233}, "destination": {"id": 3200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8949, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 33, "lon": 101.4001855, "lat": 1.6666349}, "destination": {"id": 3300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 161784, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 34, "lon": 103.9029689, "lat": 1.470288}, "destination": {"id": 3400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8049, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 35, "lon": 105.3218997, "lat": -5.4641159}, "destination": {"id": 3500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 104855, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 36, "lon": 11.1072277, "lat": 63.9855574}, "destination": {"id": 3600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 57889, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 37, "lon": 11.1094028, "lat": 59.2840729}, "destination": {"id": 3700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9609, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 38, "lon": 11.1493901, "lat": 55.325763}, "destination": {"id": 3800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4000, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 39, "lon": 118.3307461, "lat": 5.024206}, "destination": {"id": 3900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 24878, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 40, "lon": 12.4888013, "lat": 56.9027333}, "destination": {"id": 4000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 23114, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 41, "lon": 13.115507, "lat": 59.3323939}, "destination": {"id": 4100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6712, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 42, "lon": 13.1574232, "lat": 55.3762427}, "destination": {"id": 4200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 18067, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 43, "lon": 18.5305409, "lat": 54.5188898}, "destination": {"id": 4300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2484, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 44, "lon": 18.6466384, "lat": 54.3520252}, "destination": {"id": 4400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3000, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 45, "lon": 2.1734035, "lat": 41.3850639}, "destination": {"id": 4500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 35816, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 46, "lon": 21.010806, "lat": 56.5046678}, "destination": {"id": 4600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 42394, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 47, "lon": 21.5647066, "lat": 57.3937216}, "destination": {"id": 4700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 40286, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 48, "lon": 21.7974179, "lat": 61.4851393}, "destination": {"id": 4800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 3014, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 49, "lon": 22.0250874, "lat": 60.4660876}, "destination": {"id": 4900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1689, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 50, "lon": 22.5048851, "lat": 58.2160388}, "destination": {"id": 5000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 10531, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 51, "lon": 22.5881839, "lat": 57.7424439}, "destination": {"id": 5100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 6957, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 52, "lon": 23.5417491, "lat": 58.5810002}, "destination": {"id": 5200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 54350, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 53, "lon": 24.1051865, "lat": 56.9496487}, "destination": {"id": 5300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 27746, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 54, "lon": 24.4952894, "lat": 58.3916898}, "destination": {"id": 5400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 25241, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 55, "lon": 24.7490704, "lat": 59.4477431}, "destination": {"id": 5500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 9250, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 56, "lon": 24.7535747, "lat": 59.4369608}, "destination": {"id": 5600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2268, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 57, "lon": 24.9383791, "lat": 60.1698557}, "destination": {"id": 5700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 2257, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 58, "lon": 26.2278098, "lat": 60.4578742}, "destination": {"id": 5800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4676, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 59, "lon": 27.9147333, "lat": 43.2140504}, "destination": {"id": 5900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 146226, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 60, "lon": 28.6348138, "lat": 44.1598013}, "destination": {"id": 6000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 175642, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 61, "lon": 3.057256, "lat": 50.62925}, "destination": {"id": 6100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 4720, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 62, "lon": 30.6480855, "lat": 46.2952236}, "destination": {"id": 6200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 391549, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 63, "lon": 30.7233095, "lat": 46.482526}, "destination": {"id": 6300000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 135347, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 64, "lon": 31.1000648, "lat": 46.6240213}, "destination": {"id": 6400000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 27516, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 65, "lon": 31.9945829, "lat": 46.975033}, "destination": {"id": 6500000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 184733, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 66, "lon": 34.655314, "lat": 31.804381}, "destination": {"id": 6600000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 259579, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 67, "lon": 4.325247590233912, "lat": 51.92466066267959}, "destination": {"id": 6700000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 7750, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 68, "lon": 4.981275953248933, "lat": 52.38835384734762}, "destination": {"id": 6800000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 8891, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 69, "lon": 6.673953536020385, "lat": 53.42067328351118}, "destination": {"id": 6900000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1912, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 70, "lon": 70.1872551, "lat": 23.008141}, "destination": {"id": 7000000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 15507, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 71, "lon": 8.4775444, "lat": 53.327237}, "destination": {"id": 7100000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 1950, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 72, "lon": 98.694221, "lat": 3.784303}, "destination": {"id": 7200000, "lon": 4.8271367, "lat": 52.4183462}, "amount": 136249, "tag": "Imported material", "color": "RGB(115, 175, 86)"}, {"origin": {"id": 73, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7300000, "lon": -0.1277583, "lat": 51.5073509}, "amount": 2276, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 74, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7400000, "lon": -0.215913, "lat": 53.614012}, "amount": 16921, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 75, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7500000, "lon": -0.3274198, "lat": 53.7676236}, "amount": 31398, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 76, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7600000, "lon": -0.3630507, "lat": 53.6984122}, "amount": 17733, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 77, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7700000, "lon": -0.8509374, "lat": 53.7336631}, "amount": 2025, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 78, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7800000, "lon": -0.876381, "lat": 53.702941}, "amount": 2115, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 79, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 7900000, "lon": -0.961697, "lat": 45.936698}, "amount": 15809, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 80, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8000000, "lon": -1.4043509, "lat": 50.9097004}, "amount": 4956, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 81, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8100000, "lon": -1.474841, "lat": 43.492949}, "amount": 4212, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 82, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8200000, "lon": -17.4676861, "lat": 14.716677}, "amount": 5500, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 83, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8300000, "lon": -18.0906859, "lat": 65.6825509}, "amount": 3524, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 84, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8400000, "lon": -2.025674, "lat": 48.649337}, "amount": 3705, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 85, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8500000, "lon": -2.150431, "lat": 47.327052}, "amount": 2500, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 86, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8600000, "lon": -2.466115, "lat": 56.706922}, "amount": 2351, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 87, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8700000, "lon": -2.4674595, "lat": 51.7236003}, "amount": 8976, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 88, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8800000, "lon": -2.7211087, "lat": 51.4742156}, "amount": 10152, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 89, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 8900000, "lon": -2.897404, "lat": 53.279812}, "amount": 21232, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 90, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9000000, "lon": -2.9349852, "lat": 43.2630126}, "amount": 1582, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 91, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9100000, "lon": -2.9915726, "lat": 53.4083714}, "amount": 3000, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 92, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9200000, "lon": -2.997664, "lat": 51.584151}, "amount": 2290, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 93, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9300000, "lon": -21.7758052, "lat": 64.3603796}, "amount": 2079, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 94, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9400000, "lon": -21.9426354, "lat": 64.146582}, "amount": 3584, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 95, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9500000, "lon": -25.6686725, "lat": 37.7394207}, "amount": 6593, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 96, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9600000, "lon": -3.389471, "lat": 54.868394}, "amount": 1500, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 97, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9700000, "lon": -3.423064, "lat": 56.03647}, "amount": 3000, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 98, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9800000, "lon": -3.496688, "lat": 50.547033}, "amount": 30719, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 99, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 9900000, "lon": -3.7227698, "lat": 56.0097152}, "amount": 4001, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 100, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10000000, "lon": -4.1426565, "lat": 50.3754565}, "amount": 7104, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 101, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10100000, "lon": -4.486076, "lat": 48.390394}, "amount": 1322, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 102, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10200000, "lon": -4.629179, "lat": 55.458564}, "amount": 5549, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 103, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10300000, "lon": -4.908637, "lat": 51.674043}, "amount": 6400, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 104, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10400000, "lon": -46.3367247, "lat": -23.9475247}, "amount": 32245, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 105, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10500000, "lon": -48.5226223, "lat": -25.5148758}, "amount": 9955, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 106, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10600000, "lon": -5.93012, "lat": 54.597285}, "amount": 17008, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 107, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10700000, "lon": -6.2603097, "lat": 53.3498053}, "amount": 5247, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 108, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10800000, "lon": -6.3560985, "lat": 53.717856}, "amount": 24166, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 109, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 10900000, "lon": -7.1100702, "lat": 52.2593197}, "amount": 9881, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 110, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11000000, "lon": -8.4115401, "lat": 43.3623436}, "amount": 1792, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 111, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11100000, "lon": -8.4756035, "lat": 51.8985143}, "amount": 5066, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 112, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11200000, "lon": -8.6267343, "lat": 52.6638367}, "amount": 3010, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 113, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11300000, "lon": -9.1051123, "lat": 52.6105253}, "amount": 5257, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 114, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11400000, "lon": 0.174675, "lat": 51.480818}, "amount": 503, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 115, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11500000, "lon": 0.18895, "lat": 52.769383}, "amount": 31080, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 116, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11600000, "lon": 0.360498, "lat": 51.463024}, "amount": 3261, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 117, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11700000, "lon": 0.4022963, "lat": 52.7516798}, "amount": 5934, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 118, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11800000, "lon": 0.863398, "lat": 51.117936}, "amount": 2245, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 119, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 11900000, "lon": 1.099971, "lat": 49.443232}, "amount": 36311, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 120, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12000000, "lon": 1.14822, "lat": 52.056736}, "amount": 15682, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 121, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12100000, "lon": 1.351255, "lat": 51.961726}, "amount": 3150, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 122, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12200000, "lon": 1.728047, "lat": 52.598233}, "amount": 4322, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 123, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12300000, "lon": 10.203921, "lat": 56.162939}, "amount": 25531, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 124, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12400000, "lon": 10.6865593, "lat": 53.8654673}, "amount": 10516, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 125, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12500000, "lon": 10.894919, "lat": 56.411808}, "amount": 1049, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 126, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12600000, "lon": 11.143724, "lat": 54.833406}, "amount": 2001, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 127, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12700000, "lon": 11.1868822, "lat": 63.7011075}, "amount": 8905, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 128, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12800000, "lon": 11.909363, "lat": 55.008925}, "amount": 2950, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 129, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 12900000, "lon": 11.97456, "lat": 57.70887}, "amount": 1617, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 130, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13000000, "lon": 12.0991466, "lat": 54.0924406}, "amount": 7820, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 131, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13100000, "lon": 12.2858206, "lat": 58.2834894}, "amount": 2347, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 132, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13200000, "lon": 12.4888013, "lat": 56.9027333}, "amount": 4498, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 133, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13300000, "lon": 13.1570768, "lat": 58.5035047}, "amount": 1500, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 134, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13400000, "lon": 13.4378399, "lat": 58.6322458}, "amount": 1320, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 135, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13500000, "lon": 14.2979949, "lat": 55.9250391}, "amount": 7928, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 136, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13600000, "lon": 14.5528116, "lat": 53.4285438}, "amount": 13368, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 137, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13700000, "lon": 15.5832667, "lat": 54.1759173}, "amount": 2526, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 138, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13800000, "lon": 16.3567791, "lat": 56.6634447}, "amount": 3221, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 139, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 13900000, "lon": 16.4473984, "lat": 57.2656993}, "amount": 2023, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 140, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14000000, "lon": 16.5448092, "lat": 59.6099005}, "amount": 3601, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 141, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14100000, "lon": 17.0749546, "lat": 58.6754851}, "amount": 4401, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 142, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14200000, "lon": 18.5305409, "lat": 54.5188898}, "amount": 3010, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 143, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14300000, "lon": 18.6466384, "lat": 54.3520252}, "amount": 3881, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 144, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14400000, "lon": 2.1734035, "lat": 41.3850639}, "amount": 4965, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 145, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14500000, "lon": 21.402722, "lat": 60.807601}, "amount": 4754, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 146, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14600000, "lon": 24.1051865, "lat": 56.9496487}, "amount": 3097, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 147, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14700000, "lon": 24.7535747, "lat": 59.4369608}, "amount": 13414, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 148, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14800000, "lon": 27.748088, "lat": 59.3995308}, "amount": 18154, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 149, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 14900000, "lon": 3.3792057, "lat": 6.5243793}, "amount": 17569, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 150, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15000000, "lon": 4.325247590233912, "lat": 51.92466066267959}, "amount": 2983, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 151, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15100000, "lon": 4.981275953248933, "lat": 52.38835384734762}, "amount": 8513, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 152, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15200000, "lon": 5.0314409, "lat": 61.5994886}, "amount": 3622, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 153, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15300000, "lon": 5.7331074, "lat": 58.9699756}, "amount": 1923, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 154, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15400000, "lon": 9.0600628, "lat": 54.4837642}, "amount": 5665, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 155, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15500000, "lon": 9.4730519, "lat": 55.495973}, "amount": 2628, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 156, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15600000, "lon": 9.6606992, "lat": 54.3080869}, "amount": 220450, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 157, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15700000, "lon": 9.8475881, "lat": 55.8581302}, "amount": 10003, "tag": "Exported material", "color": "RGB(255, 242, 0)"}, {"origin": {"id": 158, "lon": 4.8271367, "lat": 52.4183462}, "destination": {"id": 15800000, "lon": 9.9936819, "lat": 53.5510846}, "amount": 3264, "tag": "Exported material", "color": "RGB(255, 242, 0)"}]

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