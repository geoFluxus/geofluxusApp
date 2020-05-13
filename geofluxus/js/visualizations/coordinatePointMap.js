define([
    'd3',
    'd3-brush',
    'visualizations/geomap.js',
], function (d3, d3brush, geomap) {
    /**
     *
     * CoordinatePointMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class CoordinatePointMap {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the CoordinatePointMap
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            new geomap.Geomap()
                .data(options.data)
                .groupBy("actorId")
                .colorScale("amount")
                .colorScaleConfig({
                    color: ["rgb(158, 1, 66)", "rgb(240, 112, 74)", "rgb(254, 221, 141)", "rgb(224, 243, 160)", "rgb(105, 189, 169)"].reverse(),
                    axisConfig: {
                        barConfig: {
                            stroke: "white"
                        },
                        shapeConfig: {
                            labelConfig: {
                                fontColor: "white"
                            },
                            stroke: "#979797"
                        }
                    },
                    rectConfig: {
                        stroke: "white"
                    }
                })
                .label(function (d) {
                    return d.actorName;
                })
                .point(function (d) {
                    return [d.lon, d.lat];
                })
                .pointSize(function (d) {
                    return d.amount;
                })
                .shapeConfig({
                    hoverOpacity: 0.75,
                })
                .tileUrl("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png")
                .pointSizeMin(2)
                .pointSizeMax(50)
                .tooltipConfig(options.tooltipConfig)
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
    return CoordinatePointMap;
});