define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
], function (d3, d3brush, d3plus) {
    /**
     *
     * D3plus legend
     *
     * @author Evert Van Hirtum
     */
    class D3plusLegend {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the d3plusLegend
         */
        constructor(options) {
            let _this = this;
            var options = options || {};

            new d3plus.Legend()
                .data(options.data)
                .shapeConfig(options.shapeConfig)
                .direction(options.direction)
                .label(options.label)
                .select(options.el)
                .render();
        }
    }
    return D3plusLegend;
});