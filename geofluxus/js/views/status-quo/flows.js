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
        let filterLevel = $('select[name="filter-level-select"]').val();

        let filterParams = {
            areas: this.filterFlowsView.selectedAreas,
            activityGroups: $(this.filterFlowsView.activityGroupsSelect).val(),
            activities: [],
            role: $(this.filterFlowsView.roleSelect).val(),
            year: $(this.filterFlowsView.yearSelect).val(),
            processes: $(this.filterFlowsView.processSelect).val(),
            wastes: $(this.filterFlowsView.wasteSelect).val(),
            materials: $(this.filterFlowsView.materialSelect).val(),
            products: $(this.filterFlowsView.productSelect).val(),
            composites: $(this.filterFlowsView.compositesSelect).val(),
            isRoute: $(this.filterFlowsView.routeSelect).val(),
            isCollector: $(this.filterFlowsView.collectorSelect).val(),
            isHazardous: $(this.filterFlowsView.hazardousSelect).val(),
            isClean: $(this.filterFlowsView.cleanSelect).val(),
            isMixed: $(this.filterFlowsView.mixedSelect).val(),
            isDirectUse: $(this.filterFlowsView.directSelect).val(),
            isComposite: $(this.filterFlowsView.isCompositeSelect).val(),
        };

        // Filter level of activityGroup or activity:
        if (filterLevel == 'activitygroup') {
            filterParams.activities = [];
        } else if (filterLevel == 'activity'){
            filterParams.activities = $(this.filterFlowsView.activitySelect).val();
        }

        return filterParams;
    },

    // Fetch flows and calls options.success(flows) on success
    fetchFlows: function(options){
        let _this = this;
        let filterParams = this.getFlowFilterParams();

        //console.log("filterParams: ", filterParams);

        var flows = new Collection([], {
            apiTag: 'flows',
        });

        console.log("flows: ", flows);

        this.loader.activate();
        var data = {};
//        if (options.strategy)
//            data['strategy'] = this.strategy.id;

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