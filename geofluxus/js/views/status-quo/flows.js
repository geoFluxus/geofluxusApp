// Flows
define(['views/common/baseview',
        'underscore',
        'models/model',
        'collections/collection',
        'app-config'],
function (BaseView, _, Model, Collection, config) {

var FlowsView = BaseView.extend({

    initialize: function(options){
        FlowsView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    // DOM events
    events: {
    },

    render: function() {
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();
    }
});

return FlowsView;
});