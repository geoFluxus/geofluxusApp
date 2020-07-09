// Flows
define(['views/common/baseview',
        'views/analyse/monitor',
        'underscore',
        'd3',
        'openlayers',
        'visualizations/map',
        'collections/collection',
        'utils/utils',
        'bootstrap',
        'bootstrap-select',
        'bootstrap-toggle',
        'textarea-autosize',
    ],
    function (
        BaseView,
        MonitorView,
        _,
        d3,
        ol,
        Map,
        Collection,
        utils,
    ) {

        var ImpactView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                ImpactView.__super__.initialize.apply(this, [options]);

                this.filtersView = options.filtersView;

                this.dimensions = {};
                this.maxNumberOfDimensions = 1;
                this.selectedDimensionStrings = [];
                this.impactSourceStrings = [];

                this.areaLevels = new Collection([], {
                    apiTag: 'arealevels',
                    comparator: "level",
                });

                var promises = [
                    this.areaLevels.fetch(),
                ];
                Promise.all(promises).then(function () {
                    _this.render();
                })
            },

            // DOM events
            events: {
                // 'click #apply-filters': 'fetchFlows',
                'click #reset-dim-viz': 'resetDimAndVizToDefault',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html)

                this.el.innerHTML = template({
                    levels: this.areaLevels,
                    maxNumberOfDimensions: this.maxNumberOfDimensions
                });

                // Render map for visualizations
                // this.routingMap = new Map({
                //     el: this.el.querySelector('.map'),
                //     source: 'dark',
                //     opacity: 1.0
                // });

                this.renderMonitorView();

                this.initializeControls();
                this.addEventListeners();
            },

            renderMonitorView: function () {
                var el = document.querySelector('#impact-dimensions-container');
                this.monitorView = new MonitorView({
                    el: el,
                    template: 'monitor-template',
                    filtersView: this.filtersView,
                    mode: "impact",
                    maxNumberOfDimensions: 2,
                    indicator: this.indicator,
                    titleNumber: 4,
                    impactSourceStrings: this.impactSourceStrings,
                    levels: this.areaLevels,
                });
            },

            initializeControls: function () {
                // Impact source controls:
                this.impactSources = {};
                this.impactSources.transportation = this.el.querySelector('#impact-source-toggle-transportation');
                this.dimensions.treatment = this.el.querySelector('#impact-source-toggle-treatment');

                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // Indicator toggle
                $('.impact-indicator-radio-label').on("click", function (event) {
                    let clickedIndicator = $(this).attr("data-indicator");

                    if (clickedIndicator != _this.indicator) {
                        _this.indicator = clickedIndicator;
                        $(".impactSourceContainer").fadeIn();
                    }
                    event.preventDefault();
                });

                // Impact source toggles:
                $(".impactSourceToggle").change(function (event) {
                    let checkedToggles = [];
                    let uncheckedToggles = [];
                    _this.impactSourceStrings = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.impactSourceToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            uncheckedToggles.push($(this));
                        } else {
                            checkedToggles.push($(this));
                            _this.impactSourceStrings.push($(this).attr("data-source"));
                        }
                    });

                    if (_this.impactSourceStrings.length > 0) {
                        $("#impact-dimensions-container").fadeIn();
                    } else {
                        $("#impact-dimensions-container").fadeOut();
                    }
                });

            },

            // Returns parameters for filtered post-fetching based on assigned filter
            getImpactParams: function () {

                // Prepare filters for request
                let filterParams = this.filtersView.getFilterParams();

                // format
                filterParams.format = "routing";

                // ///////////////////////////////
                // DIMENSIONS
                filterParams.dimensions = {};

                if ($(this.dimensions.timeToggle).prop("checked")) {
                    var timeFilter = 'flowchain__month',
                        gran = $(this.dimensions.timeToggleGran).prop("checked") ? 'month' : 'year';
                    if (gran == 'year') {
                        timeFilter += '__year';
                    }
                    filterParams.dimensions.time = timeFilter;
                }

                if ($(this.dimensions.spaceToggle).prop("checked")) {
                    let originOrDestination = $(this.dimensions.spaceOrigDest).prop("checked") ? 'destination__geom' : 'origin__geom',
                        gran = $('#dim-space-gran-select option:selected').val();
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                if ($(this.dimensions.economicActivityToggle).prop("checked")) {
                    let originOrDestination = $(this.dimensions.economicActivityOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(this.dimensions.economicActivityToggleGran).prop("checked") ? 'activity' : 'activity__activitygroup',
                        filterParams.dimensions.economicActivity = originOrDestination + gran;
                }

                if ($(this.dimensions.treatmentMethodToggle).prop("checked")) {
                    let originOrDestination = $(this.dimensions.treatmentMethodOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(this.dimensions.treatmentMethodToggleGran).prop("checked") ? 'process' : 'process__processgroup',
                        filterParams.dimensions.treatmentMethod = originOrDestination + gran;
                }

                if ($(this.dimensions.materialToggle).prop("checked")) {
                    let gran = $($(".gran-radio-material-label.active")).attr("data-ewc"),
                        materialFilter = 'flowchain__waste06';
                    if (gran === 'ewc4') {
                        materialFilter += '__waste04'
                    } else if (gran === 'ewc2') {
                        materialFilter += '__waste04__waste02'
                    }
                    filterParams.dimensions.material = materialFilter;
                }

                return filterParams;
            },

            // Fetch flows and calls options.success(flows) on success
            fetchFlows: function (options) {
                let _this = this;
                let filterParams = this.getImpactParams();
                let data = {};
                let selectedVizualisationString;
                this.selectedDimensions = Object.entries(filterParams.dimensions);

                $('.viz-selector-button').each(function (index, value) {
                    if ($(this).hasClass("active")) {
                        selectedVizualisationString = $(this).attr("data-viz");
                    }
                });

                let flows = new Collection([], {
                    apiTag: 'impactflows',
                });

                // Only fetch Flows if at least one dimension has been selected:
                if (_this.selectedDimensions.length > 0) {
                    this.loader.activate();

                    flows.postfetch({
                        data: data,
                        body: filterParams,
                        success: function (response) {
                            _this.flows = flows.models;

                            _this.flows.forEach(function (flow, index) {
                                this[index] = flow.attributes;
                            }, _this.flows);

                            // Render network map for visualizations
                            _this.renderNetworkMap(_this.flows);

                            _this.loader.deactivate();

                            if (options.success) {
                                options.success(flows);
                            }
                        },
                        error: function (error) {
                            _this.loader.deactivate();
                            console.log(error);
                            //_this.onError(error);
                        }
                    });
                }
            },

            // Render network map for visualizations
            renderNetworkMap: function (flows) {
                var _this = this;

                ways = new Collection([], {
                    apiTag: 'ways',
                });
                this.loader.activate();
                ways.fetch({
                    success: function () {
                        _this.loader.deactivate();
                        _this.drawNetwork(ways, flows);
                    },
                    error: function (res) {
                        _this.loader.deactivate();
                        _this.onError(res);
                    }
                });

                this.routingMap.addLayer('ways', {
                    stroke: 'rgb(255, 255, 255)',
                    strokeWidth: 5
                });
            },

            // Add network layer to map
            drawNetwork: function (ways, flows) {
                var _this = this;

                // process flows to point to amounts
                var amounts = {},
                    data = [];
                flows.forEach(function (flow) {
                    var id = flow['id'],
                        amount = flow['amount'];
                    amounts[id] = amount;
                    // exclude zero values from scale definition
                    if (amount > 0) {
                        data.push(amount);
                    }
                })

                // define color scale for amounts
                var colors = [
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
                var values = [];
                Object.values(quantile.quantiles()).forEach(function (val) {
                    values.push(prettify(val));
                });
                values.unshift(0);

                function assignColor(amount) {
                    for (i = 1; i < values.length; i++) {
                        if (amount <= values[i]) {
                            return colors[i - 1];
                        }
                    }
                    return colors[colors.length - 1];
                }

                // add ways to map and load with amounts
                ways.forEach(function (way) {
                    var id = way.get('id'),
                        coords = way.get('the_geom').coordinates,
                        type = way.get('the_geom').type.toLowerCase(),
                        amount = amounts[id];
                    _this.routingMap.addGeometry(coords, {
                        projection: 'EPSG:4326',
                        layername: 'ways',
                        type: type,
                        renderOSM: false,
                        style: {
                            // color, width & zIndex based on amount
                            strokeColor: amount > 0 ? assignColor(amount) : 'rgb(255,255,255)',
                            strokeWidth: amount > 0 ? 2 * (1 + 2 * amount / max) : 0.5,
                            zIndex: amount
                        },
                        tooltip: amount < 1000 ? `${amount.toFixed(3)} t` : `${(amount / 1000).toFixed(3)} kt`
                    });
                });

                // focus on ways layer
                this.routingMap.centerOnLayer('ways');

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
                this.routingMap.map.addControl(controlPanel);

                //                var title = document.createElement('div');
                //                title.style.margin = "5%";
                //                title.innerHTML = '<h4 style="text-align: center;">Legend</h4>'
                //                legend.appendChild(title);

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
            },

            resetDimAndVizToDefault: function () {
                _this = this;

                // //////////////////////////////////
                // Dimension controls:
                $(_this.dimensions.timeToggle).bootstrapToggle('off');
                $(_this.dimensions.timeToggleGran).bootstrapToggle('Year');

                $(_this.dimensions.spaceToggle).bootstrapToggle('off');
                $(_this.dimensions.spaceLevelGranSelect).val($('#dim-space-gran-select:first-child')[0].value);
                $(_this.dimensions.spaceOrigDest).bootstrapToggle('off');

                $(_this.dimensions.economicActivityToggle).bootstrapToggle('off');
                $(_this.dimensions.economicActivityToggleGran).bootstrapToggle('off');
                $(_this.dimensions.economicActivityOrigDest).bootstrapToggle('off');

                $(_this.dimensions.treatmentMethodToggle).bootstrapToggle('off');
                $(_this.dimensions.treatmentMethodToggleGran).bootstrapToggle('off');
                $(_this.dimensions.treatmentMethodOrigDest).bootstrapToggle('off');

                $("#gran-toggle-time-col").hide();
                $("#gran-toggle-space-col").hide();
                $("#gran-econ-activity-col").hide();
                $("#gran-treatment-method-col").hide();
                $("#gran-material-col").hide();

                $("#origDest-toggle-space-col").hide();
                $("#origDest-toggle-econAct-col").hide();
                $("#origDest-toggle-treatment-col").hide();


                // //////////////////////////////////
                // Vizualisation controls:
                $(".viz-selector-button").removeClass("active");


                // Refresh all selectpickers:
                $(".selectpicker").selectpicker('refresh');
            },

            close: function () {                
                if (this.monitorView) this.monitorView.close();
                this.undelegateEvents(); // remove click events
                this.unbind(); // Unbind all local event bindings
            }

        });
        return ImpactView;
    });