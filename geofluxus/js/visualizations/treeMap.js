define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     * TreeMap chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class TreeMap extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the TreeMap
         */
        constructor(options) {
            super();

            let _this = this;
            var options = options || {};

            new d3plus.Treemap()
                //tile: d3.treemapDice
                .tooltipConfig(options.tooltipConfig)
                .data(options.data)
                .groupBy(options.groupBy)
                .sum("amount")
                .duration(0)
                .legend(options.hasLegend)
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: "white",
                        }
                    }
                })
                .color(function (d) {
                    return d["color"];
                })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: true,
                    });
                });
        }
    }
    return TreeMap;
});