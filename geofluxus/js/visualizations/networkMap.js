define([
    'd3',
    'visualizations/map',
    'openlayers',
    'utils/utils',
    'visualizations/d3plus',
], function (d3, Map, ol, utils, d3plus) {
    class NetworkMap {
        constructor(options) {
            let _this = this;
            this.options = options || {};
            this.label = this.options.label;
            this.unit = 't';
            this.darkMode = this.options.darkMode;
            this.showNetwork = this.options.showNetwork;

            if (this.darkMode) {
                this.fontColor = "white";
                this.options.source = "dark";
            } else {
                this.fontColor = "black";
                this.options.source = "light";
            }

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

            // Background map options
            this.map = new Map({
                el: document.querySelector(this.options.el),
                source: this.options.source || 'dark',
                opacity: this.options.opacity || 1.0
            });

            this.flows = options.flows;

            // add network layer to map
            this.drawNetwork();
        }

        drawNetwork() {
            var _this = this;

            // convert tonnes to other units if necessary
            var max = Math.max.apply(Math, this.flows.map(function(o) { return o.amount; })),
                multiplier = 1;
            if (max <= 10**(-3)) {
                multiplier = 10**6;
                this.unit = 'gr';
            } else if (max <= 1) {
                multiplier = 10**3;
                this.unit = 'kg';
            }

            if (multiplier != 1) {
                this.flows.forEach(function(f) {
                    f.amount *= multiplier;
                })
            }

            // process flows to point to amounts
            this.amounts = [];
            this.flows.forEach(function (flow) {
                // exclude zero values from scale definition
                if (flow.amount > 0) {
                    _this.amounts.push(flow.amount);
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
                strokeWidth: 5,
                crossOrigin: 'anonymous',
            });

            // create flows layer
            this.map.addLayer('flows', {
                stroke: 'rgb(255, 255, 255)',
                strokeWidth: 5,
                crossOrigin: 'anonymous',
            });

            // add ways to map and load with amounts
            this.flows.forEach(function (flow) {
                var id = flow.id,
                    coords = flow.geometry.coordinates,
                    type = flow.geometry.type.toLowerCase(),
                    amount = flow.amount;
                _this.map.addGeometry(coords, {
                    projection: 'EPSG:4326',
                    layername: amount ? 'flows' : 'network',
                    type: type,
                    renderOSM: false,
                    style: {
                        // color, width & zIndex based on amount
                        strokeColor: amount > 0 ? assignColor(amount) : _this.fontColor,
                        strokeWidth: amount > 0 ? 2 * (1 + 2 * amount / _this.max) : 0.5,
                        zIndex: amount,
                    },
                    tooltip: _this.getTooltipText(amount)
                });
            });

            // focus on network layer
            this.map.centerOnLayer('flows');
            this.map.setVisible('network', this.showNetwork);

            // define legend
            this.drawLegend();
        }

        defineScale() {
            var _this = this;

            // scale of equal frequency intervals
            this.max = Math.max(...this.amounts);
            var quantile = d3.scaleQuantile()
                .domain(this.amounts)
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
            this.values.push(prettify(this.max));
        }

        getTooltipText(amount) {
            return this.label + ": " + d3plus.formatAbbreviate(amount, utils.returnD3plusFormatLocale()) + ` ${this.unit}`;
        }

        drawLegend() {
            var _this = this;

            var legend = document.getElementById('networkmap-legend');
            if (legend) {
                legend.parentElement.removeChild(legend);
            }
            var legend = document.createElement('div');
            legend.className = 'ol-control-panel ol-unselectable ol-control';
            legend.id = 'networkmap-legend';
            var controlPanel = new ol.control.Control({
                element: legend
            });
            this.map.map.addControl(controlPanel);

            var title = document.createElement('div');
            title.style.textAlign = "center";
            title.innerHTML = '<span style="color: ' + this.fontColor + '; text-align: center;">' + this.label + ` (${this.unit})` +'</span>'
            legend.appendChild(title);

            // add color scale to legend
            var width = 30,
                height = 30;
            var scale = d3.select("#networkmap-legend")
                .append("center")
                .append("svg")
                .attr("width", width * (this.colors.length + 1))
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
                    return d >= 1000 ? `${(d/1000)}k` : `${d}`;
                })
                .attr("x", function (d, i) {
                    return i * (width - 1);
                })
                .attr('y', 2 * height)
                .attr('fill', _this.fontColor)
                .attr('font-size', 10);
        }
    }
    return NetworkMap;
});