define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
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

            new d3plus.Geomap()
                .data(options.data)
                .colorScale("amount")
                .topojson(options.topoJsonURL)
                .tooltipConfig(options.tooltipConfig)
                // .fitFilter(function (d) {
                //     return ["02", "15", "43", "60", "66", "69", "72", "78"].indexOf(d.id) < 0;
                // })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .render();
        }
    }
    return ChoroplethMap;
});