// Flows
define(['views/common/baseview',
        'underscore',
        'views/status-quo/filter-flows',
        'collections/collection'],
function (BaseView, _, FilterFlowsView, Collection) {

var FlowsView = BaseView.extend({

    // Initialization
    initialize: function(options){
        var _this = this;
        FlowsView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    // DOM events
    events: {
        'click #apply-filters': 'fetchFlows'
    },

    // Rendering
    render: function() {
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();

        // render flow filters
        this.renderFilterFlowsView();
    },

    renderFilterFlowsView: function() {
        var el = this.el.querySelector('#flows-content'),
            _this = this;

        this.filterFlowsView = new FilterFlowsView({
            el: el,
            template: 'filter-flows-template'
        });
    },

    // Returns parameters for filtered post-fetching based on assigned filter
    getFlowFilterParams: function(){
        // Prepare filters for request
        let filter = this.filterFlowsView,
            filterParams = {};

        // Display level
        let displayLevel = $(filter.displayLevelSelect).val();
        filterParams['displayLevel'] = displayLevel;

        // Year
        let year = $(filter.yearSelect).val();
        if (year !== "all") {
            filterParams['year'] = year;
        }

        // Wastes
        let wastes = $(filter.wasteSelect).val();
        if (wastes[0] !== "-1") {
            filterParams['waste__in'] = wastes;
        }

        // Processes
        let processes = $(filter.processSelect).val();
        if (processes[0] !== "-1") {
            filterParams['process__in'] = processes;
        }

        // Materials
        let materials = $(filter.materialSelect).val();
        if (materials[0] !== "-1") {
            filterParams['materials__in'] = materials;
        }

        // Products
        let products = $(filter.productSelect).val();
        if (products[0] !== "-1") {
            filterParams['products__in'] = products;
        }

        // Composites
        let composites = $(filter.compositesSelect).val();
        if (composites[0] !== "-1") {
            filterParams['composites__in'] = composites;
        }

        // isRoute
        let route = $(filter.routeSelect).val();
        if (route != 'both') {
            let is_route = (route == 'yes') ? true : false;
            filterParams['route'] = is_route;
        }

        // isCollector
        let collector = $(filter.collectorSelect).val();
        if (collector != 'both') {
            let is_collector = (collector == 'yes') ? true : false;
            filterParams['collector'] = is_collector;
        }

        // isHazardous
        let hazardous = $(filter.hazardousSelect).val();
        if (hazardous != 'both') {
            let is_hazardous = (hazardous == 'yes') ? true : false;
            filterParams['hazardous'] = is_hazardous;
        }

        // isClean
        let clean = $(filter.cleanSelect).val();
        if (clean[0] !== "-1") {
            var options = [];
            clean.forEach(function(option){
                if (option == 'unknown') {
                    options.push(null);
                } else {
                    var is_clean = (option == 'yes') ? true : false;
                    options.push(is_clean);
                }
            })
            filterParams['clean'] = options;
        }

        // isMixed
        let mixed = $(filter.mixedSelect).val();
        if (mixed[0] !== "-1") {
            var options = [];
            mixed.forEach(function(option){
                if (option == 'unknown') {
                    options.push(null);
                } else {
                    var is_mixed = (option == 'yes') ? true : false;
                    options.push(is_mixed);
                }
            })
            filterParams['mixed'] = options;
        }

        // isDirectUse
        let direct = $(filter.directSelect).val();
        if (direct[0] !== "-1") {
            var options = [];
            direct.forEach(function(option){
                if (option == 'unknown') {
                    options.push(null);
                } else {
                    var is_direct = (option == 'yes') ? true : false;
                    options.push(is_direct);
                }
            })
            filterParams['direct'] = options;
        }

        // isComposite
        let composite = $(filter.isCompositeSelect).val();
        if (composite[0] !== "-1") {
            var options = [];
            composite.forEach(function(option){
                if (option == 'unknown') {
                    options.push(null);
                } else {
                    var is_composite = (option == 'yes') ? true : false;
                    options.push(is_composite);
                }
            })
            filterParams['composite'] = options;
        }

//        let filterParams = {
//            areas: this.filterFlowsView.selectedAreas,
//            activityGroups: $(this.filterFlowsView.activityGroupsSelect).val(),
//            activities: [],
//            role: $(this.filterFlowsView.roleSelect).val(),
//            year: $(this.filterFlowsView.yearSelect).val(),
//            processes: $(this.filterFlowsView.processSelect).val(),
//            wastes: $(this.filterFlowsView.wasteSelect).val(),
//            materials: $(this.filterFlowsView.materialSelect).val(),
//            products: $(this.filterFlowsView.productSelect).val(),
//            composites: $(this.filterFlowsView.compositesSelect).val(),
//            isRoute: $(this.filterFlowsView.routeSelect).val(),
//            isCollector: $(this.filterFlowsView.collectorSelect).val(),
//            isHazardous: $(this.filterFlowsView.hazardousSelect).val(),
//            isClean: $(this.filterFlowsView.cleanSelect).val(),
//            isMixed: $(this.filterFlowsView.mixedSelect).val(),
//            isDirectUse: $(this.filterFlowsView.directSelect).val(),
//            isComposite: $(this.filterFlowsView.isCompositeSelect).val(),
//        };

//        // Filter level of activityGroup or activity:
//        if (filterLevel == 'activitygroup') {
//            filterParams.activities = [];
//        } else if (filterLevel == 'activity'){
//            filterParams.activities = $(this.filterFlowsView.activitySelect).val();
//        }

        return filterParams;
    },

    // Fetch flows and calls options.success(flows) on success
    fetchFlows: function(options){
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
            success: function(response){
                //_this.postprocess(flows);
                _this.loader.deactivate();
                if (options.success) {
                    // options.success(flows);
                    console.log("Success!");
                }
            },
            error: function(error){
                _this.loader.deactivate();
                console.log(error);
                //_this.onError(error);
            }
        });
    },

    });
return FlowsView;
});