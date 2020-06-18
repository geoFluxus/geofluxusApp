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
    ) {
        var MonitorView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                MonitorView.__super__.initialize.apply(this, [options]);

                this.filtersView = options.filtersView;
                this.el = options.el;

                this.mode = options.mode;
                this.titleNumber = options.titleNumber.toString();
                this.indicator = "waste";
                this.impactSourceStrings = [];

                this.labels = {
                    waste: "Waste",
                    co2: "CO<sub>2</sub>",
                    nox: "NO<sub>x</sub>",
                    pm: "particulate matter",
                }

                this.dimensions = {};
                this.maxNumberOfDimensions = options.maxNumberOfDimensions;
                this.selectedDimensionStrings = [];
                this.selectedVizName = "";

                // Dimension-Visualizations inventory
                this.vizs = {
                    // 1D visualizations
                    'time':             ['piechart', 'barchart', 'treemap', 'lineplot'],
                    'economicActivity': ['piechart', 'barchart', 'treemap'],
                    'space':            ['piechart', 'barchart', 'treemap'],
                    'treatmentMethod':  ['piechart', 'barchart', 'treemap', 'parallelsets'],
                    'material':         ['piechart', 'barchart', 'treemap'],
                    // 2D visualizations
                    'time_economicActivity':            ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart'],
                    'time_space':                       ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart', 'flowmap'],
                    'time_treatmentMethod':             ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart'],
                    'time_material':                    ['barchart', 'lineplotmultiple', 'areachart', 'stackedbarchart'],
                    'economicActivity_treatmentMethod': ['barchart', 'stackedbarchart', 'parallelsets'],
                    'economicActivity_material':        ['barchart', 'stackedbarchart', 'parallelsets'],
                    'treatmentMethod_material':         ['barchart', 'stackedbarchart', 'parallelsets']
                }

                // Visualization view inventory
                this.vizViews = {
                    'piechart':           {'view': PieChartView},
                    'barchart':           {'view': BarChartView},
                    'stackedbarchart':    {'view': BarChartView,
                                           'options': {isStacked: true}},
                    'treemap':            {'view': TreeMapView},
                    'lineplot':           {'view': LinePlotView},
                    'lineplotmultiple':   {'view': LinePlotView,
                                           'options': {hasMultipleLines: true}},
                    'areachart':          {'view': AreaChartView},
                    'choroplethmap':      {'view': ChoroplethView},
                    'coordinatepointmap': {'view': CoordinatePointMapView},
                    'flowmap':            {'view': FlowMapView},
                    'parallelsets':       {'view': ParallelSetsView},
                    'circularsankey':     {'view': CircularSankeyView}
                }

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
                'click #apply-filters': 'fetchFlows',
                'click #reset-dim-viz': 'resetDimAndVizToDefault',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html)

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
                this.spaceToggle = this.el.querySelector('#dim-toggle-space');
                this.spaceLevelGranSelect = this.el.querySelector('#dim-space-gran-select');
                this.spaceOrigDest = this.el.querySelector('#origDest-toggle-space');
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
                    if (_this.resetInProgres) {
                        return
                    }

                    // //////////////////////////////////////////////////////
                    // Disable dimension toggles for max number of dimensions:
                    _this.checkedDimToggles = [];
                    _this.uncheckedDimToggles = [];
                    _this.selectedDimensionStrings = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.dimensionToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            _this.uncheckedDimToggles.push($(this));
                        } else {
                            _this.checkedDimToggles.push($(this));

                            _this.selectedDimensionStrings.push($(this).attr("data-dim"));
                        }
                    });

                    // If the maximum number of dimensions has been selected:
                    if (_this.maxNumberOfDimensions == _this.checkedDimToggles.length) {
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

                    // ///////////////////////////////////////////////////////////////////
                    // Show available visualizations based on selected dimension(s):
                    let dims = _this.selectedDimensionStrings;
                    if (dims.length > 0) {
                        $(".viz-selector-button").hide();
                        $(".viz-container").fadeIn();
                        _this.vizs[_this.selectedDimensionStrings.join('_')].forEach(function(viz) {
                            $("#viz-" + viz).parent().fadeIn();
                        })

                        // 1D
                        if (dims.length == 1) {
                            // time -> month
                            if ($(_this.timeToggleGran).prop("checked")) {
                                $("#viz-lineplotmultiple").parent().fadeIn();
                            }
                            // space
                            else if (dims.includes("space")) {
                                let selectedAreaLevelId = $(_this.spaceLevelGranSelect).val();
                                let actorAreaLevelId = _this.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                                if (selectedAreaLevelId == actorAreaLevelId) {
                                    $("#viz-coordinatepointmap").parent().fadeIn();
                                } else {
                                    $("#viz-choroplethmap").parent().fadeIn();
                                }
                            }
                        }
                    } else {
                        $("#message-container-row").fadeIn();
                        $(".viz-container").hide();
                    }

                    // If the selected visualization type is hasFlowsFormat, and dimension == treatment method, hide origin/destination toggle:
                    let selectedVizHasFlowsFormat = $(".viz-selector-button.active").hasClass("hasFlowsFormat")
                    // At least two dimensions, and one is treatmentMethod:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("treatmentMethod") && selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-treatment").parent().fadeOut();
                    } else {
                        $("#origDest-toggle-treatment").parent().fadeIn();
                    }

                    // If the selected visualization type is NOT hasFlowsFormat, and dimension == space, show origin/destination toggle:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("space") && !selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeIn();
                    }
                    // If the selected visualization type is hasFlowsFormat, and dimension == space, hide origin/destination toggle:
                    if (_this.selectedDimensionStrings.includes("space") && selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeOut();
                    } else {
                        $("#origDest-toggle-space").parent().fadeIn();
                    }
                    event.preventDefault();
                });

                // Disable origin/destination toggle for Space Treatment method for Flowmap and Parallel Sets
                $(".viz-selector-button").click(function (event) {

                    $('#apply-filters').popover('dispose');

                    let clickedToggleHasFlowsFormat = $($(event.currentTarget)[0]).hasClass("hasFlowsFormat")

                    // At least two dimensions, and one is Space:
                    if ((_this.checkedDimToggles.length > 1) && _this.selectedDimensionStrings.includes("space") && clickedToggleHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeOut();
                    } else {
                        $("#origDest-toggle-space").parent().fadeIn();
                    }

                    // At least two dimensions, and one is treatmentMethod:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("treatmentMethod") && clickedToggleHasFlowsFormat) {
                        $("#origDest-toggle-treatment").parent().fadeOut();
                    } else {
                        $("#origDest-toggle-treatment").parent().fadeIn();
                    }
                    event.preventDefault();
                });

                $(_this.spaceLevelGranSelect).change(function () {
                    let selectedAreaLevelId = $(_this.spaceLevelGranSelect).val();
                    let selectedAreaLevel = _this.areaLevels.models.find(areaLevel => areaLevel.attributes.id.toString() == selectedAreaLevelId).attributes.level;

                    if (_this.selectedDimensionStrings.length == 1 && _this.selectedDimensionStrings.includes("space")) {

                        if (selectedAreaLevel == 1000) {
                            $("#viz-coordinatepointmap").parent().fadeIn();
                            $("#viz-choroplethmap").parent().hide();
                        } else {
                            $("#viz-coordinatepointmap").parent().hide();
                            $("#viz-choroplethmap").parent().fadeIn();
                        }
                    }
                });

                // Show Multiple Line option on dimension Time, granularity Month:
                $(_this.timeToggleGran).change(function () {
                    let granularityIsMonth = $(_this.timeToggleGran).prop("checked");
                    if (granularityIsMonth) {
                        $("#viz-lineplotmultiple").parent().fadeIn();
                    } else if (!granularityIsMonth && _this.selectedDimensionStrings.length == 1) {
                        $("#viz-lineplotmultiple").parent().hide();
                    }
                });

                // Show granularity on toggle change:
                $("#dim-toggle-time").change(function () {
                    $("#gran-toggle-time-col").fadeToggle();
                });
                $("#dim-toggle-space").change(function () {
                    $("#gran-toggle-space-col").fadeToggle();
                    $("#origDest-toggle-space-col").fadeToggle();
                });
                $("#dim-toggle-economic-activity").change(function () {
                    $("#gran-econ-activity-col").fadeToggle();
                    $("#origDest-toggle-econAct-col").fadeToggle();
                });
                $("#dim-toggle-treatment-method").change(function () {
                    $("#gran-treatment-method-col").fadeToggle();
                    $("#origDest-toggle-treatment-col").fadeToggle();
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

                // ///////////////////////////////
                // Format
                let selectedVizualisationString;
                $('.viz-selector-button').each(function (index, value) {
                    if ($(this).hasClass("active")) {
                        selectedVizualisationString = $(this).attr("data-viz");
                    }
                });

                if (selectedVizualisationString) {
                    if (["flowmap", "parallelsets", "circularsankey"].includes(selectedVizualisationString)) {
                        let formatString = selectedVizualisationString;
                        formatString = (formatString == "circularsankey") ? "parallelsets" : formatString;
                        filterParams.format = formatString;
                    }
                }

                // ///////////////////////////////
                // DIMENSIONS
                filterParams.dimensions = {};

                // Time
                if ($(this.timeToggle).prop("checked")) {
                    filterParams.dimensions.time = 'flowchain__month';
                    if (!$(this.timeToggleGran).prop("checked")) {
                        filterParams.dimensions.time += '__year';
                    }
                }

                // Space
                if ($(this.spaceToggle).prop("checked")) {
                    let originOrDestination = $(this.spaceOrigDest).prop("checked") ? 'destination' : 'origin',
                        gran = $('#dim-space-gran-select option:selected').val();
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                // Economic activity
                if ($(this.economicActivityToggle).prop("checked")) {
                    let originOrDestination = $(this.economicActivityOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(this.economicActivityToggleGran).prop("checked") ? 'activity' : 'activity__activitygroup',
                        filterParams.dimensions.economicActivity = originOrDestination + gran;
                }

                // Treatment method
                if ($(this.treatmentMethodToggle).prop("checked")) {
                    let originOrDestination = $(this.treatmentMethodOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(this.treatmentMethodToggleGran).prop("checked") ? 'process' : 'process__processgroup',
                        filterParams.dimensions.treatmentMethod = originOrDestination + gran;
                }

                // Material
                if ($(this.materialToggle).prop("checked")) {
                    let gran = $($(".gran-radio-material-label.active")).attr("data-ewc");
                    filterParams.dimensions.material = 'flowchain__waste06';
                    if (gran === 'ewc4') {
                        filterParams.dimensions.material+= '__waste04'
                    } else if (gran === 'ewc2') {
                        filterParams.dimensions.material += '__waste04__waste02'
                    }
                }


                // Gather impact params for impact mode:
                if (this.mode == "impact") {

                    // Indicator toggle
                    $('.impact-indicator-radio-label').each(function (index, value) {
                        if ($(this).hasClass("active")) {
                            _this.indicator = $(this).attr("data-indicator")
                            filterParams.indicator = _this.indicator;
                        }
                    });

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.impactSourceToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (checked) {
                            _this.impactSourceStrings.push($(this).attr("data-source"));
                        }
                        filterParams.impactSources = _this.impactSourceStrings;
                    });

                }

                console.log(filterParams);
                return filterParams;
            },

            renderVisualizations: function (dimensions, flows) {
                let _this = this;
                let collections = this.filtersView.collections;

                // Enrich flows with info
                let adminlevel = -1;
                dimensions.forEach(function(dimension) {
                    let dimensionString = dimension[0];
                    let granularity = dimension[1];

                    if (dimensionString !== 'space') {
                        if (!['parallelsets', 'circularsankey'].includes(_this.selectedVizName)) {
                            flows = enrichFlows.enrichFlows(flows, collections, granularity);
                        }
                    } else {
                        adminlevel = granularity.adminlevel;
                    }
                })

                // Render visualization
                if (this.vizView != null) this.vizView.close();
                if (_this.selectedVizName === 'lineplotmultiple') {
                    _this.selectedVizName = 'lineplot';
                }
                if (_this.selectedVizName === 'parallelsets') {
                    $(".parallelsets-container").show();
                }
                $("." + _this.selectedVizName + "-wrapper").fadeIn();

                let vizView = this.vizViews[_this.selectedVizName],
                    extraOptions = vizView['options'],
                    defaultOptions = {
                        el: "." + _this.selectedVizName + "-wrapper",
                        dimensions: dimensions,
                        flows: flows,
                        flowsView: this,
                    };

                if (_this.selectedVizName === 'choroplethmap') {
                    let occuringAreas = [];
                    occuringAreas = flows.map(x => x.areaId);
                    occuringAreas = _.unique(occuringAreas);

                    areas = new Collection([], {
                        apiTag: 'areas',
                        apiIds: [adminlevel]
                    });
                    areas.fetch({
                        success: function () {
                            var geoJson = {};
                            geoJson['type'] = 'FeatureCollection';
                            features = geoJson['features'] = [];
                            areas.forEach(function (area) {
                                var feature = {};
                                feature['type'] = 'Feature';
                                feature['id'] = area.get('id')
                                feature['geometry'] = area.get('geom')

                                if (occuringAreas.includes(feature.id)) {
                                    features.push(feature);
                                }
                            })

                            flows.forEach(function (flow, index) {
                                this[index].id = this[index].areaId;
                            }, flows);

                            _this.vizView = new ChoroplethView({
                                el: ".choroplethmap-wrapper",
                                dimensions: dimensions,
                                flows: flows,
                                flowsView: _this,
                                geoJson: geoJson
                            });
                        },
                        error: function (res) {
                            console.log(res);
                        }
                    });
                } else {
                    this.vizView = new vizView['view'](
                        Object.assign(defaultOptions, extraOptions)
                    );
                }
            },

            closeAllVizViews: function () {
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
                        content: "Make sure to select at least one dimension and a visualization type!",
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

                            // Render visualization
                            _this.renderVisualizations(_this.selectedDimensions, _this.flows, _this.selectedVizName);
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
                $(_this.timeToggleGran).bootstrapToggle('off');
                $("#gran-toggle-time-col").hide();

                $(_this.spaceToggle).bootstrapToggle('off');
                $(_this.spaceLevelGranSelect).val($('#dim-space-gran-select:first-child')[0].value);
                $(_this.spaceOrigDest).bootstrapToggle('off');
                $("#gran-toggle-space-col").hide();
                $("#origDest-toggle-space-col").hide();

                $(_this.economicActivityToggle).bootstrapToggle('off');
                $(_this.economicActivityToggleGran).bootstrapToggle('off');
                $(_this.economicActivityOrigDest).bootstrapToggle('off');
                $("#gran-econ-activity-col").hide();
                $("#origDest-toggle-econAct-col").hide();

                $(_this.treatmentMethodToggle).bootstrapToggle('off');
                $(_this.treatmentMethodToggleGran).bootstrapToggle('off');
                $(_this.treatmentMethodOrigDest).bootstrapToggle('off');
                $("#gran-treatment-method-col").hide();
                $("#origDest-toggle-treatment-col").hide();

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