define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
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
            var options = options || {};
            var _this = this;

            // new d3plus.Geomap()
            //     .data(options.data)
            //     .colorScale("amount")
            //     .topojson(options.topoJsonURL)
            //     .tooltipConfig(options.tooltipConfig)
            //     // .fitFilter(function (d) {
            //     //     return ["02", "15", "43", "60", "66", "69", "72", "78"].indexOf(d.id) < 0;
            //     // })
            //     .colorScaleConfig({
            //         // color: ["red", "orange", "yellow", "green", "blue"]
            //         // color: ["green", "yellow", "red", ]
            //         // scale: "jenks",
            //         color: ["red", "orange", "yellow", "green", "blue"].reverse()
            //     })
            //     .select(options.el)
            //     .downloadPosition("left")
            //     .downloadButton(true)
            //     .render();


            new d3plus.Geomap()
                .config({
                    data: options.data,
                    groupBy: "actorName",
                    colorScale: "amount",
                    label: function (d) {
                        return d.actorName;
                    },
                    point: function (d) {
                        return [d.lon, d.lat];
                    },
                    pointSize: function (d) {
                        return d.amount;
                    },
                    pointSizeMin: 1,
                    pointSizeMax: 10
                })
                .render();

            // new d3plus.Geomap()
            //     .config({
            //         data: "https://d3plus.org/data/city_coords.json",
            //         groupBy: "slug",
            //         colorScale: "dma_code",
            //         label: function (d) {
            //             return d.city + ", " + d.region;
            //         },
            //         point: function (d) {
            //             return [d.longitude, d.latitude];
            //         },
            //         pointSize: function (d) {
            //             return d.dma_code;
            //         },
            //         pointSizeMin: 1,
            //         pointSizeMax: 10
            //     })
            //     .render();


        }
    }
    return CoordinatePointMap;
});