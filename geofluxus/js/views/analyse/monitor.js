define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'utils/enrichFlows',
        'views/common/pieChartView',
        'views/common/barChartView',
        'views/common/linePlotView',
        'views/common/treeMapView',
        'views/common/choroplethView',
        'views/common/coordinatePointMapView',
        'views/common/areaChartView',
        'views/common/flowMapView',
        'views/common/parallelSetsView',
        'views/common/circularSankeyView',
        'views/common/networkMapView',
        'views/common/geoheatMapView',
        'views/common/arcLayerView',
    ],
    function (
        BaseView,
        _,
        Collection,
        enrichFlows,
        PieChartView,
        BarChartView,
        LinePlotView,
        TreeMapView,
        ChoroplethView,
        CoordinatePointMapView,
        AreaChartView,
        FlowMapView,
        ParallelSetsView,
        CircularSankeyView,
        NetworkMapView,
        GeoHeatMapView,
        ArcLayerView
    ) {
        var MonitorView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                MonitorView.__super__.initialize.apply(this, [options]);

                this.el = options.el;
                this.template = options.template;
                this.filtersView = options.filtersView;
                this.areaLevels = options.levels.models.filter(l => l.attributes.level != "0");
                this.actorLevel = options.levels.models.find(l => l.attributes.level == "1000").attributes.id;

                this.mode = options.mode || 'monitor';
                this.titleNumber = (options.titleNumber || 3).toString();
                this.indicator = options.indicator || "waste";

                this.labels = {
                    waste: "Afval",
                    co2: "CO<sub>2</sub>-eq",
                    nox: "NO<sub>x</sub>",
                    so2: "SO<sub>2</sub>",
                    pm10: "PM<sub>10</sub>",
                }

                this.dimensions = {};
                this.maxNumberOfDimensions = options.maxNumberOfDimensions || 2;
                this.selectedDimensionStrings = [];
                this.selectedVizName = "";

                // Dimension-Visualizations inventory
                this.vizs = {
                    // 1D visualizations
                    'time': ['piechart', 'barchart', 'treemap', 'lineplot'],
                    'economicActivity': ['piechart', 'barchart', 'treemap'],
                    'origin': ['piechart', 'barchart', 'treemap', 'geoheatmap'],
                    'destination': ['piechart', 'barchart', 'treemap', 'geoheatmap'],
                    'treatmentMethod': ['piechart', 'barchart', 'treemap', 'parallelsets', 'circularsankey'],
                    'material': ['piechart', 'barchart', 'treemap'],
                    // 2D visualizations
                    'time_economicActivity': ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'treemap'],
                    'time_origin': ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'time_destination': ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'time_treatmentMethod': ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'treemap'],
                    'time_material': ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'treemap'],
                    'origin_economicActivity': ['barchart', 'stackedbarchart', 'flowmap', 'treemap', 'arclayer'],
                    'origin_treatmentMethod': ['barchart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'origin_material': ['barchart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'destination_material': ['barchart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'economicActivity_destination': ['barchart', 'stackedbarchart', 'flowmap', 'treemap', 'arclayer'],
                    'destination_treatmentMethod': ['barchart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'destination_material': ['barchart', 'stackedbarchart', 'flowmap', 'treemap'],
                    'economicActivity_treatmentMethod': ['barchart', 'stackedbarchart', 'parallelsets', 'treemap', 'circularsankey'],
                    'economicActivity_material': ['barchart', 'stackedbarchart', 'parallelsets', 'treemap'],
                    'treatmentMethod_material': ['barchart', 'stackedbarchart', 'parallelsets', 'treemap'],
                    'origin_destination': ['networkmap']
                }

                // Visualization view inventory
                this.vizViews = {
                    'piechart': {
                        'view': PieChartView
                    },
                    'barchart': {
                        'view': BarChartView
                    },
                    'stackedbarchart': {
                        'view': BarChartView,
                        'options': {
                            isStacked: true
                        }
                    },
                    'treemap': {
                        'view': TreeMapView
                    },
                    'lineplot': {
                        'view': LinePlotView
                    },
                    'lineplotmultiple': {
                        'view': LinePlotView,
                        'options': {
                            hasMultipleLines: true
                        }
                    },
                    'areachart': {
                        'view': AreaChartView
                    },
                    'choroplethmap': {
                        'view': ChoroplethView
                    },
                    'coordinatepointmap': {
                        'view': CoordinatePointMapView
                    },
                    'flowmap': {
                        'view': FlowMapView
                    },
                    'parallelsets': {
                        'view': ParallelSetsView
                    },
                    'circularsankey': {
                        'view': CircularSankeyView
                    },
                    'networkmap': {
                        'view': NetworkMapView
                    },
                    'geoheatmap': {
                        'view': GeoHeatMapView
                    },
                    'arclayer': {
                        'view': ArcLayerView
                    }
                }

                this.render();
            },

            // DOM events
            events: {
                'click #apply-filters': 'fetchFlows',
                'click #reset-dim-viz': 'resetDimAndVizToDefault',
            },

            // render
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html);

                this.el.innerHTML = template({
                    levels: this.areaLevels,
                    maxNumberOfDimensions: this.maxNumberOfDimensions,
                    titleNumber: this.titleNumber,
                });

                // Activate help icons
                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                $(popovers).popover({
                    trigger: "focus"
                });

                // Dimension and granularity controls:
                this.initializeControls();
                this.addEventListeners();
            },

            initializeControls: function () {
                this.timeToggle = this.el.querySelector('#dim-toggle-time');
                this.timeToggleGran = this.el.querySelector('#gran-toggle-time');
                this.originToggle = this.el.querySelector('#dim-toggle-origin');
                this.originLevelGranSelect = this.el.querySelector('#dim-origin-gran-select');
                this.originOrigDest = this.el.querySelector('#origDest-toggle-origin');
                this.destinationToggle = this.el.querySelector('#dim-toggle-destination');
                this.destinationLevelGranSelect = this.el.querySelector('#dim-destination-gran-select');
                this.destinationOrigDest = this.el.querySelector('#origDest-toggle-destination');
                this.economicActivityToggle = this.el.querySelector('#dim-toggle-economic-activity');
                this.economicActivityToggleGran = this.el.querySelector('#gran-toggle-econ-activity');
                this.economicActivityOrigDest = this.el.querySelector('#origDest-toggle-econAct');
                this.treatmentMethodToggle = this.el.querySelector('#dim-toggle-treatment-method');
                this.treatmentMethodToggleGran = this.el.querySelector('#gran-toggle-treatment-method');
                this.treatmentMethodOrigDest = this.el.querySelector('#origDest-toggle-treatment');
                this.materialToggle = this.el.querySelector('#dim-toggle-material');

                $(this.spaceLevelGranSelect).selectpicker();
                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // selected visualization
                $('.viz-selector-button').on("click", function (event) {
                    _this.selectedVizName = $(this).attr("data-viz");
                    event.preventDefault();
                });

                // /////////////////////////////////////////////////
                // Dimension toggles:

                // Show alert if user clicks on disabled dimension toggle:
                $("#dimensionsCard .toggle.btn").on("click", function (event) {
                    let clickedToggle = $($(event.currentTarget)[0]);
                    let isDimensionToggle = $(clickedToggle[0].children[0]).hasClass("dimensionToggle");

                    if (clickedToggle.is('[disabled=disabled]') && isDimensionToggle) {
                        $("#alertMaxDimensionsRow").fadeIn("fast");
                        $("#alertMaxDimensions").alert();

                        setTimeout(function () {
                            $("#alertMaxDimensionsRow").fadeOut("fast");
                        }, 6000);
                    }
                });

                $(".dimensionToggle").change(function (event) {
                    // Deselect any selected Viz-buttons: 
                    $(".viz-selector-button").removeClass("active");
                    _this.selectedVizName = "";

                    if (_this.resetInProgres) {
                        return
                    }

                    // //////////////////////////////////////////////////////
                    // Disable dimension toggles for max number of dimensions:
                    _this.uncheckedDimToggles = [];
                    _this.selectedDimensionStrings = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.dimensionToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            _this.uncheckedDimToggles.push($(this));
                        } else {
                            _this.selectedDimensionStrings.push($(this).attr("data-dim"));
                        }
                    });

                    // If the maximum number of dimensions has been selected:
                    if (_this.maxNumberOfDimensions == _this.selectedDimensionStrings.length) {
                        // Disable the remaining unchecked toggles:
                        $(_this.uncheckedDimToggles).each(function (index, value) {
                            $(this).bootstrapToggle('disable');
                        });
                    } else {
                        // (Re)enable the toggles:
                        $(_this.uncheckedDimToggles).each(function (index, value) {
                            $(this).bootstrapToggle('enable');
                        });
                        $("#alertMaxDimensionsRow").fadeOut("fast");
                    }

                    // If dimensions are selected
                    if (_this.selectedDimensionStrings.length) {
                        // Show available visualizations based on selected dimension(s)
                        $(".viz-selector-button").hide();
                        $(".viz-container").fadeIn();
                        _this.vizs[_this.selectedDimensionStrings.join('_')].forEach(function (viz) {
                            $("#viz-" + viz).parent().fadeIn();
                        })

                        // show lineplot multiple for month
                        $(_this.timeToggleGran).trigger("change");

                        // show choropleth / point map
                        $('.gran-radio-origin-label.active').trigger("click");
                        $('.gran-radio-destination-label.active').trigger("click");

                        // show origin / destination for space & treatment method
                        $("#dim-origin-gran-select").parent().fadeIn();
                        $("#origDest-toggle-origin").parent().fadeIn();
                        $("#origDest-toggle-destination").parent().fadeIn();
                        //$("#origDest-toggle-treatment").parent().fadeIn();
                    } else {
                        $("#message-container-row").fadeIn();
                        $(".viz-container").hide();
                    }

                    event.preventDefault();
                });

                // Show Multiple Line option on dimension Time, granularity Month:
                $(_this.timeToggleGran).change(function () {
                    if (_this.selectedDimensionStrings == 'time') {
                        let granularityIsMonth = $(_this.timeToggleGran).prop("checked");
                        $("#viz-lineplotmultiple").parent()[granularityIsMonth ? 'fadeIn' : 'hide']();
                    }
                });

                // Show choropleth / coordinate map for space dimension
                ['origin', 'destination'].forEach(function(node) {
                    $('.gran-radio-' + node + '-label').click(function (event) {
                        if (_this.selectedDimensionStrings == node) {
                            let selectedAreaLevel = $(this).attr("data-" + node),
                                actorLevel = selectedAreaLevel == _this.actorLevel;
                            $("#viz-coordinatepointmap").parent()[actorLevel ? 'fadeIn' : 'hide']();
                            $("#viz-choroplethmap").parent()[actorLevel ? 'hide' : 'fadeIn']();
                        }
                    });
                })

                $(".viz-selector-button").click(function (event) {
                    $('#apply-filters').popover('dispose');

                    // Disable origin/destination toggle for Space Treatment method for Flowmap and Parallel Sets
                    let clickedToggleHasFlowsFormat = $($(event.currentTarget)[0]).hasClass("hasFlowsFormat");

                    // At least two dimensions, and one is Space:
                    if (_this.selectedDimensionStrings.includes("space") && clickedToggleHasFlowsFormat) {
                        $("#origDest-toggle-origin").parent().fadeOut();
                    } else {
                        $("#dim-origin-gran-select").parent().fadeIn();
                        $("#origDest-toggle-origin").parent().fadeIn();
                    }

//                    // Only treatmentMethod:
//                    if (_this.selectedDimensionStrings == "treatmentMethod" && clickedToggleHasFlowsFormat) {
//                        //$("#origDest-toggle-treatment").parent().fadeOut();
//                        $(_this.treatmentMethodOrigDest).bootstrapToggle('off');
//                    } else {
//                        //$("#origDest-toggle-treatment").parent().fadeIn();
//                    }

                    // Hide space gran for Network Map:
                    if (_this.selectedVizName == "networkmap") {
                        $("#dim-origin-gran-select").parent().fadeOut();
                        $("#origDest-toggle-origin").parent().fadeOut();
                    }
                    event.preventDefault();
                });

                // Show granularity on toggle change:
                $("#dim-toggle-time").change(function () {
                    $("#gran-toggle-time-col").fadeToggle();
                });
                $("#dim-toggle-origin").change(function () {
                    $("#gran-toggle-origin-col").fadeToggle();
                    //$("#origDest-toggle-origin-col").fadeToggle();
                });
                $("#dim-toggle-destination").change(function () {
                    $("#gran-toggle-destination-col").fadeToggle();
                    //$("#origDest-toggle-origin-col").fadeToggle();
                });
                $("#dim-toggle-economic-activity").change(function () {
                    $("#gran-econ-activity-col").fadeToggle();
                    $("#origDest-toggle-econAct-col").fadeToggle();
                });
                $("#dim-toggle-treatment-method").change(function () {
                    $("#gran-treatment-method-col").fadeToggle();
                    //$("#origDest-toggle-treatment-col").fadeToggle();
                });
                $("#dim-toggle-material").change(function () {
                    $("#gran-material-col").fadeToggle();
                });
            },

            // Returns parameters for filtered post-fetching based on assigned filter
            getFilterAndDimParams: function () {
                var _this = this;

                // Prepare filters for request
                let filterParams = this.filtersView.getFilterParams();
                this.mode = this.filtersView.mode;
                this.indicator = 'waste';
                if (this.mode == 'impact') {
                    filterParams.indicator = 'co2';
                    this.indicator = 'co2';
                    filterParams.impactSources = ['transportation'];
                }

                // ///////////////////////////////
                // Format
                let selectedVizualisationString;
                $('.viz-selector-button').each(function (index, value) {
                    if ($(this).hasClass("active")) {
                        selectedVizualisationString = $(this).attr("data-viz");
                    }
                });
                filterParams.format = selectedVizualisationString;

                // ///////////////////////////////
                // DIMENSIONS
                filterParams.dimensions = {};

                // Time
                if ($(this.timeToggle).prop("checked")) {
                    // filterParams.dimensions.time = 'flowchain__month';
                    // if (!$(this.timeToggleGran).prop("checked")) {
                    //     filterParams.dimensions.time += '__year';
                    // }

                    let gran = $($(".gran-radio-time-label.active")).attr("data-time");
                    filterParams.dimensions.time = 'flowchain__month';
                    if (gran === 'year') {
                        filterParams.dimensions.time += '__year'
                    }
                }

                // Origin
                if ($(this.originToggle).prop("checked")) {
                    let originOrDestination = $(this.originOrigDest).prop("checked") ? 'destination' : 'origin',
                        gran = $($(".gran-radio-origin-label.active")).attr("data-origin");
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                // Economic activity
                if ($(this.economicActivityToggle).prop("checked")) {
                    let originOrDestination = $(this.economicActivityOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    // gran = $(this.economicActivityToggleGran).prop("checked") ? 'activity' : 'activity__activitygroup',
                    
                    let gran = $($(".gran-radio-econ-activity-label.active")).attr("data-econ-activity");
                    // filterParams.dimensions.economicActivity = 'activity';
                    // if (gran === 'activity-group') {
                    //     filterParams.dimensions.economicActivity += '__activitygroup'
                    // }

                    filterParams.dimensions.economicActivity = originOrDestination + gran;
                }

                // Destination
                if ($(this.destinationToggle).prop("checked")) {
                    let originOrDestination = $(this.destinationOrigDest).prop("checked") ? 'origin' : 'destination',
                        gran = $($(".gran-radio-destination-label.active")).attr("data-destination");
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                // Treatment method
                if ($(this.treatmentMethodToggle).prop("checked")) {
                    let originOrDestination = $(this.treatmentMethodOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    // gran = $(this.treatmentMethodToggleGran).prop("checked") ? 'process' : 'process__processgroup',
                    
                    let gran = $($(".gran-radio-treatment-method-label.active")).attr("data-treatment-method");

                    filterParams.dimensions.treatmentMethod = originOrDestination + gran;
                }

                // Material
                if ($(this.materialToggle).prop("checked")) {
                    let gran = $($(".gran-radio-material-label.active")).attr("data-ewc");
                    filterParams.dimensions.material = 'flowchain__waste06';
                    if (gran === 'ewc4') {
                        filterParams.dimensions.material += '__waste04'
                    } else if (gran === 'ewc2') {
                        filterParams.dimensions.material += '__waste04__waste02'
                    } else if (gran == 'gncode') {
                        filterParams.dimensions.material = 'flowchain__gncode'
                    }
                }

                return filterParams;
            },

            renderVisualizations: function (dimensions, flows) {
                let _this = this;
                let collections = this.filtersView.collections,
                    tags = this.filtersView.tags;

                $(".visualizationBlock .card").removeClass("lightMode");
                $(".visualizationBlock").fadeIn();

                // Enrich flows with info
                let adminlevel = null;
                dimensions.forEach(function (dimension) {
                    let dimensionString = dimension[0];
                    let granularity = dimension[1];

                    if (dimensionString !== 'space') {
                        if (!['parallelsets', 'circularsankey'].includes(_this.selectedVizName)) {
                            flows = enrichFlows.enrichFlows(flows, tags, collections, granularity);
                        }
                    } else {
                        adminlevel = granularity.adminlevel;
                        dimensions.isActorLevel = (adminlevel == _this.actorLevel) ? true : false;
                    }
                })

                // Render visualization
                if (this.vizView != null) this.vizView.close();
                if (_this.selectedVizName === 'parallelsets') {
                    $(".parallelsets-container").show();
                }

                let vizView = this.vizViews[_this.selectedVizName],
                    extraOptions = vizView['options'];

                let wrapperName = _this.selectedVizName === 'lineplotmultiple' ? 'lineplot' : _this.selectedVizName;
                $("." + wrapperName + "-wrapper").fadeIn();
                let defaultOptions = {
                    el: "." + wrapperName + "-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                    label: this.labels[this.indicator],
                };

                if (_this.selectedVizName === 'choroplethmap') {
                    _this.renderChoroplethMap(flows, adminlevel, dimensions);
                } else {
                    this.vizView = new vizView['view'](
                        Object.assign(defaultOptions, extraOptions)
                    );
                }
            },

            renderChoroplethMap: function (flows, adminlevel, dimensions) {
                var _this = this;

                var areas = Object.values(flows.pop()),
                    geoJson = {};

                geoJson['type'] = 'FeatureCollection';
                features = geoJson['features'] = [];
                areas.forEach(function (area) {
                    var feature = {};
                    feature['type'] = 'Feature';
                    feature['id'] = area['id'];
                    feature['geometry'] = area['geom'];

                    features.push(feature);
                })

                flows.forEach(function (flow, index) {
                    this[index].id = this[index].areaId;
                }, flows);

                _this.vizView = new ChoroplethView({
                    el: ".choroplethmap-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: _this,
                    geoJson: geoJson,
                    label: this.labels[this.indicator]
                });
            },

            closeAllVizViews: function () {
                $(".export-csv").off();
                $(".export-png").off();

                $(".visualizationBlock").hide();

                $(".no-data-found").fadeOut();
                $(".no-data-found").removeClass("d-flex");

                $(".viz-wrapper-div").removeClass("lightMode");
                $(".viz-wrapper-div").hide();
                $(".parallelsets-container").hide();
                if (this.vizView != null) this.vizView.close();
            },

            // Fetch flows and calls options.success(flows) on success
            fetchFlows: function (options) {
                var _this = this;
                let filterParams = this.getFilterAndDimParams();

                let data = {};
                this.selectedDimensions = Object.entries(filterParams.dimensions);

                // Reset all visualizations:
                this.closeAllVizViews();
                $('#apply-filters').popover('dispose');

                // No visualization has been selected, inform user:
                if (_this.selectedVizName == "" || _this.selectedDimensions.length == 0) {

                    let options = {
                        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-body"></div></div>',
                        content: "Kies minimaal een variabele en een visualizatie!",
                        trigger: "focus",
                    }
                    $('#apply-filters').popover(options);
                    $('#apply-filters').popover('show');

                    // Only fetch Flows if a visualization has been selected:
                } else {

                    this.loader.activate();
                    let flows = new Collection([], {
                        apiTag: _this.mode + 'flows',
                    });
                    flows.postfetch({
                        data: data,
                        body: filterParams,
                        success: function (response) {
                            _this.flows = flows.models;

                            _this.flows.forEach(function (flow, index) {
                                this[index] = flow.attributes;
                            }, _this.flows);

                            _this.selectedDimensions.label = _this.labels[_this.indicator];

                            if (_this.flows.length == 0 ||
                                _this.flows.every(function(flow) {return flow.amount == 0;})) {
                                _this.loader.deactivate()
                                $(".visualizationBlock .card").removeClass("lightMode");
                                $(".visualizationBlock").fadeIn();
                                $(".no-data-found").fadeIn();
                                $(".no-data-found").addClass("d-flex");
                                $(".viz-wrapper-title").html("");
                            } else {
                                // Render visualization
                                _this.renderVisualizations(_this.selectedDimensions, _this.flows, _this.selectedVizName);
                            }
                        },
                        error: function (error) {
                            _this.loader.deactivate();
                            console.log(error);
                        }
                    });
                }
                // Automatically remove popover:
                setTimeout(() => {
                    $('#apply-filters').popover('dispose');
                }, 3000);
            },

            resetDimAndVizToDefault: function (event) {
                _this = this;
                _this.resetInProgres = true;

                // //////////////////////////////////
                // Dimension controls:

                $(_this.timeToggle).bootstrapToggle('off');
                //$(_this.timeToggleGran).bootstrapToggle('on');           
                $(".gran-radio-time-label").removeClass("active");
                $($("#gran-radio-time")[0].children[1]).addClass("active");
                $("#gran-toggle-time-col").hide();

                $(_this.originToggle).bootstrapToggle('off');
                $(_this.originLevelGranSelect).val($('#dim-origin-gran-select:first-child')[0].value);
                $(_this.originOrigDest).bootstrapToggle('off');
                $("#gran-toggle-origin-col").hide();
                //$("#origDest-toggle-origin-col").hide();

                $(_this.economicActivityToggle).bootstrapToggle('off');
                // $(_this.economicActivityToggleGran).bootstrapToggle('off');
                $(".gran-radio-econ-activity-label").removeClass("active");
                $($("#gran-radio-econ-activity")[0].children[0]).addClass("active");
                $(_this.economicActivityOrigDest).bootstrapToggle('off');
                $("#gran-econ-activity-col").hide();
                $("#origDest-toggle-econAct-col").hide();

                $(_this.destinationToggle).bootstrapToggle('off');
                $(_this.destinationLevelGranSelect).val($('#dim-destination-gran-select:first-child')[0].value);
                $(_this.destinationOrigDest).bootstrapToggle('off');
                $("#gran-toggle-destination-col").hide();
                //$("#origDest-toggle-destination-col").hide();

                $(_this.treatmentMethodToggle).bootstrapToggle('off');
                // $(_this.treatmentMethodToggleGran).bootstrapToggle('off');
                $(".gran-radio-treatment-method-label").removeClass("active");
                $($("#gran-radio-treatment-method")[0].children[0]).addClass("active");
                $(_this.treatmentMethodOrigDest).bootstrapToggle('on');
                $("#gran-treatment-method-col").hide();
                //$("#origDest-toggle-treatment-col").hide();

                $(_this.materialToggle).bootstrapToggle('off');
                $(".gran-radio-material-label").removeClass("active");
                $($("#gran-radio-material")[0].children[0]).addClass("active");
                $("#gran-material-col").hide();

                // (Re)enable all toggles:
                $('.bootstrapToggle').each(function (index, value) {
                    $(this).bootstrapToggle('enable');
                });

                // //////////////////////////////////
                // Vizualisation controls:
                $(".viz-selector-button").removeClass("active");

                // Hide all Viz options:
                $(".viz-container").hide();

                // Refresh all selectpickers:
                $(".selectpicker").selectpicker('refresh');
                _this.resetInProgres = false;
            },

            close: function () {
                this.undelegateEvents(); // remove click events
                this.unbind(); // Unbind all local event bindings
                $(this.el).html("");
            }

        });
        return MonitorView;
    });