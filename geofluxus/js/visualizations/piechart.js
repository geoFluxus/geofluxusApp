define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Pie chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class PieChart extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            super();

            let _this = this;
            var options = options || {};

            new d3plus.Pie()
                .config({
                    data: options.data,
                    groupBy: options.groupBy,
                    value: function (d) {
                        return d["amount"];
                    },
                    tooltipConfig: options.tooltipConfig,
                })
                .duration(0)
                .legend(options.hasLegend)
                .color(function (d) {
                    return d["color"];
                })
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: "white",
                        }
                    }
                })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: true,
                    });
                });
        }
    }
    return PieChart;
});