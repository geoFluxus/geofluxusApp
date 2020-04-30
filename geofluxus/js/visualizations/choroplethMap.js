define([
    'd3',
    'd3-brush',
    'visualizations/geomap.js',
], function (d3, d3brush, geomap) {
    /**
     *
     * ChoroplethMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class ChoroplethMap {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the ChoroplethMap
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            new geomap.Geomap()
                .data(options.data)
                .colorScale("amount")
                .topojson(options.geoJson)
                .tooltipConfig(options.tooltipConfig)
                // .fitFilter(function (d) {
                //     return ["02", "15", "43", "60", "66", "69", "72", "78"].indexOf(d.id) < 0;
                // })
                .colorScaleConfig({
                    // color: ["red", "orange", "yellow", "green", "blue"]
                    // color: ["green", "yellow", "red", ]
                    // scale: "jenks",
                    color: ["red", "orange", "yellow", "green", "blue"].reverse()
                })
                .select(options.el)
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
    return ChoroplethMap;
});