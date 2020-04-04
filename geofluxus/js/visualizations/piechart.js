define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Pie chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class PieChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            let hasLegend = $("#display-legend").prop("checked");

            new d3plus.Pie()
                .config({
                    data: options.data,
                    groupBy: options.groupBy,
                    value: function (d) {
                        return d["amount"];
                    },
                    tooltipConfig: options.tooltipConfig,
                })
                .legend(hasLegend)
                .shapeConfig({
                    labelConfig: {
                        fontFamily: "Montserrat",
                        fontMax: 100
                    }
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
    return PieChart;
});