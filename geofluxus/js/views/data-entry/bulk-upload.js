// Bulk Upload
define(['views/common/baseview', 'underscore', 'app-config'],
function (BaseView, _, config) {

var BulkUploadView = BaseView.extend({

    initialize: function(options){
        BulkUploadView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    // DOM Events
    events: {
        "click button.upload": "upload",
    },

    // Rendering
    render: function(){
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();

        var upCol = this.el.querySelector('#uploads');

        var ups = [
            ['activitygroups', 'Activity groups'],
            ['activities', 'Activities'],
            ['companies', 'Companies'],
            ['publicationtypes', 'Publication types'],
            ['publications', 'Publications'],
            ['actors', 'Actors'],
            ['processes', 'Processes'],
            ['wastes', 'Wastes'],
            ['materials', 'Materials'],
            ['products', 'Products'],
            ['composites', 'Composites'],
            ['flowchains', 'Flow Chains'],
            ['flows', 'Flows'],
            ['classifications', 'Classifications'],
            ['extradescriptions', 'Extra Descriptions'],
            ['adminlevels', 'Admin levels'],
            ['areas', 'Areas']
        ]

        function renderRow(up, col){
            var html = document.getElementById('upload-row-template').innerHTML,
                template = _.template(html),
                div = document.createElement('div'),
                tag = up[0],
                label = up[1],
                apiUrl = config.api[tag],
                url = apiUrl;
            console.log(url);
            div.innerHTML = template({label: label,
                                      templateUrl: url + '?request=template'});
            col.appendChild(div);
        }

        ups.forEach(function(up) {
            renderRow(up, upCol);
        })
    },

    // Upload data from template
    upload: function() {
        console.log("Uploading...");
    }

});
return BulkUploadView;
});