define([
    'visualizations/d3plusViz',
    'visualizations/geomap.js',
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
            super();

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
                    // scale: "jenks",
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
                .tileUrl("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png")
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .duration(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: false,
                    });
                });
        }
    }
    return ChoroplethMap;
});