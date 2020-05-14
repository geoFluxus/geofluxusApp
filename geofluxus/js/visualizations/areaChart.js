define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Bar chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class AreaChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Area Chart
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            let hasLegend = $("#display-legend").prop("checked");
            let xSort = options.xSort ? options.xSort : null;

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
                .xSort(xSort)
                .xConfig(axisConfig)
                .yConfig(axisConfig)
                .select(options.el)
                .legend(hasLegend)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' title='Export this visualizations as a PNG file.' style='color: white'></i>",
                })
                .controlPadding(0)
                .render(function () {
                    _this.addExportCsvButton();
                    _this.addFullScreenToggle();
                });
        }

        addFullScreenToggle() {
            let _this = this;
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button fullscreen-toggle")
                .attr("type", "button")
                .html('<i class="fas fa-expand" title="View this visualizations in fullscreen mode." style="color: white"></i>')
                .lower();
            // Check on hover over Viz if it still contains Fullscreen button, if not, readd:
            svg.on("mouseover", function () {
                let buttonFullscreen = d3.select(".fullscreen-toggle")
                if (buttonFullscreen.empty()) {
                    _this.addExportCsvButton();
                    _this.addFullScreenToggle();
                }
            })
        }

        addExportCsvButton() {
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button export-csv")
                .attr("type", "button")
                .html('<i class="fas fa-file" title="Export the data used to render this visualizations as a CSV file." style="color: white"></i>');
        }
    }
    return AreaChart;
});