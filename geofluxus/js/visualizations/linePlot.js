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

            var myData = [{
                    fruit: "apple",
                    price: 5,
                    year: 2014
                },
                {
                    fruit: "banana",
                    price: 4,
                    year: 2014
                },
                {
                    fruit: "apple",
                    price: 7,
                    year: 2015
                },
                {
                    fruit: "banana",
                    price: 6,
                    year: 2015
                },
                {
                    fruit: "apple",
                    price: 10,
                    year: 2016
                },
                {
                    fruit: "banana",
                    price: 8,
                    year: 2016
                },
                {
                    fruit: "apple",
                    price: 6,
                    year: 2017
                },
                {
                    fruit: "banana",
                    price: 10,
                    year: 2017
                },
                {
                    fruit: "apple",
                    price: 8,
                    year: 2018
                },
                {
                    fruit: "banana",
                    price: 15,
                    year: 2018
                }
            ];

            new d3plus.LinePlot()
                .config({
                    data: myData,
                    groupBy: "fruit",
                    x: "year",
                    y: "price",
                    shapeConfig: {
                        Line: {
                            curve: "catmullRom"
                        }
                    },
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
                .select(options.el)
                .render();
        }


        templateFunction() {

        }
    }
    return LinePlot;
});