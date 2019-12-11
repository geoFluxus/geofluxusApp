// Bulk Upload
define(['backbone', 'underscore'],
function (Backbone, _) {

var BulkUploadView = Backbone.View.extend({
    initialize: function(options){
        this.template = options.template;
        this.render();
    },

    events: {

    },

    render: function(){
        var html = document.getElementById(this.template).innerHTML;
        this.el.innerHTML = html;
    }

});
return BulkUploadView;
});