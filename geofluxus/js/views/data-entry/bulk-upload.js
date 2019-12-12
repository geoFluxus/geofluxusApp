// Bulk Upload
define(['views/common/baseview', 'underscore'],
function (BaseView, _) {

var BulkUploadView = BaseView.extend({

    initialize: function(options){
        BulkUploadView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    events: {
        "click button.upload": "upload",
    },

    render: function(){
        main = document.getElementById(this.template);

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

        function renderRow(up){
            var html = document.getElementById('upload-row-template').innerHTML,
                template = _.template(html),
                div = document.createElement('div');
            div.innerHTML = template({label: up});
            main.appendChild(div);
        }

        ups.forEach(function(up) {
            renderRow(up);
        })
    },

    upload: function(evt){
        var _this = this,
            btn = evt.target,
            tag = btn.dataset['tag'];

        console.log(btn);
    }

});
return BulkUploadView;
});