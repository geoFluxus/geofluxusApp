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

            var myData = [{
                    "Group": "Store",
                    "Sub-Group": "Convenience Store",
                    "Number of Food Stores": 100,
                    year: 2018
                },
                {
                    "Group": "Store",
                    "Sub-Group": "Grocery Store",
                    "Number of Food Stores": 150,
                    year: 2018
                },
                {
                    "Group": "Store",
                    "Sub-Group": "Farmer's Market",
                    "Number of Food Stores": 50,
                    year: 2018
                },
                {
                    "Group": "Store",
                    "Sub-Group": "Supercenters",
                    "Number of Food Stores": 30,
                    year: 2018
                },
                {
                    "Group": "Restaurant",
                    "Sub-Group": "Fast-Food Restaurant",
                    "Number of Food Stores": 60,
                    year: 2018
                },
                {
                    "Group": "Restaurant",
                    "Sub-Group": "Full-Service Restaurant",
                    "Number of Food Stores": 120,
                    year: 2018
                }
            ];


            new d3plus.Pie()
                .config({
                    //data: myData,
                    //groupBy: ["Group", "Sub-Group"],
                    data: options.data,
                    groupBy: options.groupBy,
                    value: function (d) {
                        //return d["Number of Food Stores"];
                        return d["amount"];
                    },
                    tooltipConfig: options.tooltipConfig,
                })
                .legend(options.hasLegend)
                // The Pie chart will be rendered in this element:
                .select(options.el)
                .render();
        }
    }
    return PieChart;
});