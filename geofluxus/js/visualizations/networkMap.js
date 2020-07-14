define([
    'd3',
    'visualizations/map',
    'openlayers'
], function (d3, Map, ol) {
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
                el: document.querySelector(options.el),
                source: options.source || 'dark',
                opacity: options.opacity || 1.0
            });

            this.flows = options.flows;
            this.network = options.network;

            // add network layer to map
            this.drawNetwork();
        }

        drawNetwork() {
            var _this = this;

            // process flows to point to amounts
            var amounts = {};
            this.data = [];
            this.flows.forEach(function (flow) {
                var id = flow['id'],
                    amount = flow['amount'];
                amounts[id] = amount;
                // exclude zero values from scale definition
                if (amount > 0) {
                    _this.data.push(amount);
                }
            })

            // define scale
            this.defineScale();

            // define network color based on amount
            function assignColor(amount) {
                for (var i = 1; i < _this.values.length; i++) {
                    if (amount <= _this.values[i]) {
                        return _this.colors[i - 1];
                    }
                }
                return _this.colors[_this.colors.length - 1];
            }

            // create network layer
            this.map.addLayer('network', {
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
                        strokeWidth: amount > 0 ? 2 * (1 + 2 * amount / _this.max) : 0.5,
                        zIndex: amount
                    },
                    tooltip: _this.drawTooltip(amount)
                });
            });

            // focus on network layer
            this.map.centerOnLayer('network');

            // define legend
            this.drawLegend();
        }

        defineScale() {
            var _this = this;

            // scale of equal frequency intervals
            this.max = Math.max(...this.data);
            var quantile = d3.scaleQuantile()
                             .domain(this.data)
                             .range(this.colors);

            // prettify scale intervals
            function prettify(val) {
                if (val < 1) return val.toFixed(2);
                var int = ~~(val),
                    digits = int.toString().length - 1,
                    base = 10 ** digits;
                return Math.round(val / base) * base;
            }

            this.values = [];
            Object.values(quantile.quantiles()).forEach(function (val) {
                _this.values.push(prettify(val));
            });
            this.values.unshift(0);
        }

        drawTooltip(amount) {
            var label = "";
            if (10**3 <= amount && amount < 10**6) {
                label = "k";
            } else if (10**6 <= amount && amount < 10**9) {
                label = "M";
            } else if (amount <= 10**9) {
                label = "B";
            }
            return `${amount.toFixed(3)} {label}t`;
        }

        drawLegend() {
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
            this.map.map.addControl(controlPanel);

            //  var title = document.createElement('div');
            //  title.style.margin = "5%";
            //  title.innerHTML = '<h4 style="text-align: center;">Legend</h4>'
            //  legend.appendChild(title);

            // add color scale to legend
            var width = 30,
                height = 30;
            var scale = d3.select("#legend")
                          .append("center")
                          .append("svg")
                          .attr("width", width * this.colors.length)
                          .attr("height", 100),
                rects = scale.selectAll('rect')
                             .data(this.colors)
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
                             .data(this.values)
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
    }
    return NetworkMap;
});