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

            // new d3plus.Legend()
            //     .data(options.data)
            //     .select(options.el)
            //     //.direction(options.direction)
            //     // .shapeConfig(options.shapeConfig)
            //     // .label(options.label)
            //     .shape("Rect")
            //     .shapeConfig({
            //         width: 25,
            //         height: 25,
            //         fill: function (d) {
            //             return d.color;
            //         },
            //     }, )
            //     .label(function (d) {
            //         return d.label.substring(0, 1);
            //     })
            //     .height(400)
            //     .width(400)
            //     .render();

            var data = [{
                    id: "Apple",
                    color: "orange",
                    image: "https://datausa.io/images/attrs/thing_apple.png"
                },
                {
                    id: "Fish",
                    color: "blue",
                    image: "https://datausa.io/images/attrs/thing_fish.png"
                },
                {
                    id: "Tomato",
                    color: "red",
                    image: "https://datausa.io/images/attrs/thing_tomato.png"
                }
            ];

            new d3plus.Legend()
                .data(data)
                .select(options.el)
                // .label(true)
                .shapeConfig({
                    // backgroundImage: function (d) {
                    //     return d.image;
                    // },
                    fill: function (d) {
                        return d.color;
                    },
                    height: 25,
                    width: 25
                })
                .render();

        }
    }
    return D3plusLegend;
});