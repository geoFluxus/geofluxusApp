// Flows
define(['views/common/baseview',
        'underscore',
        'views/common/filters',
        'collections/collection',
        'utils/utils',
        'utils/enrichFlows',
        'views/common/flowsankey',
        'views/common/flowsankeymap',
        'views/common/pieChartView',
        'views/common/barChartView',
        'views/common/linePlotView',
        'views/common/treeMapView',
        'views/common/choroplethView',
        'views/common/coordinatePointMapView',
        'views/common/areaChartView',
         'views/common/flowMapView',
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
        utils,
        enrichFlows,
        FlowSankeyView,
        FlowMapView,
        PieChartView,
        BarChartView,
        LinePlotView,
        TreeMapView,
        ChoroplethView,
        CoordinatePointMapView,
        AreaChartView,
        FlowMapView,
    ) {

        var FlowsView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                FlowsView.__super__.initialize.apply(this, [options]);

                this.dimensions = {};
                this.maxNumberOfDimensions = 2;
                this.selectedDimensionStrings = [];

                //_.bindAll(this, 'linkSelected');
                //_.bindAll(this, 'linkDeselected');
                // _.bindAll(this, 'nodeSelected');
                // _.bindAll(this, 'nodeDeselected');
                // _.bindAll(this, 'deselectAll');

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

//                // Activate help icons
//                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
//                $(popovers).popover({
//                    trigger: "focus"
//                });

                // this.sankeyWrapper = this.el.querySelector('.sankey-wrapper');
                // this.sankeyWrapper.addEventListener('linkSelected', this.linkSelected);
                // this.sankeyWrapper.addEventListener('linkDeselected', this.linkDeselected);
                // this.sankeyWrapper.addEventListener('nodeSelected', this.nodeSelected);
                // this.sankeyWrapper.addEventListener('nodeDeselected', this.nodeDeselected);
                // this.sankeyWrapper.addEventListener('allDeselected', this.deselectAll);

                // Render flow filters
                this.renderFiltersView();

                this.initializeControls();

                this.addEventListeners();
            },

            renderFiltersView: function () {
                var el = this.el.querySelector('#filter-content'),
                    _this = this;

                this.filtersView = new FiltersView({
                    el: el,
                    template: 'filter-template',
                });
            },

            initializeControls: function () {

                // Dimension controls:
                this.dimensions.timeToggle = this.el.querySelector('#dim-toggle-time');
                $(this.dimensions.timeToggle).bootstrapToggle();
                this.dimensions.timeToggleGran = this.el.querySelector('#gran-toggle-time');
                $(this.dimensions.timeToggleGran).bootstrapToggle();

                this.dimensions.spaceToggle = this.el.querySelector('#dim-toggle-space');
                $(this.dimensions.spaceToggle).bootstrapToggle();
                this.dimensions.spaceLevelGranSelect = this.el.querySelector('#dim-space-gran-select');
                $(this.dimensions.spaceLevelGranSelect).selectpicker();
                this.dimensions.spaceOrigDest = this.el.querySelector('#origDest-toggle-space');
                $(this.dimensions.spaceOrigDest).bootstrapToggle();

                this.dimensions.economicActivityToggle = this.el.querySelector('#dim-toggle-economic-activity');
                $(this.dimensions.economicActivityToggle).bootstrapToggle();
                this.dimensions.economicActivityToggleGran = this.el.querySelector('#gran-toggle-econ-activity');
                $(this.dimensions.economicActivityToggleGran).bootstrapToggle();
                this.dimensions.economicActivityOrigDest = this.el.querySelector('#origDest-toggle-econAct');
                $(this.dimensions.economicActivityOrigDest).bootstrapToggle();

                this.dimensions.treatmentMethodToggle = this.el.querySelector('#dim-toggle-treatment-method');
                $(this.dimensions.treatmentMethodToggle).bootstrapToggle();
                this.dimensions.treatmentMethodToggleGran = this.el.querySelector('#gran-toggle-treatment-method');
                $(this.dimensions.treatmentMethodToggleGran).bootstrapToggle();
                this.dimensions.treatmentMethodOrigDest = this.el.querySelector('#origDest-toggle-treatment');
                $(this.dimensions.treatmentMethodOrigDest).bootstrapToggle();

                this.dimensions.materialToggle = this.el.querySelector('#dim-toggle-material');
                $(this.dimensions.materialToggle).bootstrapToggle();

                // this.dimensions.logisticsToggle = this.el.querySelector('#dim-toggle-logistics');
                // $(this.dimensions.logisticsToggle).bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // Dimension toggles: ---------------------------

                // Show alert if user clicks on disabled dimension toggle:
                $("#dimensionsCard .toggle.btn").on("click", function (event) {

                    if ($($(event.currentTarget)[0]).is('[disabled=disabled]')) {
                        $("#alertMaxDimensionsRow").fadeIn("fast");
                        $("#alertMaxDimensions").alert();

                        setTimeout(function () {
                            $("#alertMaxDimensionsRow").fadeOut("fast");
                        }, 6000);
                    }
                });

                $(".dimensionToggle").change(function (event) {
                    // //////////////////////////////////////////////////////
                    // Disable dimension toggles for max number of dimensions:
                    let checkedToggles = [];
                    let uncheckedToggles = [];
                    _this.selectedDimensionStrings = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.dimensionToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            uncheckedToggles.push($(this));
                        } else {
                            checkedToggles.push($(this));

                            _this.selectedDimensionStrings.push($(this).attr("data-dim"));
                        }
                    });

                    // If the maximum number of dimensions has been selected:
                    if (_this.maxNumberOfDimensions == checkedToggles.length) {
                        // Disable the remaining unchecked toggles:
                        $(uncheckedToggles).each(function (index, value) {
                            this.bootstrapToggle('disable');
                        });
                    } else {
                        // (Re)enable the toggles:
                        $(uncheckedToggles).each(function (index, value) {
                            this.bootstrapToggle('enable');
                        });
                        $("#alertMaxDimensionsRow").fadeOut("fast");
                    }


                    // ///////////////////////////////////////////////////////////////////
                    // Show available visualizations based on selected dimension(s):

                    console.log(_this.selectedDimensionStrings);

                    switch (checkedToggles.length) {
                        case 0: // No dimensions
                            console.log("No dimensions");

                            $("#message-container-row").fadeIn();
                            $(".viz-container").hide();

                            break;
                        case 1: // One dimension selected
                            // Hide message if shown:
                            $("#message-container-row").hide();
                            // Hide all viz option buttons:
                            $(".viz-selector-button").hide();
                            // Show viz option container:
                            $(".viz-container").fadeIn();

                            // Disable legend by default:
                            //$("#display-legend").prop("checked", false);

                            console.log("One dimension");

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
                            $("#message-container-row").hide();
                            $(".viz-selector-button").hide();
                            $(".viz-container").fadeIn();

                            // Enable legend by default:
                            //$("#display-legend").prop("checked", true);

                            console.log("Two dimensions");

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
                        default:
                            // code block
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
                    if ($(_this.dimensions.timeToggleGran).prop("checked")) {
                        $("#viz-lineplotmultiple").parent().fadeIn();
                    } else if ($(_this.dimensions.timeToggleGran).prop("checked") && _this.selectedDimensionStrings.length == 1) {
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
//
//            // Render the empty Sankey Map
//            renderSankeyMap: function () {
//                this.flowMapView = new FlowMapView({
//                    el: this.el.querySelector('#flow-map'),
//                    //caseStudy: this.caseStudy,
//                    //keyflowId: this.keyflowId,
//                    //materials: this.materials,
//                    //displayWarnings: this.displayWarnings,
//                    //anonymize: this.filter.get('anonymize')
//                });
//            },
//
            postprocess: function (flows) {
                var idx = 0;
                flows.forEach(function (flow) {
                    var origin = flow.get('origin');
                    var destination = flow.get('destination');

                    // API aggregates flows and doesn't return an id. Generate internal ID to assign interactions:
                    flow.set('id', idx);
                    idx++;

                    // Save original amounts to be able to swap amount with delta and back
                    flow._amount = flow.get('amount');

                    // Color:
                    origin.color = utils.colorByName(origin.name);
                    destination.color = utils.colorByName(destination.name);
                })

                this.flows = flows;
                this.draw();
            },

//            draw: function (displayLevel) {
//                this.flowMem = {};
//                if (this.flowMapView != null) this.flowMapView.clear();
//                if (this.flowSankeyView != null) this.flowSankeyView.close();
//                var displayLevel = displayLevel || 'activitygroup';
//
//                this.nodeLevel = displayLevel.toLowerCase();
//
//                var el = this.el.querySelector('.sankey-wrapper');;
//                var _this = this;
//                //var showDelta = this.modDisplaySelect.value === 'delta',
//
//                // function listFlows() {
//                //var flowTable = _this.el.querySelector('#flow_table');
//                // flowTable.innerHTML = '<strong>FLOW MATERIALS</strong>';
//                //var modDisplay = _this.modDisplaySelect.value,
//                //flows = (modDisplay == 'statusquo') ? _this.flows : (modDisplay == 'strategy') ? _this.strategyFlows : _this.deltaFlows;
//                //flows.forEach(function(flow) {
//                //var name = flow.get("materials")[0].name;
//                // var div = document.createElement("div");
//                // if (flowTable.innerHTML.indexOf(name) === -1) {
//                // div.innerHTML = name;
//                //  flowTable.appendChild(div);
//                //}
//                // });
//                // }
//
//                function drawSankey() {
//                    // override value and color
//                    _this.flows.models.forEach(function (flow) {
//                        var amount = flow._amount;
//                        var description = flow.description;
//                        flow.set('amount', amount);
//                        flow.set('description', description);
//                        //flow.color = (!showDelta) ? null : (amount > 0) ? '#23FE01' : 'red';
//                        // var materials = flow.get('materials');
//                        // materials.forEach(function(material){
//                        // material.amount = material._amount;
//                        // })
//                        // flow.set('materials', materials);
//                    });
//                    _this.flowSankeyView = new FlowSankeyView({
//                        el: el,
//                        width: el.clientWidth,
//                        //width: el.clientWidth - 10,
//                        flows: _this.flows.models,
//                        height: 600,
//                        originLevel: displayLevel,
//                        destinationLevel: displayLevel,
//                        //anonymize: _this.filter.get('anonymize'),
//                        //showRelativeComposition: !showDelta,
//                        //forceSignum: showDelta
//                    })
//                }
//                // no need to fetch flows if display level didn't change from last time
//                if (this.displayLevel != displayLevel) {
//                    this.fetchFlows({
//                        displayLevel: displayLevel,
//                        success: function (flows) {
//                            _this.flows = flows;
//                            //drawSankey();
//                        }
//                    })
//                } else {
//                    //listFlows();
//                    drawSankey();
//                }
//                this.displayLevel = displayLevel;
//            },

            // Returns parameters for filtered post-fetching based on assigned filter
            getFlowFilterParams: function () {

                // Prepare filters for request
                let filterParams = this.filtersView.getFilterParams();

                // ///////////////////////////////
                // format
                let selectedVizualisationString;
                $('.viz-selector-button').each(function (index, value) {
                    if ($(this).hasClass("active")) {
                        selectedVizualisationString = $(this).attr("data-viz");
                    }
                });
                if (selectedVizualisationString.includes("flowmap") || selectedVizualisationString.includes("parallelsets")) {
                    filterParams.format = selectedVizualisationString;
                }

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

                console.log(filterParams);
                return filterParams;
            },

            linkSelected: function (e) {
                console.log("Link selected: ", e);
                // only actors atm
                var data = e.detail,
                    _this = this,
                    showDelta = this.modDisplaySelect.value === 'delta';

                if (showDelta) return;

                if (!Array.isArray(data)) data = [data];
                var promises = [];
                this.loader.activate();
                data.forEach(function (d) {

                    // display level actor
                    if (_this.nodeLevel === 'actor') {
                        _this.flowMapView.addFlows(d);
                    }
                    // display level activity or group
                    else {
                        promises.push(_this.addGroupedActors(d));
                    }
                })

                function render() {
                    _this.flowMapView.rerender(true);
                    _this.loader.deactivate();
                }
                if (promises.length > 0) {
                    Promise.all(promises).then(render)
                } else {
                    render();
                }

            },

            // linkDeselected: function (e) {
            //     // only actors atm
            //     var flow = e.detail,
            //         flows = [],
            //         nodes = [];
            //     if (this.nodeLevel === 'actor') {
            //         nodes = [data.origin, data.destination];
            //         flows = flow;
            //     } else {
            //         var mapFlows = this.flowMapView.getFlows();
            //         mapFlows.forEach(function (mapFlow) {
            //             if (mapFlow.parent === flow.id) {
            //                 flows.push(mapFlow);
            //             }
            //         })
            //     };
            //     this.flowMapView.removeFlows(flows);
            //     this.flowMapView.rerender();
            // },

            render1Dvisualizations: function (dimensions, flows, selectedVizualisationString) {
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

                switch (selectedVizualisationString) {
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
                        // If level == actor:

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
                                    features.push(feature)
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

                console.log(flows);
            },

            render2Dvisualizations: function (dimensions, flows, selectedVizualisationString) {
                let _this = this;
                let filtersView = this.filtersView;
                let dimStrings = [];

                let dim1String = dimensions[0][0];
                let gran1 = dimensions[0][1];
                let dim2String = dimensions[1][0];
                let gran2 = dimensions[1][1];

                // Array with dimension strings without Granularity:
                dimensions.forEach(dim => dimStrings.push(dim[0]));

                console.log("Dimensions");
                console.log(dimStrings);

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

                switch (selectedVizualisationString) {
                    case "lineplotmultiple":
                        this.renderLinePlot(dimensions, flows);
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

                console.log(flows);
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

                //this.loader.deactivate();
                //this.flowMapView.addFlows(flows);
                //this.flowMapView.rerender(true);
            },


            closeAllVizViews: function () {
                $(".viz-wrapper-div").fadeOut();
                $(".viz-wrapper-div").html("")
                if (this.barChartView != null) this.barChartView.close();
                if (this.pieChartView != null) this.pieChartView.close();
                if (this.linePlotView != null) this.linePlotView.close();
                if (this.treeMapView != null) this.treeMapView.close();
                if (this.choroplethView != null) this.choroplethView.close();
                if (this.coordinatePointMapView != null) this.coordinatePointMapView.close();
                if (this.areaChartView != null) this.areaChartView.close();
                if (this.flowMapView != null) this.flowMapView.close();
            },

            // Fetch flows and calls options.success(flows) on success
            fetchFlows: function (options) {
                let _this = this;
                let filterParams = this.getFlowFilterParams();
                let data = {};
                let selectedVizualisationString;
                this.selectedDimensions = Object.entries(filterParams.dimensions);

                $('.viz-selector-button').each(function (index, value) {
                    if ($(this).hasClass("active")) {
                        selectedVizualisationString = $(this).attr("data-viz");
                    }
                });

                let flows = new Collection([], {
                    apiTag: 'statusquoflows',
                });

                // Reset all visualizations:
                this.closeAllVizViews();

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

                            switch (_this.selectedDimensions.length) {
                                case 1:
                                    _this.render1Dvisualizations(_this.selectedDimensions, _this.flows, selectedVizualisationString);
                                    break;
                                case 2:
                                    _this.render2Dvisualizations(_this.selectedDimensions, _this.flows, selectedVizualisationString);
                                    break;
                                default:
                                    // Nothing
                            }

                            _this.loader.deactivate();

                            //_this.postprocess(flows);
                            //_this.renderSankeyMap();

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

        });
        return FlowsView;
    });