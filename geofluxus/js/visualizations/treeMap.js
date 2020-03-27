define([
    'd3',
    'd3-brush',
    'd3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * TreeMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class TreeMap {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the TreeMap
         */
        constructor(options) {
            var options = options || {};
            var _this = this;

            let hasLegend = $("#display-legend").prop("checked");

            new d3plus.Treemap()
                .config({
                    //data: options.data,
                    //groupBy: options.groupBy,
                    // value: function (d) {
                    //     return d["amount"].toFixed(3);
                    // },
                })
                //tile: d3.treemapDice
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(options.groupBy)
                .sum("amount")
                .legend(hasLegend)
                .shapeConfig({
                    labelConfig: {
                        fontFamily: "Montserrat",
                        fontMax: 100
                    }
                })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' style='color: white'></i>",
                })
                .render();
        }
    }
    return TreeMap;
});