define([
    'd3',
    'visualizations/map,
], function (d3, Map) {
    class NetworkMap {
        constructor(options) {
            let _this = this;
            var options = options || {};

            // define color scale for amounts
            this.colors = [
                'rgb(26, 152, 80)',
                'rgb(102, 189, 99)',
                'rgb(166, 217, 106)',
                'rgb(217, 239, 139)',
                'rgb(255, 255, 191)',
                'rgb(254, 224, 139)',
                'rgb(253, 174, 97)',
                'rgb(244, 109, 67)',
                'rgb(215, 48, 39)',
                'rgb(168, 0, 0)'
            ]

            // background map options
            this.map = new Map({
                el: options.el,
                source: options.source || 'dark',
                opacity: options.opacity || 1.0
            });

            this.network = options.network;
            this.flows = options.flows;

            // define legend
            this.drawLegend();

            // define color scale
            this.defineScale();

            // add network layer to map
            this.drawNetwork();
        }

        drawTooltip: function(amount) {
            var label = "";
            if (amount >= 10**3 && amount < 10**6) {
                label = "k";
            } elif (amount >= 10**6 && amount < 10**9) {
                label = "M";
            } elif (amount >= 10**9) {
                label = "B";
            }
            return `${amount.toFixed(3)} {label}t`;
        }

        drawLegend: function () {
            // add legend
            var legend = document.getElementById('legend');
            if (legend) {
                legend.parentElement.removeChild(legend);
            }
            var legend = document.createElement('div');
            legend.className = 'ol-control-panel ol-unselectable ol-control';
            legend.id = 'legend';
            var controlPanel = new ol.control.Control({
                element: legend
            });
            this.map.addControl(controlPanel);

            //  var title = document.createElement('div');
            //  title.style.margin = "5%";
            //  title.innerHTML = '<h4 style="text-align: center;">Legend</h4>'
            //  legend.appendChild(title);

            // add color scale to legend
            var width = height = 30;
            var scale = d3.select("#legend")
                          .append("center")
                          .append("svg")
                          .attr("width", width * colors.length)
                          .attr("height", 100),
                rects = scale.selectAll('rect')
                             .data(colors)
                             .enter()
                             .append("rect")
                             .attr("x", function (d, i) {
                                return i * width;
                             })
                             .attr("y", 10)
                             .attr("width", 30)
                             .attr("height", 30)
                             .attr("fill", function (d) {
                                return d;
                             }),
                texts = scale.selectAll('text')
                             .data(values)
                             .enter()
                             .append('text')
                             .text(function (d) {
                                return d >= 1000 ? `${(d/1000)}K` : `${d}`;
                             })
                             .attr("x", function (d, i) {
                                return i * width;
                             })
                             .attr('y', 2 * height)
                             .attr('fill', 'white')
                             .attr('font-size', 10);
        }

        defineScale: function () {
            // scale of equal frequency intervals
            var max = Math.max(...data),
                quantile = d3.scaleQuantile()
                             .domain(data)
                             .range(colors);

            // prettify scale intervals
            function prettify(val) {
                var int = ~~(val)
                digits = int.toString().length - 1
                base = 10 ** digits;
                return Math.round(val / base) * base;
            }

            this.values = [];
            Object.values(quantile.quantiles()).forEach(function (val) {
                _this.values.push(prettify(val));
            });
            this.values.unshift(0);
        }

        drawNetwork: function () {
            var _this = this;

            // process flows to point to amounts
            var amounts = {},
                data = [];
            this.flows.forEach(function (flow) {
                var id = flow['id'],
                    amount = flow['amount'];
                amounts[id] = amount;
                // exclude zero values from scale definition
                if (amount > 0) {
                    data.push(amount);
                }
            })

            function assignColor(amount) {
                for (i = 1; i < values.length; i++) {
                    if (amount <= values[i]) {
                        return colors[i - 1];
                    }
                }
                return _this.colors[_this.colors.length - 1];
            }

            // create network layer
            this.routingMap.addLayer('network', {
                stroke: 'rgb(255, 255, 255)',
                strokeWidth: 5
            });

            // add ways to map and load with amounts
            this.network.forEach(function (way) {
                var id = way.get('id'),
                    coords = way.get('the_geom').coordinates,
                    type = way.get('the_geom').type.toLowerCase(),
                    amount = amounts[id];
                _this.map.addGeometry(coords, {
                    projection: 'EPSG:4326',
                    layername: 'network',
                    type: type,
                    renderOSM: false,
                    style: {
                        // color, width & zIndex based on amount
                        strokeColor: amount > 0 ? assignColor(amount) : 'rgb(255,255,255)',
                        strokeWidth: amount > 0 ? 2 * (1 + 2 * amount / max) : 0.5,
                        zIndex: amount
                    },
                    tooltip: _this.drawTooltip(amount);
                });
            });

            // focus on network layer
            this.map.centerOnLayer('network');
        }
    }
    return NetworkMap;
});