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
        constructor(options) {
            this.options = options;
            this.exportPngIconHtml = "<i class='fas fa-camera icon-save-image' title='Export this visualization as a PNG file.'></i>"
            this.loadingHTML =
                `<div style="left: 50%; top: 50%; position: absolute; transform: translate(-50%, -50%); font-family: 'Montserrat', sans-serif;">
                  <strong>Loading Visualization</strong>
                </div>`;

            if (options.isDarkMode) {
                this.elementColor = "white"
            } else {
                this.elementColor = "black";
            }

        }

        addButtons() {
            let _this = this;
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button fullscreen-toggle")
                .attr("title", "View this visualization in fullscreen mode.")
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
                .attr("class", "d3plus-Button toggle-darkmode")
                .attr("title", "Toggle light or dark mode.")
                .attr("type", "button")
                .html('<i class="fas icon-toggle-darkmode"></i>');

            if (this.options.canHaveLegend) {
                svg.select(".d3plus-Form.d3plus-Form-Button")
                    .append("button")
                    .attr("class", "d3plus-Button toggle-legend")
                    .attr("title", "Toggle the legend on or off.")
                    .attr("type", "button")
                    .html('<i class="fas icon-toggle-legend"></i>');
            }

            if (this.options.canFlipGrouping) {
                svg.select(".d3plus-Form.d3plus-Form-Button")
                    .append("button")
                    .attr("class", "d3plus-Button flip-grouping")
                    .attr("title", "Inverts the dimensions.")
                    .attr("type", "button")
                    .html('<i class="fas icon-flip-grouping"></i>');
            }

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