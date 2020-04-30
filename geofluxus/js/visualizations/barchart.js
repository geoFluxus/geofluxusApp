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
    class BarChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            let hasLegend = $("#display-legend").prop("checked");
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

            new d3plus.Plot()
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(groupByValue)
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
                .html('<i class="fas fa-expand" style="color: white"></i>')
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
                .html('<i class="fas fa-file" style="color: white"></i>');
        }
    }
    return BarChart;
});