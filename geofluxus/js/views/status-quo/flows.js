// Flows
define(['views/common/baseview',
        'underscore',
        'views/status-quo/filter-flows',
        'collections/collection',
        'utils/utils',
        'views/common/flowsankey',
        'views/common/flowsankeymap',
        'views/common/pieChartView',
        'views/common/barChartView',
        'views/common/linePlotView',
        'views/common/treeMapView',
        'views/common/choroplethView',
    ],
    function (
        BaseView,
        _,
        FilterFlowsView,
        Collection,
        utils,
        FlowSankeyView,
        FlowMapView,
        PieChartView,
        BarChartView,
        LinePlotView,
        TreeMapView,
        ChoroplethView,
    ) {

        var FlowsView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                FlowsView.__super__.initialize.apply(this, [options]);

                this.selectedDimensions = [];

                //_.bindAll(this, 'linkSelected');
                //_.bindAll(this, 'linkDeselected');
                // _.bindAll(this, 'nodeSelected');
                // _.bindAll(this, 'nodeDeselected');
                // _.bindAll(this, 'deselectAll');

                this.render();
            },

            // DOM events
            events: {
                'click #apply-filters': 'fetchFlows',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html)

                this.el.innerHTML = template();


                // this.sankeyWrapper = this.el.querySelector('.sankey-wrapper');
                // this.sankeyWrapper.addEventListener('linkSelected', this.linkSelected);
                // this.sankeyWrapper.addEventListener('linkDeselected', this.linkDeselected);
                // this.sankeyWrapper.addEventListener('nodeSelected', this.nodeSelected);
                // this.sankeyWrapper.addEventListener('nodeDeselected', this.nodeDeselected);
                // this.sankeyWrapper.addEventListener('allDeselected', this.deselectAll);


                // Render flow filters
                this.renderFilterFlowsView();
            },

            renderFilterFlowsView: function () {
                var el = this.el.querySelector('#flows-content'),
                    _this = this;

                this.filterFlowsView = new FilterFlowsView({
                    el: el,
                    template: 'filter-flows-template',
                });
            },

            // Render the empty Sankey Map
            renderSankeyMap: function () {
                this.flowMapView = new FlowMapView({
                    el: this.el.querySelector('#flow-map'),
                    //caseStudy: this.caseStudy,
                    //keyflowId: this.keyflowId,
                    //materials: this.materials,
                    //displayWarnings: this.displayWarnings,
                    //anonymize: this.filter.get('anonymize')
                });
            },

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

            draw: function (displayLevel) {
                this.flowMem = {};
                if (this.flowMapView != null) this.flowMapView.clear();
                if (this.flowSankeyView != null) this.flowSankeyView.close();
                var displayLevel = displayLevel || 'activitygroup';

                this.nodeLevel = displayLevel.toLowerCase();

                var el = this.el.querySelector('.sankey-wrapper');;
                var _this = this;
                //var showDelta = this.modDisplaySelect.value === 'delta',

                // function listFlows() {
                //var flowTable = _this.el.querySelector('#flow_table');
                // flowTable.innerHTML = '<strong>FLOW MATERIALS</strong>';
                //var modDisplay = _this.modDisplaySelect.value,
                //flows = (modDisplay == 'statusquo') ? _this.flows : (modDisplay == 'strategy') ? _this.strategyFlows : _this.deltaFlows;
                //flows.forEach(function(flow) {
                //var name = flow.get("materials")[0].name;
                // var div = document.createElement("div");
                // if (flowTable.innerHTML.indexOf(name) === -1) {
                // div.innerHTML = name;
                //  flowTable.appendChild(div);
                //}
                // });
                // }

                function drawSankey() {
                    // override value and color
                    _this.flows.models.forEach(function (flow) {
                        var amount = flow._amount;
                        var description = flow.description;
                        flow.set('amount', amount);
                        flow.set('description', description);
                        //flow.color = (!showDelta) ? null : (amount > 0) ? '#23FE01' : 'red';
                        // var materials = flow.get('materials');
                        // materials.forEach(function(material){
                        // material.amount = material._amount;
                        // })
                        // flow.set('materials', materials);
                    });
                    _this.flowSankeyView = new FlowSankeyView({
                        el: el,
                        width: el.clientWidth,
                        //width: el.clientWidth - 10,
                        flows: _this.flows.models,
                        height: 600,
                        originLevel: displayLevel,
                        destinationLevel: displayLevel,
                        //anonymize: _this.filter.get('anonymize'),
                        //showRelativeComposition: !showDelta,
                        //forceSignum: showDelta
                    })
                }
                // no need to fetch flows if display level didn't change from last time
                if (this.displayLevel != displayLevel) {
                    this.fetchFlows({
                        displayLevel: displayLevel,
                        success: function (flows) {
                            _this.flows = flows;
                            //drawSankey();
                        }
                    })
                } else {
                    //listFlows();
                    drawSankey();
                }
                this.displayLevel = displayLevel;
            },

            // Returns parameters for filtered post-fetching based on assigned filter
            getFlowFilterParams: function () {

                // Prepare filters for request
                let filter = this.filterFlowsView;

                let filterParams = {
                    origin: {},
                    destination: {},
                    flows: {},
                    dimensions: {}
                }

                // ///////////////////////////////
                // ORIGIN

                if (filter.selectedAreasOrigin !== undefined &&
                    filter.selectedAreasOrigin.length > 0) {
                    filterParams.origin.selectedAreas = [];
                    filter.selectedAreasOrigin.forEach(function (area) {
                        filterParams.origin.selectedAreas.push(area.id);
                    });
                }
                if ($(filter.origin.inOrOut).prop('checked')) {
                    filterParams.origin.inOrOut = 'out';
                } else {
                    filterParams.origin.inOrOut = 'in';
                }
                if (filter.origin.role != 'both') {
                    filterParams.flows['origin_role'] = filter.origin.role;
                }
                if ($(filter.origin.activitySelect).val() == '-1') {
                    if ($(filter.origin.activityGroupsSelect).val() != '-1') {
                        filterParams.flows['origin__activity__activitygroup__in'] = $(filter.origin.activityGroupsSelect).val();
                    }
                } else {
                    filterParams.flows['origin__activity__in'] = $(filter.origin.activitySelect).val();
                }

                if ($(filter.origin.processSelect).val() == '-1') {
                    if ($(filter.origin.processGroupSelect).val() != '-1') {
                        filterParams.flows['origin__process__processgroup__in'] = $(filter.origin.processGroupSelect).val();
                    }
                } else {
                    filterParams.flows['origin__process__in'] = $(filter.origin.processSelect).val();
                }


                // ///////////////////////////////
                // DESTINATION

                if (filter.selectedAreasDestination !== undefined &&
                    filter.selectedAreasDestination.length > 0) {
                    filterParams.destination.selectedAreas = [];
                    filter.selectedAreasDestination.forEach(function (area) {
                        filterParams.destination.selectedAreas.push(area.id);
                    });
                }
                if ($(filter.destination.inOrOut).prop('checked')) {
                    filterParams.destination.inOrOut = 'out';
                } else {
                    filterParams.destination.inOrOut = 'in';
                }
                if (filter.destination.role != 'both') {
                    filterParams.flows['destination_role'] = filter.destination.role;
                }
                if ($(filter.destination.activitySelect).val() == '-1') {
                    if ($(filter.destination.activityGroupsSelect).val() != '-1') {
                        filterParams.flows['destination__activity__activitygroup__in'] = $(filter.destination.activityGroupsSelect).val();
                    }
                } else {
                    filterParams.flows['destination__activity__in'] = $(filter.destination.activitySelect).val();
                }

                if ($(filter.destination.processSelect).val() == '-1') {
                    if ($(filter.destination.processGroupSelect).val() != '-1') {
                        filterParams.flows['destination__process__processgroup__in'] = $(filter.destination.processGroupSelect).val();
                    }
                } else {
                    filterParams.flows['destination__process__in'] = $(filter.destination.processSelect).val();
                }

                // ///////////////////////////////
                // FLOWS
                if (filter.selectedAreasFlows !== undefined &&
                    filter.selectedAreasFlows.length > 0) {
                    filterParams.flows.selectedAreas = [];
                    filter.selectedAreasFlows.forEach(function (area) {
                        filterParams.flows.selectedAreas.push(area.id);
                    });
                }

                // Year
                let year = $(filter.flows.yearSelect).val();
                let month = $(filter.flows.monthSelect).val();

                if (year[0] !== "-1") {
                    if (month == "-1") {
                        filterParams.flows['flowchain__month__year__in'] = year;
                    } else {
                        filterParams.flows['flowchain__month__in'] = month;
                    }
                }

                // Wastes
                let wastes02 = $(filter.flows.waste02Select).val();
                let wastes04 = $(filter.flows.waste04Select).val();
                let wastes06 = $(filter.flows.waste06Select).val();

                // Waste02 is not All:
                if (wastes02[0] !== "-1") {
                    // Waste04 is All, so send Waste02:
                    if (wastes04[0] == "-1") {
                        filterParams.flows['flowchain__waste06__waste04__waste02__in'] = wastes02;
                    } else {
                        // Waste06 is All, so send Waste04
                        if (wastes06[0] == "-1") {
                            filterParams.flows['flowchain__waste06__waste04__in'] = wastes04;
                        } else {
                            // Send Waste06:
                            filterParams.flows['flowchain__waste06__in'] = wastes06;
                        }
                    }
                }

                // Materials
                let materials = $(filter.flows.materialSelect).val();
                if (materials[0] !== "-1") {
                    filterParams.flows['flowchain__materials__in'] = materials;
                }

                // Products
                let products = $(filter.flows.productSelect).val();
                if (products[0] !== "-1") {
                    filterParams.flows['flowchain__products__in'] = products;
                }

                // Composites
                let composites = $(filter.flows.compositesSelect).val();
                if (composites[0] !== "-1") {
                    filterParams.flows['flowchain__composites__in'] = composites;
                }

                // isRoute
                let route = $(filter.flows.routeSelect).val();
                if (route != 'both') {
                    let is_route = (route == 'yes') ? true : false;
                    filterParams.flows['flowchain__route'] = is_route;
                }

                // isCollector
                let collector = $(filter.flows.collectorSelect).val();
                if (collector != 'both') {
                    let is_collector = (collector == 'yes') ? true : false;
                    filterParams.flows['flowchain__collector'] = is_collector;
                }

                // isHazardous
                let hazardous = $(filter.flows.hazardousSelect).val();
                if (hazardous != 'both') {
                    let is_hazardous = (hazardous == 'yes') ? true : false;
                    filterParams.flows['flowchain__waste06__hazardous'] = is_hazardous;
                }

                // isClean
                let clean = $(filter.flows.cleanSelect).val();
                if (clean[0] !== "-1") {
                    var options = [];
                    clean.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_clean = (option == 'yes') ? true : false;
                            options.push(is_clean);
                        }
                    })
                    filterParams.flows['clean'] = options;
                }

                // isMixed
                let mixed = $(filter.flows.mixedSelect).val();
                if (mixed[0] !== "-1") {
                    var options = [];
                    mixed.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_mixed = (option == 'yes') ? true : false;
                            options.push(is_mixed);
                        }
                    })
                    filterParams.flows['mixed'] = options;
                }

                // isDirectUse
                let direct = $(filter.flows.directSelect).val();
                if (direct[0] !== "-1") {
                    var options = [];
                    direct.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_direct = (option == 'yes') ? true : false;
                            options.push(is_direct);
                        }
                    })
                    filterParams.flows['direct'] = options;
                }

                // isComposite
                let composite = $(filter.flows.isCompositeSelect).val();
                if (composite[0] !== "-1") {
                    var options = [];
                    composite.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_composite = (option == 'yes') ? true : false;
                            options.push(is_composite);
                        }
                    })
                    filterParams.flows['composite'] = options;
                }

                // ///////////////////////////////
                // DIMENSIONS

                if ($(filter.dimensions.timeToggle).prop("checked")) {
                    var timeFilter,
                        gran = $(filter.dimensions.timeToggleGran).prop("checked") ? 'month' : 'year';
                    if (gran == 'month') {
                        timeFilter = 'flowchain__month';
                    } else {
                        timeFilter = 'flowchain__month__year';
                    }
                    filterParams.dimensions.time = timeFilter;
                }

                if ($(filter.dimensions.spaceToggle).prop("checked")) {
                    let originOrDestination = $(filter.dimensions.spaceOrigDest).prop("checked") ? 'destination__geom' : 'origin__geom',
                        gran = $('#dim-space-gran-select option:selected').val();
                    filterParams.dimensions.space = {};
                    filterParams.dimensions.space.adminlevel = gran;
                    filterParams.dimensions.space.field = originOrDestination;
                }

                if ($(filter.dimensions.economicActivityToggle).prop("checked")) {
                    let originOrDestination = $(filter.dimensions.economicActivityOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(filter.dimensions.economicActivityToggleGran).prop("checked") ? 'activity' : 'activity__activitygroup',
                        filterParams.dimensions.economicActivity = originOrDestination + gran;
                }

                if ($(filter.dimensions.treatmentMethodToggle).prop("checked")) {
                    let originOrDestination = $(filter.dimensions.treatmentMethodOrigDest).prop("checked") ? 'destination__' : 'origin__';
                    gran = $(filter.dimensions.treatmentMethodToggleGran).prop("checked") ? 'process' : 'process__processgroup',
                        filterParams.dimensions.treatmentMethod = originOrDestination + gran;
                }

                // ORIGIN OR DESTINATION FILTERS
                // $(_this.dimensions.spaceOrigDest).prop("checked")
                // $(_this.dimensions.economicActivityOrigDest).prop("checked")
                // $(_this.dimensions.treatmentMethodOrigDest).prop("checked")




                console.log(filterParams);

                return filterParams;
            },

            // linkSelected: function (e) {
            //     console.log("Link selected: ", e);
            //     // only actors atm
            //     var data = e.detail,
            //         _this = this,
            //         showDelta = this.modDisplaySelect.value === 'delta';

            //     if (showDelta) return;

            //     if (!Array.isArray(data)) data = [data];
            //     var promises = [];
            //     this.loader.activate();
            //     data.forEach(function (d) {

            //         // display level actor
            //         if (_this.nodeLevel === 'actor') {
            //             _this.flowMapView.addFlows(d);
            //         }
            //         // display level activity or group
            //         else {
            //             promises.push(_this.addGroupedActors(d));
            //         }
            //     })

            //     function render() {
            //         _this.flowMapView.rerender(true);
            //         _this.loader.deactivate();
            //     }
            //     if (promises.length > 0) {
            //         Promise.all(promises).then(render)
            //     } else {
            //         render();
            //     }

            // },

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
                let filterFlowsView = this.filterFlowsView;

                // Enrich data here
                if (dimensions[0][0] == "time") {
                    let years = filterFlowsView.years.models;
                    let months = filterFlowsView.months.models;

                    // Granularity = year
                    if (dimensions[0][1] == "flowchain__month__year") {

                        flows.forEach(function (flow, index) {
                            let yearObject = years.find(year => year.attributes.id == flow.year);

                            this[index].id = this[index].year;
                            this[index].year = parseInt(yearObject.attributes.code);
                        }, flows);

                        flows = _.sortBy(flows, 'year');

                        // Granularity = month:
                    } else if (dimensions[0][1] == "flowchain__month") {

                        flows.forEach(function (flow, index) {
                            let monthObject = months.find(month => month.attributes.id == flow.month);

                            this[index].id = monthObject.attributes.id;
                            this[index].month = utils.returnMonthString(monthObject.attributes.code.substring(0, 2)) + " " + monthObject.attributes.code.substring(2, 6);
                            this[index].yearMonthCode = parseInt(monthObject.attributes.code.substring(2, 6) + monthObject.attributes.code.substring(0, 2));
                            this[index].year = parseInt(monthObject.attributes.code.substring(2, 6));
                        }, flows);

                        flows = _.sortBy(flows, 'id');
                    }

                    switch (selectedVizualisationString) {
                        case "piechart":
                            this.renderPieChart1D(dimensions, flows);
                            break;
                        case "barchart":
                            this.renderBarChart1D(dimensions, flows);
                            break;
                        case "lineplot":
                            this.renderLinePlot1D(dimensions, flows);
                            break;
                        case "treemap":
                            this.renderTreeMap1D(dimensions, flows);
                            break;
                        default:
                            // Nothing
                    }

                    // /////////////////////////////
                    // Space dimension
                } else if (dimensions[0][0] == "space") {
                    let dimension = dimensions[0][1];

                    switch (selectedVizualisationString) {
                        case "piechart":
                            this.renderPieChart1D(dimensions, flows);
                            break;
                        case "barchart":
                            this.renderBarChart1D(dimensions, flows);
                            break;
                        case "lineplot":
                            this.renderLinePlot1D(dimensions, flows);
                            break;
                        case "treemap":
                            this.renderTreeMap1D(dimensions, flows);
                            break;
                        case "choroplethmap":

                            areas = new Collection([], {
                                apiTag: 'areas',
                                apiIds: [dimension.adminlevel]
                            });
                            areas.fetch({
                                success: function () {
                                    var geojson = {};
                                    geojson['type'] = 'FeatureCollection';
                                    features = geojson['features'] = [];
                                    areas.forEach(function (area) {
                                        var feature = {};
                                        feature['type'] = 'Feature';
                                        feature['id'] = area.get('id')
                                        feature['geometry'] = area.get('geom')
                                        features.push(feature)
                                    })

                                    _this.renderChoropleth1D(dimensions, flows, geojson);
                                },
                                error: function (res) {
                                    console.log(res);
                                }
                            });

                            break;
                        default:
                            // Nothing
                    }

                    // /////////////////////////////
                    // Economic Activity dimension
                } else if (dimensions[0][0] == "economicActivity") {
                    let activityGroups = filterFlowsView.activityGroups.models;
                    let activities = filterFlowsView.activities.models;

                    // Granularity = Activity group
                    if (dimensions[0][1] == "origin__activity__activitygroup" || dimensions[0][1] == "destination__activity__activitygroup") {

                        flows.forEach(function (flow, index) {
                            let activityGroupObject = activityGroups.find(activityGroup => activityGroup.attributes.id == flow.activitygroup);

                            this[index].activityGroupCode = activityGroupObject.attributes.code;
                            this[index].activityGroupName = activityGroupObject.attributes.name[0].toUpperCase() + activityGroupObject.attributes.name.slice(1).toLowerCase();
                        }, flows);

                        // Granularity: Activity
                    } else if (dimensions[0][1] == "origin__activity" || dimensions[0][1] == "destination__activity") {

                        flows.forEach(function (flow, index) {
                            let activityObject = activities.find(activity => activity.attributes.id == flow.activity);

                            this[index].activityCode = activityObject.attributes.nace;
                            this[index].activityName = activityObject.attributes.name[0].toUpperCase() + activityObject.attributes.name.slice(1).toLowerCase();
                        }, flows);
                    }

                    switch (selectedVizualisationString) {
                        case "piechart":
                            this.renderPieChart1D(dimensions, flows);
                            break;
                        case "barchart":
                            this.renderBarChart1D(dimensions, flows);
                            break;
                        case "treemap":
                            this.renderTreeMap1D(dimensions, flows);
                            break;
                        default:
                            // Nothing
                    }

                    // /////////////////////////////
                    // Treatment Method Dimension
                } else if (dimensions[0][0] == "treatmentMethod") {
                    let processGroups = filterFlowsView.processgroups.models;
                    let processes = filterFlowsView.processes.models;
                    console.log("Treatment method")

                    // Granularity: Treatment Method Group
                    if (dimensions[0][1] == "origin__process__processgroup" || dimensions[0][1] == "destination__process__processgroup") {

                        flows.forEach(function (flow, index) {
                            let processGroupObject = processGroups.find(processGroup => processGroup.attributes.id == flow.processgroup);

                            this[index].processGroupCode = processGroupObject.attributes.code;
                            this[index].processGroupName = processGroupObject.attributes.name[0].toUpperCase() + processGroupObject.attributes.name.slice(1).toLowerCase();
                        }, flows);

                        // Granularity: Treatment Method
                    } else if (dimensions[0][1] == "origin__process" || dimensions[0][1] == "destination__process") {

                        flows.forEach(function (flow, index) {
                            let processObject = processes.find(process => process.attributes.id == flow.process);

                            this[index].processCode = processObject.attributes.code;
                            this[index].processName = processObject.attributes.name[0].toUpperCase() + processObject.attributes.name.slice(1).toLowerCase();
                        }, flows);
                    }

                    switch (selectedVizualisationString) {
                        case "piechart":
                            this.renderPieChart1D(dimensions, flows);
                            break;
                        case "barchart":
                            this.renderBarChart1D(dimensions, flows);
                            break;
                        case "treemap":
                            this.renderTreeMap1D(dimensions, flows);
                            break;
                        default:
                            // Nothing
                    }
                }

                console.log(flows);
            },

            render2Dvisualizations: function (dimensions, flows, selectedVizualisationString) {
                console.log(flows);
            },

            renderPieChart1D: function (dimensions, flows) {
                if (this.pieChartView != null) this.pieChartView.close();

                $(".piechart-wrapper").fadeIn();

                this.pieChartView = new PieChartView({
                    el: ".piechart-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderTreeMap1D: function (dimensions, flows) {
                if (this.treeMapView != null) this.treeMapView.close();

                $(".treemap-wrapper").fadeIn();

                this.treeMapView = new TreeMapView({
                    el: ".treemap-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderBarChart1D: function (dimensions, flows) {
                if (this.barChartView != null) this.barChartView.close();

                $(".barchart-wrapper").fadeIn();

                this.barChartView = new BarChartView({
                    el: ".barchart-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderLinePlot1D: function (dimensions, flows) {
                if (this.linePlotView != null) this.linePlotView.close();

                $(".lineplot-wrapper").fadeIn();

                this.linePlotView = new LinePlotView({
                    el: ".lineplot-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                });
            },

            renderChoropleth1D: function (dimensions, flows, topoJsonURL) {
                if (this.choroplethView != null) this.choroplethView.close();

                $(".choropleth-wrapper").fadeIn();

                this.choroplethView = new ChoroplethView({
                    el: ".choropleth-wrapper",
                    dimensions: dimensions,
                    flows: flows,
                    flowsView: this,
                    topoJsonURL: topoJsonURL,
                });
            },

            closeAllVizViews: function () {
                $(".viz-wrapper-div").fadeOut();
                $(".viz-wrapper-div").html("")
                if (this.barChartView != null) this.barChartView.close();
                if (this.pieChartView != null) this.pieChartView.close();
                if (this.linePlotView != null) this.linePlotView.close();
                if (this.treeMapView != null) this.treeMapView.close();
                if (this.choroplethView != null) this.choroplethView.close();
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
                    apiTag: 'flows',
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

                            $(".d3plus-viz-controls-container .d3plus-Button").html("<i class='fas fa-camera' style='color: white'></i>");

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

        });
        return FlowsView;
    });