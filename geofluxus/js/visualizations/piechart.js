define([
    'd3',
    'd3-brush',
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (d3, d3brush, d3plusViz, d3plus) {
    /**
     *
     * Pie chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class PieChart extends d3plusViz {
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
                    text: "<i class='fas fa-camera icon-save-image' title='Export this visualizations as a PNG file.'></i>",
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons();
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
    return PieChart;
});