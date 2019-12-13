// Bulk Upload
define(['views/common/baseview', 'underscore'],
function (BaseView, _) {

var BulkUploadView = BaseView.extend({

    initialize: function(options){
        BulkUploadView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    events: {

    },

    render: function(){
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();

        var upCol = this.el.querySelector('#uploads');

        var ups = [
            'Activity groups',
            'Activities',
            'Actors',
            'Materials',
            'Products',
            'Composites',
            'Flows',
            'Flow Chains',
            'Classifications',
            'Extra Descriptions'
        ]

        function renderRow(up, col){
            var html = document.getElementById('upload-row-template').innerHTML,
                template = _.template(html),
                div = document.createElement('div');
            div.innerHTML = template({label: up});
            col.appendChild(div);
        }

        ups.forEach(function(up) {
            renderRow(up, upCol);
        })
    },

});
return BulkUploadView;
});