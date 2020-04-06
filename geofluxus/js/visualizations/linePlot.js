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
         * @param {string} options.el       CSS Selector of the container element of the viz
         */
        constructor(options) {
            var options = options || {};

            let hasLegend = $("#display-legend").prop("checked");
            let groupByValue = options.groupBy ? options.groupBy : null;
            let shapeConfigValue = {
                Line: {
                    strokeWidth: 2,
                    curve: "catmullRom",
                }
            };

            if (!options.groupBy) {
                shapeConfigValue.Line.stroke = "red";
            }

            let labelFunction = function (d) {
                if (options.isActorLevel) {
                    return d.actorName
                } else if (groupByValue) {
                    return d[groupByValue];
                } else {
                    return d[x]
                }
            }

            new d3plus.Plot()
                .data(options.data)
                .x(options.x)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .groupBy(groupByValue)
                .shape("Line")
                .shapeConfig(shapeConfigValue)
                .tooltipConfig(options.tooltipConfig)
                .legend(hasLegend)
                .label(labelFunction)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: "<i class='fas fa-camera' style='color: white'></i>",
                })
                .controlPadding(0)
                .select(options.el)
                .render();
        }
    }
    return LinePlot;
});