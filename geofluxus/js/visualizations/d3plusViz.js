define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
], function (d3, d3brush, d3plus) {
    /**
     * Generic D3plus Visualization class
     * @author Evert Van Hirtum
     */
    class D3plusViz {
        /**
         */
        constructor() {
            
        }

        addButtons() {
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

            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button toggle-legend")
                .attr("title", "Toggle the legend.")
                .attr("type", "button")
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
    return D3plusViz;
});