define(['backbone', 'underscore'],
function(Backbone, _){

var BaseView = Backbone.View.extend({

    initialize: function(options){
        _.bindAll(this, 'render');
        var _this = this;
        this.template = options.template;
    },

    events: {

    },

    render: function(){
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html);
        this.el.innerHTML = template();
    }

});
return BaseView;
}
)