define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Line plot to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class LinePlot {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            let hasLegend = $("#display-legend").prop("checked");
            let groupByValue = options.groupBy ? options.groupBy[0] : {}
            let shapeConfigValue = {
                Line: {
                    strokeWidth: 2,
                    curve: "catmullRom",
                }
            };

            if (!options.groupBy) {
                shapeConfigValue.Line.stroke = "red";
            }

            new d3plus.Plot()
                .data(options.data)
                .x(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .groupBy(groupByValue)
                .shape("Line")
                .shapeConfig(shapeConfigValue)
                .tooltipConfig(options.tooltipConfig)
                .legend(hasLegend)
                .downloadPosition("left")
                .downloadButton(true)
                .select(options.el)
                .render();
        }
    }
    return LinePlot;
});