const {
    style
} = require("d3");

define([
    'underscore',
    'd3',
    'd3-sankey-circular',
    'utils/utils',
    'visualizations/d3plus',
    'utils/enrichFlows',
], function (_, d3, SankeyCircular, utils, d3plus, enrichFlows) {
    /**
     *
     * D3plus legend
     *
     * @author Tom Shanley, Evert Van Hirtum
     */
    class D3SankeyCircular {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the D3SankeyCircular
         */
        constructor(options) {
            let _this = this;
            this.options = options;
            this.label = options.label;

            this.showNodeLabels = this.options.showNodeLabels;
            this.showArrows = this.options.showArrows;

            this.islinkColorSource;
            this.islinkColorDestination;

            this.linkColourOptions = options.linkColourOptions;
            this.arrowOptions = options.arrowOptions;

            if (options.isDarkMode) {
                this.elementColor = "white";
                this.linkColor = "#e6e6e6";
                this.linkHighlightColor = "#f5f5f5";
            } else {
                this.elementColor = "black";
                this.linkColor = "#737373";
                this.linkHighlightColor = "#a6a6a6";
            }

            // Tooltip
            this.tooltip = d3.select("body")
                .append("div")
                .attr("class", "customTooltipContainer")
                .style("opacity", 0);

            this.defaultNodeOpacity = 0.8;
            this.defaultLinkOpacity = 0.8;
            this.hiddenOpacity = 0.3;

            var margin = {
                top: 30,
                right: 50,
                bottom: 40,
                left: 50
            };

            var sankey = SankeyCircular.sankeyCircular()
                .nodeWidth(10)
                .nodePadding(20) //note that this will be overridden by nodePaddingRatio
                // .nodePaddingRatio(0.5)
                .size([options.width, options.height])
                .nodeId(function (d) {
                    return d.dimensionValue;
                })
                .nodeAlign(SankeyCircular.sankeyJustify)
                .iterations(5)
                .circularLinkGap(1)

            var svg = d3.select(options.el).append("svg")
                .style("margin", "auto")
                .style("overflow", "visible")
                .attr("width", options.width + margin.left + margin.right)
                .attr("height", options.height + margin.top + margin.bottom);

            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            var linkG = g.append("g")
                .attr("class", "links")
                .attr("fill", "none")
                .attr("stroke-opacity", 0.2)
                .selectAll("path");

            var nodeG = g.append("g")
                .attr("class", "nodes")
                .attr("font-family", "Montserrat")
                .attr("font-size", 10)
                .selectAll("g");

            // Run the Sankey + circular over the data 
            let sankeyData = sankey(options.data);
            let sankeyNodes = sankeyData.nodes;
            let sankeyLinks = sankeyData.links;

            sankeyNodes = _.sortBy(sankeyNodes, 'dimensionText').reverse();
            sankeyNodes = enrichFlows.assignColorsByProperty(sankeyNodes, "dimensionValue");

            var node = nodeG.data(sankeyNodes)
                .enter()
                .append("g");

            // Draw the nodes
            node.append("rect")
                .attr("class", "sankey-node")
                .attr("x", function (d) {
                    return d.x0;
                })
                .attr("y", function (d) {
                    return d.y0;
                })
                .attr("height", function (d) {
                    return d.y1 - d.y0;
                })
                .attr("width", function (d) {
                    return d.x1 - d.x0;
                })
                .style("fill", function (d) {
                    return d.color;
                })
                .style("opacity", _this.defaultNodeOpacity)
                .on("mouseover", function (d) {
                    _this.tooltip
                        .html(_this.getNodeTooltipString(d))
                        .transition()
                        .duration(200)
                        .style("opacity", 0.925);

                    let thisName = d.dimensionValue;

                    node.selectAll("rect")
                        .style("opacity", function (d) {
                            return highlightNodes(d, thisName)
                        })

                    d3.selectAll(".sankey-link")
                        .style("opacity", function (l) {
                            return l.source.dimensionValue == thisName || l.target.dimensionValue == thisName ? 1 : _this.hiddenOpacity;
                        })

                    node.selectAll("text")
                        .style("opacity", function (d) {
                            return highlightNodes(d, thisName)
                        })
                })
                .on("mousemove", function () {
                    _this.tooltip
                        .style('top', (d3.event.pageY - _this.tooltip.node().getBoundingClientRect().height) + 'px')
                        .style('left', (d3.event.pageX - (_this.tooltip.node().getBoundingClientRect().width / 2)) + 'px');
                })
                .on("mouseout", function (d) {
                    d3.selectAll("rect").style("opacity", _this.defaultNodeOpacity);
                    d3.selectAll(".sankey-link").style("opacity", _this.defaultLinkOpacity);
                    d3.selectAll("text").style("opacity", 1);

                    _this.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                })

            // Add labels above nodes:
            if (this.showNodeLabels) {
                node.append("text")
                    .attr("class", "node-label")
                    .attr("x", function (d) {
                        return (d.x0 + d.x1) / 2;
                    })
                    .attr("y", function (d) {
                        return d.y0 - 12;
                    })
                    .attr("id", function (d) {
                        return d.dimensionValue;
                    })
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", this.elementColor)
                    .text(function (d) {
                        return utils.textEllipsis(d.dimensionValue, 14);
                    })
                    .append("title")
                    .text(function (d) {
                        return d.dimensionValue + "\n" + (d3plus.formatAbbreviate(d.value, utils.returnD3plusFormatLocale()) + " t");
                    });;
            }

            // Draw the links:
            var link = linkG.data(sankeyLinks)
                .enter()
                .append("g")

            link.append("path")
                .attr("class", "sankey-link")
                .attr("d", function (link) {
                    return link.path;
                })
                .style("stroke-width", function (d) {
                    return Math.max(1, d.width);
                })
                .style("opacity", _this.defaultLinkOpacity)
                .style("stroke", function (link, i) {
                    if (_this.linkColourOptions.isNone) {
                        return _this.linkColor
                    } else if (_this.linkColourOptions.isSource) {
                        return link.source.color;
                    } else if (_this.linkColourOptions.isDestination) {
                        return link.target.color;
                    }
                })
                .on("mouseover", function (d, i) {
                    _this.tooltip
                        .html(_this.getLinkTooltipString(d))
                        .transition()
                        .duration(200)
                        .style("opacity", 0.925);

                    d3.selectAll(".sankey-node")
                        .style("opacity", function (node) {
                            return (node.dimensionValue == d.source.dimensionValue || node.dimensionValue == d.target.dimensionValue) ? 1 : _this.hiddenOpacity;
                        })

                    d3.selectAll(".sankey-link")
                        .style("opacity", function (link) {
                            return (d.index == link.index) ? 1 : _this.hiddenOpacity;
                        })

                    d3.selectAll(".node-label")
                        .style("opacity", function (nodeLabel) {
                            return (nodeLabel.dimensionValue == d.source.dimensionValue || nodeLabel.dimensionValue == d.target.dimensionValue) ? 1 : _this.hiddenOpacity;
                        })
                })
                .on("mousemove", function () {
                    _this.tooltip
                        .style('top', (d3.event.pageY - _this.tooltip.node().getBoundingClientRect().height) + 'px')
                        .style('left', (d3.event.pageX - (_this.tooltip.node().getBoundingClientRect().width / 2)) + 'px');
                })
                .on("mouseout", function () {
                    _this.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0)

                    d3.selectAll(".sankey-node")
                        .style("opacity", function (node) {
                            return _this.defaultNodeOpacity
                        })
                    d3.selectAll(".sankey-link")
                        .style("opacity", function (link) {
                            return _this.defaultLinkOpacity
                        })
                    d3.selectAll(".node-label")
                        .style("opacity", function (nodeLabel) {
                            return 1;
                        })
                })


            // Show arrows indicating the direction of the flows:
            if (this.arrowOptions.hasArrows) {
                var arrowsG = linkG.data(sankeyLinks)
                    .enter()
                    .append("g")
                    .attr("class", "g-arrow")
                    .call(appendArrows)
            }

            if (this.arrowOptions.hasAnimatedDash) {
                let duration = 5;
                let maxOffset = 10;
                let percentageOffset = 1;

                var arrowsG = linkG.data(sankeyLinks)
                    .enter()
                    .append("g")
                    .attr("class", "g-arrow")
                    .call(appendArrows)

                arrowsG.selectAll("path")
                    .style("stroke-width", "10")
                    .style("stroke-dasharray", "10,10")

                arrowsG.selectAll(".arrow-head").remove()

                var animateDash = setInterval(updateDash, duration);

                function updateDash() {
                    arrowsG.selectAll("path")
                        .style("stroke-dashoffset", percentageOffset * maxOffset)

                    percentageOffset = percentageOffset == 0 ? 1 : percentageOffset - 0.01

                }
            }

            function highlightNodes(node, name) {
                let opacity = 0.3;

                if (node.dimensionValue == name) {
                    opacity = 1;
                }
                node.sourceLinks.forEach(function (link) {
                    if (link.target.dimensionValue == name) {
                        opacity = 1;
                    };
                })
                node.targetLinks.forEach(function (link) {
                    if (link.source.dimensionValue == name) {
                        opacity = 1;
                    };
                })
                return opacity;
            }

            function sankeyPath(link) {
                let path = '';
                if (link.circular) {
                    path = link.circularPathData.path
                } else {
                    var normalPath = d3
                        .linkHorizontal()
                        .source(function (d) {
                            let x = d.source.x0 + (d.source.x1 - d.source.x0)
                            let y = d.y0
                            return [x, y]
                        })
                        .target(function (d) {
                            let x = d.target.x0
                            let y = d.y1
                            return [x, y]
                        })
                    path = normalPath(link)
                }
                return path
            }

            function appendArrows(linkG) {

                let arrowLength = 20;
                let gapLength = 300;
                let totalDashArrayLength = arrowLength + gapLength;

                var arrows = linkG.append("path")
                    .attr("d", sankeyPath)
                    .style("stroke-width", 1)
                    .style("stroke", _this.elementColor)
                    .style("stroke-dasharray", arrowLength + "," + gapLength)

                arrows.each(function (arrow) {

                    let thisPath = d3.select(this).node();
                    let parentG = d3.select(this.parentNode)
                    let pathLength = thisPath.getTotalLength();
                    let numberOfArrows = Math.ceil(pathLength / totalDashArrayLength);

                    //remove the last arrow head if it will overlap the target node
                    //+4 to take into account arrow head size
                    if ((((numberOfArrows - 1) * totalDashArrayLength) + (arrowLength + 5)) > pathLength) {
                        numberOfArrows = numberOfArrows - 1;
                    }

                    let arrowHeadData = d3.range(numberOfArrows).map(function (d, i) {
                        let length = (i * totalDashArrayLength) + arrowLength;

                        let point = thisPath.getPointAtLength(length);
                        let previousPoint = thisPath.getPointAtLength(length - 2);

                        let rotation = 0;

                        if (point.y == previousPoint.y) {
                            rotation = (point.x < previousPoint.x) ? 180 : 0;
                        } else if (point.x == previousPoint.x) {
                            rotation = (point.y < previousPoint.y) ? -90 : 90;
                        } else {
                            let adj = Math.abs(point.x - previousPoint.x);
                            let opp = Math.abs(point.y - previousPoint.y);
                            let angle = Math.atan(opp / adj) * (180 / Math.PI);
                            if (point.x < previousPoint.x) {
                                angle = angle + ((90 - angle) * 2)
                            }
                            if (point.y < previousPoint.y) {
                                rotation = -angle;
                            } else {
                                rotation = angle;
                            }
                        };

                        return {
                            x: point.x,
                            y: point.y,
                            rotation: rotation
                        };

                    });

                    let arrowHeads = parentG.selectAll(".arrow-heads")
                        .data(arrowHeadData)
                        .enter()
                        .append("path")
                        .attr("d", function (d) {
                            return "M" + (d.x) + "," + (d.y - 2) + " " +
                                "L" + (d.x + 4) + "," + (d.y) + " " +
                                "L" + d.x + "," + (d.y + 2);
                        })
                        .attr("class", "arrow-head")
                        .attr("transform", function (d) {
                            return "rotate(" + d.rotation + "," + d.x + "," + d.y + ")";

                        })
                        .style("fill", _this.elementColor)

                });

            }


        }

        close() {
            $(this.options.el).html(""); //empty the DOM element
        }

        getNodeTooltipString(node) {
            return `<div class="d3plus-tooltip flowMapToolTip pointToolTIp" x-placement="top">
                <div class="d3plus-tooltip-title">
                    ` + node.dimensionValue + `
                </div>
                <div class="d3plus-tooltip-body">
                </div>
                <table class="d3plus-tooltip-table">
                    <thead class="d3plus-tooltip-thead"></thead>
                    <tbody class="d3plus-tooltip-tbody style='display: block; padding-bottom: 0.5rem;'">
                        <tr>
                            <td>` + this.label + `</td>
                            <td>` + d3plus.formatAbbreviate(node.value, utils.returnD3plusFormatLocale()) + ' t' + `</td>
                        </tr>
                        <tr>
                            <td>` + node.dimensionText + `</td>
                            <td>` + node.dimensionValue + `</td>
                        </tr>
                    </tbody>
                </table>
            </div>`
        }

        getLinkTooltipString(link) {
            return `<div class="d3plus-tooltip flowMapToolTip linkToolTip" x-placement="top">
                <div class="d3plus-tooltip-title">
                    ` + link.source.dimensionValue + ' &#10132; ' + link.destination.dimensionValue + `
                </div>
                <div class="d3plus-tooltip-body">
                </div>
                <table class="d3plus-tooltip-table">
                    <thead class="d3plus-tooltip-thead"></thead>
                    <tbody class="d3plus-tooltip-tbody">
                        <tr>
                            <td>` + this.label + `</td>
                            <td>` + link.amountText + `</td>
                        </tr>
                        <tr>
                            <td>` + "Source dimension" + `</td>
                            <td>` + link.source.dimensionText + `</td>
                        </tr>
                        <tr>
                        <td>` + "Target dimension" + `</td>
                        <td>` + link.target.dimensionText + `</td>
                    </tr>
                    </tbody>
                </table>
            </div>`
        }
    }
    return D3SankeyCircular;
});