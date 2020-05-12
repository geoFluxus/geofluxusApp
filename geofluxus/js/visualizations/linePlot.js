define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Line plot to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class LinePlot {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the viz
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            let hasLegend = $("#display-legend").prop("checked");
            let groupByValue = options.groupBy ? options.groupBy : null;
            let shapeConfigValue = {
                Line: {
                    strokeWidth: 3,
                    curve: "catmullRom",
                }
            };

            if (!options.groupBy) {
                shapeConfigValue.Line.stroke = "red";
            } else {
                shapeConfigValue.Line.stroke =
                    function (d) {
                        return d.color
                    }
            }

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
                .data(options.data)
                .x(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .groupBy(groupByValue)
                .shape("Line")
                .shapeConfig(shapeConfigValue)
                .xConfig(axisConfig)
                .yConfig(axisConfig)
                .tooltipConfig(options.tooltipConfig)
                .legend(hasLegend)
                .label(labelFunction)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' style='color: white'></i>",
                })
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: "white",
                        }
                    }
                })
                .controlPadding(0)
                .select(options.el)
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
    return LinePlot;
});