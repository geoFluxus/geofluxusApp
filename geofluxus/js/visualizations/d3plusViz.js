define([
    'd3',
], function (d3) {
    /**
     * Generic D3plus Visualization class
     * @author Evert Van Hirtum
     */
    class D3plusViz {
        /**
         */
        constructor() {

        }

        addButtons({canHaveLegend}) {
            var options = {
                canHaveLegend: canHaveLegend,
              }

            let _this = this;
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button fullscreen-toggle")
                .attr("title", "View this visualizations in fullscreen mode.")
                .attr("type", "button")
                .html('<i class="fas fa-expand icon-fullscreen"></i>')

            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button export-csv")
                .attr("title", "Export the data of this visualization as a CSV file.")
                .attr("type", "button")
                .html('<i class="fas fa-file icon-export"></i>');

            if (options.canHaveLegend) {
                svg.select(".d3plus-Form.d3plus-Form-Button")
                    .append("button")
                    .attr("class", "d3plus-Button toggle-legend")
                    .attr("title", "Toggle the legend.")
                    .attr("type", "button")
                    .html('<i class="fas icon-toggle-legend"></i>');
            }

            // Check on hover over Viz if it still contains Fullscreen button, if not, readd:
            svg.on("mouseover", function () {
                let buttonFullscreen = d3.select(".fullscreen-toggle")
                if (buttonFullscreen.empty()) {
                    _this.addButtons(options);
                }
            })
        }
    }
    return D3plusViz;
});