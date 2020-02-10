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
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();
    }
});
return UpdateView;
});