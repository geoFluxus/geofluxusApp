define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Bar chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class BarChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            var myData = [{
                    id: "alpha",
                    x: 4,
                    y: 7
                },
                {
                    id: "alpha",
                    x: 5,
                    y: 25
                },
                {
                    id: "alpha",
                    x: 6,
                    y: 13
                },
                {
                    id: "beta",
                    x: 4,
                    y: 17
                },
                {
                    id: "beta",
                    x: 5,
                    y: 8
                },
                {
                    id: "beta",
                    x: 6,
                    y: 13
                }
            ];


            new d3plus.BarChart()
                .config({
                    data: options.data,
                    //groupBy: ["Group", "Sub-Group"],
                    // value: function (d) {
                    //     return d[y];
                    // },
                    x: options.groupBy[0],
                    y: "amount",
                    // tooltipConfig: {
                    //     tbody: [
                    //         ["Total", function (d) {
                    //             return d[y]
                    //         }],
                    //         // ["Year", function (d) {
                    //         //     return d.year
                    //         // }]
                    //     ]
                    // }
                })
                // The Pie chart will be rendered in this element:
                .select(options.el)
                .render();



        }


        templateFunction() {

        }
    }
    return BarChart;
});