define([
    'visualizations/d3plusViz',
    'visualizations/d3plus/geomap.js',
], function (D3plusViz, geomap) {
    /**
     *
     * ChoroplethMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class ChoroplethMap extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the ChoroplethMap
         */
        constructor(options) {
            super(options);

            let _this = this;
            var options = options || {};

            let tileType = ""
            if (options.isDarkMode) {
                tileType = "dark_all"
            } else {
                tileType = "light_all"
            }
            this.tileUrl = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/" + tileType + "/{z}/{x}/{y}.png"

            new geomap.Geomap()
                .data(options.data)
                .colorScale("amount")
                .topojson(options.geoJson)
                .tooltipConfig(options.tooltipConfig)
                // .fitFilter(function (d) {
                //     return ["02", "15", "43", "60", "66", "69", "72", "78"].indexOf(d.id) < 0;
                // })
                .colorScaleConfig({
                    // scale: "jenks",
                    color: ["rgb(158, 1, 66)", "rgb(240, 112, 74)", "rgb(254, 221, 141)", "rgb(224, 243, 160)", "rgb(105, 189, 169)"].reverse(),
                    axisConfig: {
                        barConfig: {
                            stroke: this.elementColor
                        },
                        shapeConfig: {
                            labelConfig: {
                                fontColor: this.elementColor
                            },
                            stroke: this.elementColor
                        }
                    },
                    rectConfig: {
                        stroke: this.elementColor
                    }
                })
                .tileUrl(this.tileUrl)
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .duration(0)
                .loadingHTML(this.loadingHTML)
                .render(function () {
                    _this.addButtons();
                });
        }
    }
    return ChoroplethMap;
});