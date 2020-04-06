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

            let hasLegend = $("#display-legend").prop("checked");
            let xSort = options.xSort ? options.xSort : null;
            let groupByValue = options.groupBy ? options.groupBy : null;

            let labelFunction = function (d) {
                if (options.isActorLevel) {
                    return d.actorName
                } else if (groupByValue) {
                    return d[groupByValue];
                } else {
                    return d[x]
                }
            }

            new d3plus.Plot()
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(groupByValue[0])
                .x(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .xSort(xSort)
                .select(options.el)
                .label(labelFunction)
                .legend(hasLegend)
                .shape("Bar")
                .stacked(options.isStacked)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' style='color: white'></i>",
                })
                .controlPadding(0)
                .render();
        }
    }
    return BarChart;
});