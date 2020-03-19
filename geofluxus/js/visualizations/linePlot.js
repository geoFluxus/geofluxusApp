define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Line plot to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class LinePlot {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            // new d3plus.LinePlot()
            //     .config({
            //         data: myData,
            //         groupBy: "fruit",
            //         x: "year",
            //         y: "price",
            //         shapeConfig: {
            //             Line: {
            //                 curve: "catmullRom"
            //             }
            //         },
            //         // tooltipConfig: {
            //         //     tbody: [
            //         //         ["Total", function (d) {
            //         //             return d[y]
            //         //         }],
            //         //         // ["Year", function (d) {
            //         //         //     return d.year
            //         //         // }]
            //         //     ]
            //         // }
            //     })
            //     .select(options.el)
            //     .render();

            // If there IS a groupBy value:
            if (options.groupBy) {
                new d3plus.Plot()
                    .config({
                        tooltipConfig: options.tooltipConfig,
                    })
                    //.tooltipConfig(options.tooltipConfig)
                    .data(options.data)
                    .groupBy(options.groupBy[0])
                    .x(options.x)
                    .y("amount")
                    .baseline(0)
                    .discrete("x")
                    .select(options.el)
                    .shape("Line")
                    .render();
            } else {
                new d3plus.Plot()
                    // .config({
                    //     tooltipConfig: options.tooltipConfig,
                    // })
                    .tooltipConfig(options.tooltipConfig)
                    .data(options.data)
                    .x(options.x)
                    .y("amount")
                    .baseline(0)
                    .discrete("x")
                    .select(options.el)
                    .shape("Line")
                    .shapeConfig({
                        Line: {
                            strokeWidth: 2,
                            curve: "catmullRom",
                            stroke: "red",
                        }
                    })
                    .render();
            }
        }
    }
    return LinePlot;
});