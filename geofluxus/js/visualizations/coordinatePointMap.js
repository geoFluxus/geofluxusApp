define([
    'd3',
    'd3-brush',
    'visualizations/geomap.js',
], function (d3, d3brush, geomap) {
    /**
     *
     * CoordinatePointMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class CoordinatePointMap {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the CoordinatePointMap
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            new geomap.Geomap()
                .data(options.data)
                .groupBy("actorId")
                .colorScale("amount")
                .colorScaleConfig({
                    color: ["red", "orange", "yellow", "green", "blue"].reverse()
                })
                .label(function (d) {
                    return d.actorName;
                })
                .point(function (d) {
                    return [d.lon, d.lat];
                })
                .pointSize(function (d) {
                    return d.amount;
                })
                .pointSizeMin(2)
                .pointSizeMax(50)
                .tooltipConfig(options.tooltipConfig)
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
    return CoordinatePointMap;
});