define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Bar chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class BarChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            if (options.xSort) {
                new d3plus.Plot()
                    .tooltipConfig(options.tooltipConfig)
                    .data(options.data)
                    .groupBy(options.groupBy[0])
                    .x(options.x)
                    .y("amount")
                    .baseline(0)
                    .discrete("x")
                    .xSort(options.xSort)
                    .select(options.el)
                    .legend(options.hasLegend)
                    .shape("Bar")
                    .downloadButton(true)
                    .render();
            } else {
                new d3plus.Plot()
                    .tooltipConfig(options.tooltipConfig)
                    .data(options.data)
                    .groupBy(options.groupBy[0])
                    .x(options.x)
                    .y("amount")
                    .baseline(0)
                    .discrete("x")
                    .select(options.el)
                    .legend(options.hasLegend)
                    .shape("Bar")
                    .downloadButton(true)
                    .render();
            }
        }
    }
    return BarChart;
});