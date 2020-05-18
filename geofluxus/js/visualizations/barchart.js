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
                    text: "<i class='fas fa-camera icon-save-image' title='Export this visualizations as a PNG file.'></i>",
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons();
                });
        }

        addButtons() {
            let _this = this;
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("type", "button")
                .attr("class", "d3plus-Button fullscreen-toggle")
                .attr("title", "View this visualizations in fullscreen mode.")
                .html('<i class="fas fa-expand icon-fullscreen"></i>')

            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("type", "button")
                .attr("class", "d3plus-Button export-csv")
                .attr("title", "Export the data of this visualization as a CSV file.")
                .html('<i class="fas fa-file icon-export"></i>');

            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("type", "button")
                .attr("class", "d3plus-Button toggle-legend")
                .attr("title", "Toggle the legend.")
                .html('<i class="fas icon-toggle-legend"></i>');

            // Check on hover over Viz if it still contains Fullscreen button, if not, readd:
            svg.on("mouseover", function () {
                let buttonFullscreen = d3.select(".fullscreen-toggle")
                if (buttonFullscreen.empty()) {
                    _this.addButtons();
                }
            })
        }
    }
    return BarChart;
});