define([
    'd3',
    'd3-brush',
    'visualizations/geomap.js',
], function (d3, d3brush, geomap) {
    /**
     *
     * ChoroplethMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class ChoroplethMap {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the ChoroplethMap
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            new geomap.Geomap()
                .data(options.data)
                .colorScale("amount")
                .topojson(options.geoJson)
                .tooltipConfig(options.tooltipConfig)
                // .fitFilter(function (d) {
                //     return ["02", "15", "43", "60", "66", "69", "72", "78"].indexOf(d.id) < 0;
                // })
                .colorScaleConfig({
                    // color: ["red", "orange", "yellow", "green", "blue"]
                    // color: ["green", "yellow", "red", ]
                    // scale: "jenks",
                    color: ["red", "orange", "yellow", "green", "blue"].reverse()
                })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' style='color: white'></i>",
                })
                .controlPadding(0)
                .render();
        }
    }
    return ChoroplethMap;
});