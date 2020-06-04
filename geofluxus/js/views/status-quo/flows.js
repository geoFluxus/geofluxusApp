// Flows
define(['views/common/baseview',
        'underscore',
        'views/common/filters',
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
        'bootstrap',
        'bootstrap-select',
        'bootstrap-toggle',
        'textarea-autosize',
    ],
    function (
        BaseView,
        _,
        FiltersView,
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
    ) {
        var FlowsView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                FlowsView.__super__.initialize.apply(this, [options]);

                this.dimensions = {};
                this.maxNumberOfDimensions = 2;
                this.selectedDimensionStrings = [];
                this.selectedVizName = "";

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
                    maxNumberOfDimensions: this.maxNumberOfDimensions
                });
                
                // Render flow filters:
                this.renderFiltersView();

                // Activate help icons
                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                $(popovers).popover({
                    trigger: "focus"
                });


                // Dimension and granularity controls:
                this.initializeControls();

                this.addEventListeners();
            },

            renderFiltersView: function () {
                var el = this.el.querySelector('#filter-content');
                this.filtersView = new FiltersView({
                    el: el,
                    template: 'filter-template',
                });
            },

            initializeControls: function () {
                this.dimensions.timeToggle = this.el.querySelector('#dim-toggle-time');
                this.dimensions.timeToggleGran = this.el.querySelector('#gran-toggle-time');
                this.dimensions.spaceToggle = this.el.querySelector('#dim-toggle-space');
                this.dimensions.spaceLevelGranSelect = this.el.querySelector('#dim-space-gran-select');
                this.dimensions.spaceOrigDest = this.el.querySelector('#origDest-toggle-space');
                this.dimensions.economicActivityToggle = this.el.querySelector('#dim-toggle-economic-activity');
                this.dimensions.economicActivityToggleGran = this.el.querySelector('#gran-toggle-econ-activity');
                this.dimensions.economicActivityOrigDest = this.el.querySelector('#origDest-toggle-econAct');
                this.dimensions.treatmentMethodToggle = this.el.querySelector('#dim-toggle-treatment-method');
                this.dimensions.treatmentMethodToggleGran = this.el.querySelector('#gran-toggle-treatment-method');
                this.dimensions.treatmentMethodOrigDest = this.el.querySelector('#origDest-toggle-treatment');
                this.dimensions.materialToggle = this.el.querySelector('#dim-toggle-material');
                
                $(this.dimensions.spaceLevelGranSelect).selectpicker();
                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                $('.viz-selector-button').on("click", function (event) {
                    _this.selectedVizName = $(this).attr("data-viz");
                    event.preventDefault();
                });

                // Dimension toggles: ---------------------------

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

                    switch (_this.checkedDimToggles.length) {
                        case 0: // No dimensions
                            $("#message-container-row").fadeIn();
                            $(".viz-container").hide();
                            break;
                        case 1: // One dimension selected
                            $(".viz-selector-button").hide();
                            $(".viz-container").fadeIn();

                            if (_this.selectedDimensionStrings.includes("time")) {
                                $("#viz-piechart").parent().fadeIn();
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-treemap").parent().fadeIn();
                                $("#viz-lineplot").parent().fadeIn();
                                if ($(_this.dimensions.timeToggleGran).prop("checked")) {
                                    $("#viz-lineplotmultiple").parent().fadeIn();
                                }
                            } else if (_this.selectedDimensionStrings.includes("space")) {
                                $("#viz-piechart").parent().fadeIn();
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-treemap").parent().fadeIn();

                                let selectedAreaLevelId = $(_this.dimensions.spaceLevelGranSelect).val();
                                let actorAreaLevelId = _this.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;

                                if (selectedAreaLevelId == actorAreaLevelId) {
                                    $("#viz-coordinatepointmap").parent().fadeIn();
                                } else {
                                    $("#viz-choroplethmap").parent().fadeIn();
                                }

                            } else if (_this.selectedDimensionStrings.includes("economicActivity")) {
                                $("#viz-piechart").parent().fadeIn();
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-treemap").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("treatmentMethod")) {
                                $("#viz-piechart").parent().fadeIn();
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-treemap").parent().fadeIn();
                                $("#viz-parallelsets").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("material")) {
                                $("#viz-piechart").parent().fadeIn();
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-treemap").parent().fadeIn();
                            }
                            break;

                        case 2: // Two dimensions:
                            $(".viz-selector-button").hide();
                            $(".viz-container").fadeIn();

                            // Time & Space
                            if (_this.selectedDimensionStrings.includes("time") && _this.selectedDimensionStrings.includes("space")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-lineplotmultiple").parent().fadeIn();
                                $("#viz-areachart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();

                                $("#viz-flowmap").parent().fadeIn();
                                // Time & Economic Activity
                            } else if (_this.selectedDimensionStrings.includes("time") && _this.selectedDimensionStrings.includes("economicActivity")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-lineplotmultiple").parent().fadeIn();
                                $("#viz-areachart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                // Time & Treatment Method
                            } else if (_this.selectedDimensionStrings.includes("time") && _this.selectedDimensionStrings.includes("treatmentMethod")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-lineplotmultiple").parent().fadeIn();
                                $("#viz-areachart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("time") && _this.selectedDimensionStrings.includes("material")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-lineplotmultiple").parent().fadeIn();
                                $("#viz-areachart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("space") && _this.selectedDimensionStrings.includes("economicActivity")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-flowmap").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("space") && _this.selectedDimensionStrings.includes("treatmentMethod")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-flowmap").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("space") && _this.selectedDimensionStrings.includes("material")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-flowmap").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("economicActivity") && _this.selectedDimensionStrings.includes("treatmentMethod")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-parallelsets").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("economicActivity") && _this.selectedDimensionStrings.includes("material")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-parallelsets").parent().fadeIn();
                            } else if (_this.selectedDimensionStrings.includes("material") && _this.selectedDimensionStrings.includes("treatmentMethod")) {
                                $("#viz-barchart").parent().fadeIn();
                                $("#viz-stackedbarchart").parent().fadeIn();
                                $("#viz-parallelsets").parent().fadeIn();
                            }
                            break;
                        case 3: // Three dimensions:
                            // $(".viz-selector-button").hide();
                            // $(".viz-container").fadeIn();

                            //console.log("Three  dimensions");


                            break;
                        default:
                            // code block
                    }

                    // If the selected visualization type is hasFlowsFormat, and dimension == treatment method, hide origin/destination toggle:
                    let selectedVizHasFlowsFormat = $(".viz-selector-button.active").hasClass("hasFlowsFormat")
                    // At least two dimensions, and one is treatmentMethod:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("treatmentMethod") && selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-treatment").parent().fadeOut();
                        event.preventDefault();
                    } else {
                        $("#origDest-toggle-treatment").parent().fadeIn();
                        event.preventDefault();
                    }

                    // If the selected visualization type is NOT hasFlowsFormat, and dimension == space, show origin/destination toggle:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("space") && !selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeIn();
                        event.preventDefault();
                    }
                    // If the selected visualization type is hasFlowsFormat, and dimension == space, hide origin/destination toggle:                    
                    if (_this.selectedDimensionStrings.includes("space") && selectedVizHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeOut();
                    } else {
                        $("#origDest-toggle-space").parent().fadeIn();
                        event.preventDefault();
                    }
                });

                // Disable origin/destination toggle for Space Treatment method for Flowmap and Parallel Sets
                $(".viz-selector-button").click(function (event) {

                    let clickedToggleHasFlowsFormat = $($(event.currentTarget)[0]).hasClass("hasFlowsFormat")

                    // At least two dimensions, and one is Space:
                    if ((_this.checkedDimToggles.length > 1) && _this.selectedDimensionStrings.includes("space") && clickedToggleHasFlowsFormat) {
                        $("#origDest-toggle-space").parent().fadeOut();
                        event.preventDefault();
                    } else {
                        $("#origDest-toggle-space").parent().fadeIn();
                        event.preventDefault();
                    }

                    // At least two dimensions, and one is treatmentMethod:
                    if ((_this.checkedDimToggles.length == 1) && _this.selectedDimensionStrings.includes("treatmentMethod") && clickedToggleHasFlowsFormat) {
                        $("#origDest-toggle-treatment").parent().fadeOut();
                        event.preventDefault();
                    } else {
                        $("#origDest-toggle-treatment").parent().fadeIn();
                        event.preventDefault();
                    }
                });

                $(_this.dimensions.spaceLevelGranSelect).change(function () {
                    let selectedAreaLevelId = $(_this.dimensions.spaceLevelGranSelect).val();
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
                $(_this.dimensions.timeToggleGran).change(function () {
                    let granularityIsMonth = $(_this.dimensions.timeToggleGran).prop("checked");
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
                if (_this.selectedVizName) {
                    if (_this.selectedVizName.includes("flowmap") || _this.selectedVizName.includes("parallelsets")) {
                        filterParams.format = _this.selectedVizName;
                    }
                }

                // ///////////////////////////////
                // DIMENSIONS
                filterParams.dimensions = {};

                // Time
                if ($(this.dimensions.timeToggle).prop("checked")) {
                    var timeFilter = 'flowchain__month',
                        gran = $(this.dimensions.timeToggleGran).prop("checked") ? 'month' : 'year';
                    if (gran == 'year') {
                        timeFilter += '__year';
                    }
                    filterParams.dimensions.time = timeFilter;
                }

                // Space
                if ($(this.dimensions.spaceToggle).prop("checked")) {
                    let originOrDestination = $(this.dimensions.spaceOrigDest).prop("checked") ? 'destination' : 'origin',
                        gran = $('#dim-space-gran-select option:selected').val();
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                // Economic activity
                if ($(this.dimensions.economicActivityToggle).prop("checked")) {
                    let originOrDestination = $(this.dimensions.economicActivityOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(this.dimensions.economicActivityToggleGran).prop("checked") ? 'activity' : 'activity__activitygroup',
                        filterParams.dimensions.economicActivity = originOrDestination + gran;
                }

                // Treatment method
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

                console.log(filterParams);
                return filterParams;
            },

            render1Dvisualizations: function (dimensions, flows) {
                let _this = this;
                let filtersView = this.filtersView;
                let dimensionString = dimensions[0][0];
                let granularity = dimensions[0][1];


                switch (dimensionString) {
                    case "time":
                        flows = enrichFlows.enrichTime(flows, filtersView, granularity);
                        break;
                    case "space":
                        // Set isActorLevel if necessary:
                        let actorAreaLevelId = filtersView.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                        if (granularity.adminlevel == actorAreaLevelId) {
                            dimensions.isActorLevel = true;
                        }
                        break;
                    case "economicActivity":
                        flows = enrichFlows.enrichEconActivity(flows, filtersView, granularity);
                        break;
                    case "treatmentMethod":
                        flows = enrichFlows.enrichTreatmentMethod(flows, filtersView, granularity);
                        break;
                    case "material":
                        flows = enrichFlows.enrichEWC(flows, filtersView, granularity);
                        break;
                    default:
                        // Nothing
                }

                switch (_this.selectedVizName) {
                    case "piechart":
                        this.renderPieChart(dimensions, flows);
                        break;
                    case "barchart":
                        this.renderBarChart(dimensions, flows);
                        break;
                    case "lineplot":
                        this.renderLinePlot(dimensions, flows);
                        break;
                    case "treemap":
                        this.renderTreeMap(dimensions, flows);
                        break;
                    case "lineplotmultiple":
                        this.renderLinePlot(dimensions, flows, true);
                        break;
                    case "choroplethmap":
                        let occuringAreas = [];
                        occuringAreas = flows.map(x => x.areaId);
                        occuringAreas = _.unique(occuringAreas);

                        areas = new Collection([], {
                            apiTag: 'areas',
                            apiIds: [granularity.adminlevel]
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
                                        features.push(feature)
                                    }
                                })

                                flows.forEach(function (flow, index) {
                                    this[index].id = this[index].areaId;
                                }, flows);

                                _this.renderChoropleth1D(dimensions, flows, geoJson);
                            },
                            error: function (res) {
                                console.log(res);
                            }
                        });
                        break;
                    case "coordinatepointmap": // Only in case of Actor
                        _this.renderCoordinatePointMap1D(dimensions, flows);
                        break;
                    default:
                        // Nothing
                }

                // console.log(flows);
            },

            render2Dvisualizations: function (dimensions, flows) {
                let _this = this;
                let filtersView = this.filtersView;
                let dimStrings = [];

                let dim1String = dimensions[0][0];
                let gran1 = dimensions[0][1];
                let dim2String = dimensions[1][0];
                let gran2 = dimensions[1][1];

                // Array with dimension strings without Granularity:
                dimensions.forEach(dim => dimStrings.push(dim[0]));

                //console.log("Dimensions");
                //console.log(dimStrings);

                // Time & Space
                if (dimStrings.includes("time") && dimStrings.includes("space")) {

                    flows = enrichFlows.enrichTime(flows, filtersView, gran1);
                    // Actor level:

                    let actorAreaLevelId = filtersView.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                    if (dimensions[1][1].adminlevel == actorAreaLevelId) {
                        dimensions.isActorLevel = true;
                    }

                    // Time & Economic Activity
                } else if (dimStrings.includes("time") && dimStrings.includes("economicActivity")) {

                    flows = enrichFlows.enrichTime(flows, filtersView, gran1);
                    flows = enrichFlows.enrichEconActivity(flows, filtersView, gran2);

                    // Time & Treatment method
                } else if (dimStrings.includes("time") && dimStrings.includes("treatmentMethod")) {

                    flows = enrichFlows.enrichTime(flows, filtersView, gran1);
                    flows = enrichFlows.enrichTreatmentMethod(flows, filtersView, gran2);

                    // Time & Material
                } else if (dimStrings.includes("time") && dimStrings.includes("material")) {

                    flows = enrichFlows.enrichTime(flows, filtersView, gran1);
                    flows = enrichFlows.enrichEWC(flows, filtersView, gran2);

                    // Space & Economic Activity
                } else if (dimStrings.includes("space") && dimStrings.includes("economicActivity")) {

                    // If level == actor:
                    let actorAreaLevelId = filtersView.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                    if (gran1.adminlevel == actorAreaLevelId) {
                        dimensions.isActorLevel = true;
                    }

                    flows = enrichFlows.enrichEconActivity(flows, filtersView, gran2);

                    // Space & Treatment Method
                } else if (dimStrings.includes("space") && dimStrings.includes("treatmentMethod")) {

                    // If level == actor:
                    let actorAreaLevelId = filtersView.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                    if (gran1.adminlevel == actorAreaLevelId) {
                        dimensions.isActorLevel = true;
                    }

                    flows = enrichFlows.enrichTreatmentMethod(flows, filtersView, gran2);

                    // Space & Material
                } else if (dimStrings.includes("space") && dimStrings.includes("material")) {

                    // If level == actor:
                    let actorAreaLevelId = filtersView.areaLevels.models.find(areaLevel => areaLevel.attributes.level == "1000").attributes.id;
                    if (gran1.adminlevel == actorAreaLevelId) {
                        dimensions.isActorLevel = true;
                    }

                    flows = enrichFlows.enrichEWC(flows, filtersView, gran2);

                    // Economic Activity & Treatment Method
                } else if (dimStrings.includes("economicActivity") && dimStrings.includes("treatmentMethod")) {

                    flows = enrichFlows.enrichEconActivity(flows, filtersView, gran1);
                    flows = enrichFlows.enrichTreatmentMethod(flows, filtersView, gran2);

                    // Economic Activity & Material
                } else if (dimStrings.includes("economicActivity") && dimStrings.includes("material")) {

                    flows = enrichFlows.enrichEconActivity(flows, filtersView, gran1);
                    flows = enrichFlows.enrichEWC(flows, filtersView, gran2);
                }

                switch (_this.selectedVizName) {
                    case "lineplotmultiple":
                        this.renderLinePlot(dimensions, flows, true);
                        break;
                    case "areachart":
                        this.renderAreaChart(dimensions, flows);
                        break;
                    case "barchart":
                        this.renderBarChart(dimensions, flows);
                        break;
                    case "stackedbarchart":
                        this.renderBarChart(dimensions, flows, true);
                        break;
                    case "flowmap":
                        this.renderFlowMap(dimensions, flows);
                        break;
                    default:
                        // Nothing
                }

                // console.log(flows);
            },

            renderPieChart: function (dimensions, flows) {
                if (this.pieChartView != null) this.pieChartView.close();

                $(".piechart-wrapper").fadeIn();

                this.pieChartView = new PieChartView({
                    el: ".piechart-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderTreeMap: function (dimensions, flows) {
                if (this.treeMapView != null) this.treeMapView.close();

                $(".treemap-wrapper").fadeIn();

                this.treeMapView = new TreeMapView({
                    el: ".treemap-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderBarChart: function (dimensions, flows, isStacked) {
                if (this.barChartView != null) this.barChartView.close();

                $(".barchart-wrapper").fadeIn();

                this.barChartView = new BarChartView({
                    el: ".barchart-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                    isStacked: isStacked,
                });
            },

            renderLinePlot: function (dimensions, flows, hasMultipleLines) {
                if (this.linePlotView != null) this.linePlotView.close();

                $(".lineplot-wrapper").fadeIn();

                this.linePlotView = new LinePlotView({
                    el: ".lineplot-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                    hasMultipleLines: hasMultipleLines,
                });
            },

            renderChoropleth1D: function (dimensions, flows, geoJson) {
                if (this.choroplethView != null) this.choroplethView.close();

                $(".choropleth-wrapper").fadeIn();

                this.choroplethView = new ChoroplethView({
                    el: ".choropleth-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                    geoJson: geoJson,
                });
            },

            renderCoordinatePointMap1D: function (dimensions, flows) {
                if (this.coordinatePointMapView != null) this.coordinatePointMapView.close();

                $(".coordinatepointmap-wrapper").fadeIn();

                this.coordinatePointMapView = new CoordinatePointMapView({
                    el: ".coordinatepointmap-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderAreaChart: function (dimensions, flows) {
                if (this.areaChartView != null) this.areaChartView.close();

                $(".areachart-wrapper").fadeIn();

                this.areaChartView = new AreaChartView({
                    el: ".areachart-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderFlowMap: function (dimensions, flows) {
                if (this.flowMapView != null) this.flowMapView.close();

                $(".flowmap-wrapper").fadeIn();

                this.flowMapView = new FlowMapView({
                    el: ".flowmap-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderParallelSets: function (dimensions, flows) {
                if (this.parallelSetsView != null) this.parallelSetsView.close();

                $(".parallelsets-container").show();
                $(".parallelsets-wrapper").fadeIn();

                this.parallelSetsView = new ParallelSetsView({
                    el: ".parallelsets-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            closeAllVizViews: function () {
                $(".viz-wrapper-div").removeClass("lightMode");
                $(".viz-wrapper-div").fadeOut();
                $(".viz-wrapper-div").html("")
                $(".parallelsets-container").hide();
                if (this.barChartView != null) this.barChartView.close();
                if (this.pieChartView != null) this.pieChartView.close();
                if (this.linePlotView != null) this.linePlotView.close();
                if (this.treeMapView != null) this.treeMapView.close();
                if (this.choroplethView != null) this.choroplethView.close();
                if (this.coordinatePointMapView != null) this.coordinatePointMapView.close();
                if (this.areaChartView != null) this.areaChartView.close();
                if (this.flowMapView != null) this.flowMapView.close();
                if (this.parallelSetsView != null) this.parallelSetsView.close();
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
                        apiTag: 'statusquoflows',
                    });
                    flows.postfetch({
                        data: data,
                        body: filterParams,
                        success: function (response) {
                            _this.flows = flows.models;

                            _this.flows.forEach(function (flow, index) {
                                this[index] = flow.attributes;
                            }, _this.flows);

                            try {
                                // Only Parallel Sets requires different processing: 
                                if (_this.selectedVizName == "parallelsets") {
                                    _this.renderParallelSets(_this.selectedDimensions, _this.flows);
                                } else {
                                    switch (_this.selectedDimensions.length) {
                                        case 1:
                                            _this.render1Dvisualizations(_this.selectedDimensions, _this.flows);
                                            break;
                                        case 2:
                                            _this.render2Dvisualizations(_this.selectedDimensions, _this.flows);
                                            break;
                                    }
                                }
                            } catch (renderError) {
                                console.log("Error during rendering of visualization: " + renderError)
                                _this.loader.deactivate();
                            }

                            //_this.loader.deactivate();
                        },
                        error: function (error) {
                            _this.loader.deactivate();
                            console.log(error);
                            //_this.onError(error);
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

                $(_this.dimensions.timeToggle).bootstrapToggle('off');
                $(_this.dimensions.timeToggleGran).bootstrapToggle('off');
                $("#gran-toggle-time-col").hide();

                $(_this.dimensions.spaceToggle).bootstrapToggle('off');
                $(_this.dimensions.spaceLevelGranSelect).val($('#dim-space-gran-select:first-child')[0].value);
                $(_this.dimensions.spaceOrigDest).bootstrapToggle('off');
                $("#gran-toggle-space-col").hide();
                $("#origDest-toggle-space-col").hide();

                $(_this.dimensions.economicActivityToggle).bootstrapToggle('off');
                $(_this.dimensions.economicActivityToggleGran).bootstrapToggle('off');
                $(_this.dimensions.economicActivityOrigDest).bootstrapToggle('off');
                $("#gran-econ-activity-col").hide();
                $("#origDest-toggle-econAct-col").hide();

                $(_this.dimensions.treatmentMethodToggle).bootstrapToggle('off');
                $(_this.dimensions.treatmentMethodToggleGran).bootstrapToggle('off');
                $(_this.dimensions.treatmentMethodOrigDest).bootstrapToggle('off');
                $("#gran-treatment-method-col").hide();
                $("#origDest-toggle-treatment-col").hide();

                $(_this.dimensions.materialToggle).bootstrapToggle('off');
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

        });
        return FlowsView;
    });