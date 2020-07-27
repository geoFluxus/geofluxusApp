const {
    style
} = require("d3");

define([
    'd3',
    'd3-sankey-circular',
    'utils/utils',
    'visualizations/d3plus'
], function (d3, SankeyCircular, utils, d3plus) {
    /**
     *
     * D3plus legend
     *
     * @author Evert Van Hirtum
     */
    class D3SankeyCircular {
        /**
         * @param {Object} options          object containing all option values
         * @param {string} options.el       CSS Selector of the container element of the D3SankeyCircular
         */
        constructor(options) {
            let _this = this;
            var options = options || {};
            this.options = options;


            if (options.isDarkMode) {
                this.elementColor = "white";
                this.linkColor = "#e6e6e6"
            } else {
                this.elementColor = "black";
                this.linkColor = "#737373";
            }

            var margin = {
                top: 30,
                right: 40,
                bottom: 40,
                left: 50
            };

            var sankey = SankeyCircular.sankeyCircular()
                .nodeWidth(10)
                .nodePadding(20) //note that this will be overridden by nodePaddingRatio
                // .nodePaddingRatio(0.5)
                .size([options.width, options.height])
                .nodeId(function (d) {
                    return d.name;
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

            // let depthExtent = d3.extent(sankeyNodes, function (d) {
            //     return d.depth;
            // });

            var nodeColour = d3.scaleSequential(d3.interpolateSpectral).domain([0, options.width]);

            var node = nodeG.data(sankeyNodes)
                .enter()
                .append("g");

            node.append("rect")
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
                    return nodeColour(d.x0);
                })
                .style("opacity", 0.9)
                .on("mouseover", function (d) {
                    let thisName = d.name;

                    node.selectAll("rect")
                        .style("opacity", function (d) {
                            return highlightNodes(d, thisName)
                        })

                    d3.selectAll(".sankey-link")
                        .style("opacity", function (l) {
                            return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
                        })

                    node.selectAll("text")
                        .style("opacity", function (d) {
                            return highlightNodes(d, thisName)
                        })
                })
                .on("mouseout", function (d) {
                    d3.selectAll("rect").style("opacity", 0.5);
                    d3.selectAll(".sankey-link").style("opacity", 0.9);
                    d3.selectAll("text").style("opacity", 1);
                })

            // Add labels above nodes:
            node.append("text")
                .attr("x", function (d) {
                    return (d.x0 + d.x1) / 2;
                })
                .attr("y", function (d) {
                    return d.y0 - 12;
                })
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("fill", this.elementColor)
                .text(function (d) {
                    return utils.textEllipsis(d.name, 14);
                });

            node.append("title")
                .text(function (d) {
                    return d.name + "\n" + (d3plus.formatAbbreviate(d.value, utils.returnD3plusFormatLocale()) + " t");
                });

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
                .style("opacity", 0.9)
                .style("stroke", this.linkColor
                    // function (link, i) {
                    //     return this.linkColor //link.circular ? "red" : "black"
                    // }
                )

            link.append("title")
                .text(function (d) {
                    return d.source.name + " → " + d.target.name + "\n Index: " + (d.index);
                });


            function highlightNodes(node, name) {
                let opacity = 0.3

                if (node.name == name) {
                    opacity = 1;
                }
                node.sourceLinks.forEach(function (link) {
                    if (link.target.name == name) {
                        opacity = 1;
                    };
                })
                node.targetLinks.forEach(function (link) {
                    if (link.source.name == name) {
                        opacity = 1;
                    };
                })
                return opacity;
            }


        }

        close() {
            $(this.options.el).html(""); //empty the DOM element
        }
    }
    return D3SankeyCircular;
});