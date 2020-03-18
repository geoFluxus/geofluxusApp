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


            new d3plus.Plot()
                .data(options.data)
                .groupBy(options.groupBy[0])
                .x(options.groupBy[0])
                .y("amount")
                .baseline(0)
                .discrete("x")
                .select(options.el)
                .shape("Bar")
                .render();


        }
    }
    return BarChart;
});