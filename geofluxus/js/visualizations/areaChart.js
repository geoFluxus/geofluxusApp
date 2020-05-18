define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Bar chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class AreaChart extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Area Chart
         */
        constructor(options) {
            super();

            let _this = this;
            var options = options || {};
            let axisConfig = {
                barConfig: {
                    stroke: "white", // Axis color
                },
                shapeConfig: {
                    stroke: "white", // Ticks on axis
                    labelConfig: {
                        fontColor: "white", // Labels on axis
                    }
                }
            }

            new d3plus.AreaPlot()
                .stacked(options.isStacked)
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(options.groupBy[0])
                .x(options.x)
                .y("amount")
                .baseline(0)
                .color(function (d) {
                    return d["color"];
                })
                .discrete("x")
                .xConfig(axisConfig)
                .yConfig(axisConfig)
                .select(options.el)
                .duration(0)
                .legend(options.hasLegend)
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: "white",
                        }
                    }
                })
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera icon-save-image' title='Export this visualizations as a PNG file.'></i>",
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: true,
                    });
                });
        }
    }
    return AreaChart;
});