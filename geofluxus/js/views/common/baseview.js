define(['backbone', 'underscore'],
function(Backbone, _){

var BaseView = Backbone.View.extend({

    initialize: function(options){
        _.bindAll(this, 'render');
        _.bindAll(this, 'alert');
        var _this = this;
        this.template = options.template;
    },

    events: {

    },

    render: function(){
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html);
        this.el.innerHTML = template();
    },

    alert: function(message, title){
        var title = title || 'Warning!';
        var el = document.getElementById('alert-modal'),
            html = document.getElementById('alert-modal-template').innerHTML,
            template = _.template(html);

        el.innerHTML = template({ title: title, message: message });
        $(el).modal('show');
    },

});
return BaseView;
}
)