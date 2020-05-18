define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Line plot to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class LinePlot extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the viz
         */
        constructor(options) {
            super();

            let _this = this;

            var options = options || {};
            var canHaveLegend = true;

            let groupByValue = options.groupBy ? options.groupBy : null;

            if(!options.groupBy){
                canHaveLegend = false;
            }


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
                .duration(0)
                .legend(options.hasLegend)
                .label(labelFunction)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
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
                    _this.addButtons({
                        canHaveLegend: canHaveLegend,
                    });
                });
        }

        // addButtons() {
        //     let _this = this;
        //     let svg = d3.select(".d3plus-viz");
        //     svg.select(".d3plus-Form.d3plus-Form-Button")
        //         .append("button")
        //         .attr("class", "d3plus-Button fullscreen-toggle")
        //         .attr("title", "View this visualizations in fullscreen mode.")
        //         .attr("type", "button")
        //         .html('<i class="fas fa-expand icon-fullscreen"></i>')

        //     svg.select(".d3plus-Form.d3plus-Form-Button")
        //         .append("button")
        //         .attr("class", "d3plus-Button export-csv")
        //         .attr("title", "Export the data of this visualization as a CSV file.")
        //         .attr("type", "button")
        //         .html('<i class="fas fa-file icon-export"></i>');

        //     svg.select(".d3plus-Form.d3plus-Form-Button")
        //         .append("button")
        //         .attr("class", "d3plus-Button toggle-legend")
        //         .attr("title", "Toggle the legend.")
        //         .attr("type", "button")
        //         .html('<i class="fas icon-toggle-legend"></i>');

        //     // Check on hover over Viz if it still contains Fullscreen button, if not, readd:
        //     svg.on("mouseover", function () {
        //         let buttonFullscreen = d3.select(".fullscreen-toggle")
        //         if (buttonFullscreen.empty()) {
        //             _this.addButtons();
        //         }
        //     })
        // }
    }
    return LinePlot;
});