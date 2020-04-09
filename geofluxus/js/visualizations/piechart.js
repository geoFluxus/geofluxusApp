define([
    'd3',
    'd3-brush',
    'visualizations/d3plus',
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
            let _this = this;
            var options = options || {};

            let hasLegend = $("#display-legend").prop("checked");

            new d3plus.Pie()
                .config({
                    data: options.data,
                    groupBy: options.groupBy,
                    value: function (d) {
                        return d["amount"];
                    },
                    tooltipConfig: options.tooltipConfig,
                })
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
                .controlPadding(0)
                .render(function () {
                    _this.addDownloadButton();
                    _this.addFullScreenToggle();
                });
        }

        addFullScreenToggle() {
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button fullscreen-toggle")
                .attr("type", "button")
                .html('<i class="fas fa-expand" style="color: white"></i>')
                .lower();
        }

        addDownloadButton() {
            let svg = d3.select(".d3plus-viz");
            svg.select(".d3plus-Form.d3plus-Form-Button")
                .append("button")
                .attr("class", "d3plus-Button export-csv")
                .attr("type", "button")
                .html('<i class="fas fa-file" style="color: white"></i>');
        }
    }
    return PieChart;
});