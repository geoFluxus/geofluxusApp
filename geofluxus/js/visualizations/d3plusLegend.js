define([
    'd3',
    'd3-brush',
    'visualizations/d3plus/legend.js',
], function (d3, d3brush, legend) {
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

            if (options.isDarkMode) {
                this.elementColor = "white"
            } else {
                this.elementColor = "black";
            }

            var shapeConfig = {
                fill: options.shapeConfigFill,
                labelConfig: {
                    fontColor: this.elementColor,
                }
            };
            // shapeConfig.hoverStyle = this.renderHover();

            new legend.Legend()
                .data(options.data)
                .select(options.el)
                .direction(options.direction)
                .shapeConfig(shapeConfig)
                .label(options.label)
                .height(options.height)
                .width(options.width)
                .align(options.align)
                // .shapeConfig({
                //     width: 25,
                //     height: 25,
                //     fill: function (d) {
                //         return d.color;
                //     },
                // })
                // .label(function (d) {
                //     return d.label.substring(0, 1);
                // })
                .on("click.Legend", function (d) {
                    console.log("data for legend clicked:", d);
                })
                .on("click.Shape", function (d) {
                    console.log("data for shape clicked:", d);
                })
                .render(function () {
                    //_this.legendItemClick();

                    // let svg = d3.select(".d3plus-Legend");
                    // svg.select(".d3plus-Rect-group") // CHECK SHAPE
                    //     .selectAll(".d3plus-HitArea")
                    //     .each(function (d, i) {

                    //     })
                });

        }

        legendItemClick() {
            console.log("Clicked")
        }


        renderHover() {
            const that = this;

            this._group.selectAll(`g.d3plus-${this._name}-shape, g.d3plus-${this._name}-image, g.d3plus-${this._name}-text, g.d3plus-${this._name}-hover`)
                .selectAll(".d3plus-Shape, .d3plus-Image, .d3plus-textBox")
                .each(function (d, i) {

                    if (!d) d = {};
                    if (!d.parentNode) d.parentNode = this.parentNode;
                    const parent = d.parentNode;

                    if (select(this).classed("d3plus-textBox")) d = d.data;
                    if (d.__d3plusShape__ || d.__d3plus__) {
                        while (d && (d.__d3plusShape__ || d.__d3plus__)) {
                            i = d.i;
                            d = d.data;
                        }
                    } else i = that._data.indexOf(d);

                    const group = !that._hover || typeof that._hover !== "function" || !that._hover(d, i) ? parent : that._hoverGroup.node();
                    if (group !== this.parentNode) group.appendChild(this);
                    if (this.className.baseVal.includes("d3plus-Shape")) {
                        if (parent === group) select(this).call(that._applyStyle.bind(that));
                        else select(this).call(that._updateStyle.bind(that, select(this), that._hoverStyle));
                    }

                });

            this._group.selectAll(`g.d3plus-${this._name}-shape, g.d3plus-${this._name}-image, g.d3plus-${this._name}-text`)
                .attr("opacity", this._hover ? this._hoverOpacity : this._active ? this._activeOpacity : 1);
        }


    }
    return D3plusLegend;
});