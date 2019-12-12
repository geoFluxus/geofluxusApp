// Bulk Upload
define(['backbone', 'underscore'],
function (Backbone, _) {

var UpdateView = Backbone.View.extend({
    initialize: function(options){
        this.template = options.template;
        this.render();
    },

    events: {

    },

    render: function(){
    }
});
return UpdateView;
});