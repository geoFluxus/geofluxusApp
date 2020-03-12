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
        BarChartView
    ) {

        var FlowsView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                FlowsView.__super__.initialize.apply(this, [options]);

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

                if (filter.selectedAreasOrigin !== undefined) {
                    filterParams.origin.selectedAreas = [];
                    filter.selectedAreasOrigin.forEach(function (area) {
                        filterParams.origin.selectedAreas.push(area.id);
                    });
                }                
                if ($(filter.origin.inOrOut).prop('checked')){
                    filterParams.origin.inOrOut = 'outside';
                }
                if ($(filter.origin.roleSelect).val() != 'any') {
                    filterParams.origin.role = $(filter.origin.roleSelect).val();
                }
                if (!$(filter.origin.filterLevelSelect).prop("checked")) {
                    if ($(filter.origin.activityGroupsSelect).val() != '-1') {
                        filterParams.origin.activityGroups = $(filter.origin.activityGroupsSelect).val();
                    }
                } else {
                    if ($(filter.origin.activities).val() != '-1') {
                        filterParams.origin.activities = $(filter.origin.activitySelect).val();
                    }
                }
                if ($(filter.origin.processSelect).val() != "-1") {
                    filterParams.origin.process = $(filter.origin.processSelect).val();
                }


                // ///////////////////////////////
                // DESTINATION

                if (filter.selectedAreasDestination !== undefined) {
                    filterParams.destination.selectedAreas = [];
                    filter.selectedAreasDestination.forEach(function (area) {
                        filterParams.destination.selectedAreas.push(area.id);
                    });
                }
                if ($(filter.destination.inOrOut).prop('checked')){
                    filterParams.destination.inOrOut = 'outside';
                }
                if ($(filter.destination.roleSelect).val() != 'any') {
                    filterParams.destination.role = $(filter.destination.roleSelect).val();
                }
                if (!$(filter.destination.filterLevelSelect).prop("checked")) {
                    if ($(filter.destination.activityGroupsSelect).val() != '-1') {
                        filterParams.destination.activityGroups = $(filter.destination.activityGroupsSelect).val();
                    }
                } else {
                    if ($(filter.destination.activities).val() != '-1') {
                        filterParams.destination.activities = $(filter.destination.activitySelect).val();
                    }
                }
                if ($(filter.destination.processSelect).val() != "-1") {
                    filterParams.destination.process = $(filter.destination.processSelect).val();
                }


                // ///////////////////////////////
                // FLOWS
                if (filter.selectedAreasFlows !== undefined) {
                    filterParams.flows.selectedAreas = [];
                    filter.selectedAreasFlows.forEach(function (area) {
                        filterParams.flows.selectedAreas.push(area.id);
                    });
                }

                // Year
                let year = $(filter.flows.yearSelect).val();
                if (year !== "all") {
                    filterParams.flows['year'] = year;
                }

                // Wastes
                let wastes = $(filter.flows.wasteSelect).val();
                if (wastes[0] !== "-1") {
                    filterParams.flows['waste__in'] = wastes;
                }

                // Materials
                let materials = $(filter.flows.materialSelect).val();
                if (materials[0] !== "-1") {
                    filterParams.flows['materials__in'] = materials;
                }

                // Products
                let products = $(filter.flows.productSelect).val();
                if (products[0] !== "-1") {
                    filterParams.flows['products__in'] = products;
                }

                // Composites
                let composites = $(filter.flows.compositesSelect).val();
                if (composites[0] !== "-1") {
                    filterParams.flows['composites__in'] = composites;
                }

                // isRoute
                let route = $(filter.flows.routeSelect).val();
                if (route != 'both') {
                    let is_route = (route == 'yes') ? true : false;
                    filterParams.flows['route'] = is_route;
                }

                // isCollector
                let collector = $(filter.flows.collectorSelect).val();
                if (collector != 'both') {
                    let is_collector = (collector == 'yes') ? true : false;
                    filterParams.flows['collector'] = is_collector;
                }

                // isHazardous
                let hazardous = $(filter.flows.hazardousSelect).val();
                if (hazardous != 'both') {
                    let is_hazardous = (hazardous == 'yes') ? true : false;
                    filterParams.flows['hazardous'] = is_hazardous;
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
                    filterParams.dimensions.time = {
                        selected: true,
                        granularity: $(filter.dimensions.timeToggleGran).prop("checked") ? 'month' : 'year',
                    }
                }

                if ($(filter.dimensions.spaceToggle).prop("checked")) {
                    filterParams.dimensions.spaceToggle = {
                        selected: true,
                        granularity: $('#dim-space-gran-select option:selected').text(),
                    }
                }

                if ($(filter.dimensions.economicActivityToggle).prop("checked")) {
                    filterParams.dimensions.economicActivity = {
                        selected: true,
                        granularity: $(filter.dimensions.economicActivityToggle).prop("checked") ? 'Activity' : 'Activity group',
                    }
                }

                if ($(filter.dimensions.treatmentMethodToggle).prop("checked")) {
                    filterParams.dimensions.treatmentMethod = {
                        selected: true,
                        granularity: $(filter.dimensions.treatmentMethodToggle).prop("checked") ? 'Treatment method' : 'Treatment method group',
                    }
                }

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

            linkDeselected: function (e) {
                // only actors atm
                var flow = e.detail,
                    flows = [],
                    nodes = [];
                if (this.nodeLevel === 'actor') {
                    nodes = [data.origin, data.destination];
                    flows = flow;
                } else {
                    var mapFlows = this.flowMapView.getFlows();
                    mapFlows.forEach(function (mapFlow) {
                        if (mapFlow.parent === flow.id) {
                            flows.push(mapFlow);
                        }
                    })
                };
                this.flowMapView.removeFlows(flows);
                this.flowMapView.rerender();
            },

            renderPieChart1D: function () {
                var _this = this;

                if (this.pieChartView != null) this.pieChartView.close();


                var el = ".piechart-wrapper";


                this.pieChartView = new PieChartView({
                    el: el,
                });
            },

            renderBarChart1D: function () {
                var _this = this;

                if (this.barChartView != null) this.barChartView.close();


                var el = ".barchart-wrapper";


                this.barChartView = new BarChartView({
                    el: el,
                });
            },

            // Fetch flows and calls options.success(flows) on success
            fetchFlows: function (options) {
                let _this = this;
                let filterParams = this.getFlowFilterParams();

                var flows = new Collection([], {
                    apiTag: 'flows',
                });

                this.loader.activate();
                var data = {};


                // PIE CHART TEST
                _this.renderPieChart1D();
                _this.renderBarChart1D();


                flows.postfetch({
                    data: data,
                    body: filterParams,
                    success: function (response) {
                        _this.postprocess(flows);
                        _this.loader.deactivate();
                        _this.renderSankeyMap();



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
            },

        });
        return FlowsView;
    });