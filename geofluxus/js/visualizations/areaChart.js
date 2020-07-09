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
            super(options);

            let _this = this;
            var options = options || {};
            let axisConfig = {
                barConfig: {
                    stroke: this.elementColor, // Axis color
                },
                shapeConfig: {
                    stroke: this.elementColor, // Ticks on axis
                    labelConfig: {
                        fontColor: this.elementColor, // Labels on axis
                    }
                }
            }

            var data = options.data;
            if (options.x.includes('month')){
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                data.forEach(function(d) {
                    var code = d.monthCode.split(" "),
                        month = months.indexOf(code[0]),
                        year = code[1];
                    var name = (month + 1).toString();
                    d.month = year + (name.length == 1 ? "0" + name : name);
                })
                options.x = "month";
            }

            new d3plus.AreaPlot()
                .stacked(options.isStacked)
                .tooltipConfig(options.tooltipConfig)
                .data(data)
                .groupBy(options.groupBy)
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
                            fontColor: this.elementColor,
                        }
                    }
                })
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .loadingHTML(this.loadingHTML)
                .render(function () {
                    _this.addButtons();
                });
        }
    }
    return AreaChart;
});