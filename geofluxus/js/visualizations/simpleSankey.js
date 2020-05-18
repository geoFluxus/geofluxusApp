define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Pie chart to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class SimpleSankey extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the Simple Sankey
         */
        constructor(options) {
            super();

            let _this = this;
            var options = options || {};

            new d3plus.Sankey()
                .links(options.links)
                .nodes(options.nodes)
                .value(function value(d) {
                    return d.value;
                })
                .label(
                    function (d) {
                        return d.id
                    }
                )
                .nodePadding(5)
                .tooltipConfig(options.tooltipConfig)
                .duration(0)
                .color(function (d) {
                    return d["color"];
                })
                .select(options.el)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera icon-save-image' title='Export this visualizations as a PNG file.'></i>",
                })
                .controlPadding(0)
                .render(function () {
                    _this.addButtons({
                        canHaveLegend: false,
                    });
                });
        }
    }
    return SimpleSankey;
});