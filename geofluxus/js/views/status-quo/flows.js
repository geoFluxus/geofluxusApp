// Flows
define(['views/common/baseview',
        'underscore',
        'views/status-quo/filter-flows'],
function (BaseView, _, FilterFlowsView) {

var FlowsView = BaseView.extend({

    // Initialization
    initialize: function(options){
        var _this = this;
        FlowsView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    // DOM events
    events: {

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

});

return FlowsView;
});