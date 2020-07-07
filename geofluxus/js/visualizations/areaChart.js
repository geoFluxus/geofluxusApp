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

            // sort data (for months)
            let xSort = options.x != 'monthCode' ? undefined :  function(a, b) {
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                var res = 0;
                [a, b].forEach(function(t, idx) {
                    var code = t.monthCode,
                        month = months.indexOf(code.substring(0, 3)),
                        year = parseInt(code.substring(3, 8));
                    res += (month + 12 * year) * (-1)**(idx%2);
                })

                return res;
            };

            var data = options.data;
            data.sort(function(a, b) {
                return a[options.groupBy].localeCompare(b[options.groupBy]);
            });
            //data.sort(xSort)
            console.log(data)
            new d3plus.AreaPlot()
                .stacked(options.isStacked)
                .tooltipConfig(options.tooltipConfig)
                .data(data)
                .groupBy(options.groupBy)
                .x(options.x)
                .xSort(xSort)
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