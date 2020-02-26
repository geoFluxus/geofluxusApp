// Flows
define(['views/common/baseview',
        'underscore',
        'views/status-quo/filter-flows',
        'collections/collection',
        'utils/utils',
        'views/common/flowsankey'
    ],
    function (BaseView, _, FilterFlowsView, Collection, utils, FlowSankeyView) {

        var FlowsView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                FlowsView.__super__.initialize.apply(this, [options]);
                this.render();
            },

            // DOM events
            events: {
                'click #apply-filters': 'fetchFlows'
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML,
                    template = _.template(html),
                    _this = this;
                this.el.innerHTML = template();

                // render flow filters
                this.renderFilterFlowsView();
            },

            renderFilterFlowsView: function () {
                var el = this.el.querySelector('#flows-content'),
                    _this = this;

                this.filterFlowsView = new FilterFlowsView({
                    el: el,
                    template: 'filter-flows-template'
                });
            },

            //    drawFlows: function(){
            //        //if (this.flowsView) this.flowsView.close();
            //        //var filter = this.getFilter();
            //
            //        var filter = "";
            //
            //        this.flowsView = new FlowsView({
            //            el: this.el.querySelector('#flows-render-content'),
            //            template: 'flows-render-template',
            //            materials: this.materials,
            //            actors: this.actors,
            //            activityGroups: this.activityGroups,
            //            activities: this.activities,
            //            caseStudy: this.caseStudy,
            //            keyflowId: this.keyflowId,
            //            displayWarnings: true,
            //            filter: filter
            //        });
            //        var displayLevel = this.displayLevelSelect.value;
            //        this.flowsView.draw(displayLevel);
            //    },

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

                    //            flow.description = flow.get('description');
                    //var materials = flow.get('materials');
                    //flow.get('materials').forEach(function(material){
                    //material._amount =  material.amount;
                    //})
                    //flow.set('materials', materials);

                    //            if (!flow.get('stock'))
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

                            // if (_this.strategy) {
                            //     _this.fetchFlows({
                            //         strategy: _this.strategy,
                            //         displayLevel: displayLevel,
                            //         success: function (strategyFlows) {
                            //             _this.strategyFlows = strategyFlows;
                            //             _this.deltaFlows = _this.calculateDelta(_this.flows, strategyFlows);
                            //             _this.postprocess(_this.deltaFlows);
                            //             drawSankey();
                            //         }
                            //     })
                            // } else {
                            //     //listFlows();
                            //     drawSankey();
                            // }
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
                let filter = this.filterFlowsView,
                    filterParams = {};

                // DISPLAY LEVEL //
                let displayLevel = $(filter.displayLevelSelect).val();

                // AREA FILTERS //
                let areaFilters = {};

                // Selected areas
                let areas = filter.selectedAreas;
                areaFilters['areas'] = areas;

                // Activity & Activity Groups
                let filterLevel = $(filter.filterLevelSelect).prop("checked"),
                    activityGroups = $(filter.activityGroupsSelect).val(),
                    activities = $(filter.activitySelect).val();

                // If filterLevel is not checked, this means level is 'activitygroup':
                if (!filterLevel) {
                    if (activityGroups[0] !== "-1") {
                        areaFilters['__activity__activitygroup'] = activityGroups;
                    }
                } else {
                    if (activities[0] !== "-1") {
                        areaFilters['__activity'] = activities;
                    }
                }

                // Role
                let role = $(filter.roleSelect).val();
                areaFilters['role'] = role;
                // AREA FILTERS //


                // GENERIC FILTERS //
                let genFilters = {};

                // Year
                let year = $(filter.yearSelect).val();
                if (year !== "all") {
                    genFilters['year'] = year;
                }

                // Wastes
                let wastes = $(filter.wasteSelect).val();
                if (wastes[0] !== "-1") {
                    genFilters['waste__in'] = wastes;
                }

                // Processes
                let processes = $(filter.processSelect).val();
                if (processes[0] !== "-1") {
                    genFilters['process__in'] = processes;
                }

                // Materials
                let materials = $(filter.materialSelect).val();
                if (materials[0] !== "-1") {
                    genFilters['materials__in'] = materials;
                }

                // Products
                let products = $(filter.productSelect).val();
                if (products[0] !== "-1") {
                    genFilters['products__in'] = products;
                }

                // Composites
                let composites = $(filter.compositesSelect).val();
                if (composites[0] !== "-1") {
                    genFilters['composites__in'] = composites;
                }

                // isRoute
                let route = $(filter.routeSelect).val();
                if (route != 'both') {
                    let is_route = (route == 'yes') ? true : false;
                    genFilters['route'] = is_route;
                }

                // isCollector
                let collector = $(filter.collectorSelect).val();
                if (collector != 'both') {
                    let is_collector = (collector == 'yes') ? true : false;
                    genFilters['collector'] = is_collector;
                }

                // isHazardous
                let hazardous = $(filter.hazardousSelect).val();
                if (hazardous != 'both') {
                    let is_hazardous = (hazardous == 'yes') ? true : false;
                    genFilters['hazardous'] = is_hazardous;
                }

                // isClean
                let clean = $(filter.cleanSelect).val();
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
                    genFilters['clean'] = options;
                }

                // isMixed
                let mixed = $(filter.mixedSelect).val();
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
                    genFilters['mixed'] = options;
                }

                // isDirectUse
                let direct = $(filter.directSelect).val();
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
                    genFilters['direct'] = options;
                }

                // isComposite
                let composite = $(filter.isCompositeSelect).val();
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
                    genFilters['composite'] = options;
                }
                // GENERIC FILTERS //

                // Append all separate filters into params
                filterParams['displayLevel'] = displayLevel;
                filterParams['genFilters'] = genFilters;
                filterParams['areaFilters'] = areaFilters;

                return filterParams;
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

                flows.postfetch({
                    data: data,
                    body: filterParams,
                    success: function (response) {
                        _this.postprocess(flows);
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
            },

        });
        return FlowsView;
    });