define([
    'visualizations/d3plusViz',
    'visualizations/d3plus',
], function (D3plusViz, d3plus) {
    /**
     *
     * Line plot to display Flows data
     *
     * @author Evert Van Hirtum
     */
    class LinePlot extends D3plusViz {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the viz
         */
        constructor(options) {

            super(options);

            let _this = this;
            var options = options || {};
            this.canHaveLegend = options.canHaveLegend;

            let groupByValue = options.groupBy ? options.groupBy : null;

            // // Don't show legend if there is no grouping:
            // if(!options.groupBy){
            //     this.canHaveLegend = false;
            // }

            this.shapeConfigValue = {
                Line: {
                    strokeWidth: 3,
                    curve: "catmullRom",
                }
            };

            if (!options.groupBy) {
                this.shapeConfigValue.Line.stroke = "red";
            } else {
                this.shapeConfigValue.Line.stroke =
                    function (d) {
                        return d.color
                    }
            }

            this.labelConfig = function (d) {
                if (options.isActorLevel) {
                    return d.actorName
                } else if (groupByValue) {
                    return d[groupByValue];
                } else {
                    return d[options.x]
                }
            }

            this.axisConfig = {
                barConfig: {
                    stroke: this.elementColor, // Axis color
                },
                shapeConfig: {
                    stroke: this.elementColor, // Ticks on axis
                    labelConfig: {
                        fontColor: this.elementColor, // Labels on axis
                    }
                }
            }

            // sort data (for months)
            let xSort = options.x != 'monthCode' ? null :  function(a, b) {
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                var res = 0;
                [a, b].forEach(function(t, idx) {
                    var code = t.monthCode.split(" "),
                        month = months.indexOf(code[0]),
                        year = parseInt(code[1]);
                    res += (month + 12 * year) * (-1)**(idx%2);
                })

                return res;
            };

            new d3plus.Plot()
                .data(options.data)
                .x(options.x)
                .xSort(xSort)
                .y("amount")
                .baseline(0)
                .discrete("x")
                .groupBy(groupByValue)
                .shape("Line")
                .shapeConfig(this.shapeConfigValue)
                .xConfig(this.axisConfig)
                .yConfig(this.axisConfig)
                .tooltipConfig(options.tooltipConfig)
                .duration(0)
                .legend(options.hasLegend)
                .label(this.labelConfig)
                .downloadPosition("left")
                .downloadButton(true)
                .controlConfig({
                    text: this.exportPngIconHtml,
                })
                .legendConfig({
                    shapeConfig: {
                        labelConfig: {
                            fontColor: this.elementColor,
                        }
                    }
                })
                .controlPadding(0)
                .select(options.el)
                .loadingHTML(this.loadingHTML)
                .render(function () {
                    _this.addButtons();
                });
        }
    }
    return LinePlot;
});