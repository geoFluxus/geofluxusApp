define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * Pie chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class PieChart {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Pie Chart
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            new d3plus.Pie()
                .config({
                    //data: myData,
                    //groupBy: ["Group", "Sub-Group"],
                    data: options.data,
                    groupBy: options.groupBy,
                    value: function (d) {
                        return d["amount"].toFixed(3);
                    },
                    tooltipConfig: options.tooltipConfig,
                })
                .legend(options.hasLegend)
                // .format({
                //     "number": function(number, params) {
                //         return number.toFixed(2);
                //     }
                // })
                .shapeConfig({
                    labelConfig: {
                      fontFamily: "Montserrat" ,
                      fontMax: 100
                    }
                  })
                .downloadButton(true)
                .select(options.el)
                .render();
        }
    }
    return PieChart;
});