define([
    'visualizations/d3plusViz',
    'visualizations/geomap.js',
], function (D3plusViz, geomap) {
    /**
     *
     * CoordinatePointMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class CoordinatePointMap extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the CoordinatePointMap
         */
        constructor(options) {
            super();

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
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .duration(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: false
                    });
                });
        }
    }
    return CoordinatePointMap;
});