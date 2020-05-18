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
    class BarChart extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            super();

            let _this = this;
            var options = options || {};

            let xSort = options.xSort ? options.xSort : null;
            let groupByValue = options.groupBy ? options.groupBy : null;

            let labelFunction = function (d) {
                if (options.isActorLevel) {
                    return d.actorName
                } else if (groupByValue) {
                    return d[groupByValue];
                } else {
                    return d[options.x]
                }
            }

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

            new d3plus.Plot()
                // .title(options.tooltipConfig.title)
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(groupByValue)
                .x(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .xSort(xSort)
                .color(function (d) {
                    return d["color"];
                })
                .select(options.el)
                .label(labelFunction)
                .duration(0)
                .legend(options.hasLegend)
                .xConfig(axisConfig)
                .yConfig(axisConfig)
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: "white",
                        }
                    }
                })
                .shape("Bar")
                .stacked(options.isStacked)
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
    return BarChart;
});