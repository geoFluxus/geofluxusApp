// Bulk Upload
define(['views/common/baseview', 'underscore', 'models/model', 'app-config'],
function (BaseView, _, Model, config) {

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
        this.logArea = this.el.querySelector('#upload-log');

        // Render all models for uploading
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
            div.innerHTML = template({label: label, apiTag: tag,
                                      templateUrl: url + '?request=template'});
            col.appendChild(div);
        }

        ups.forEach(function(up) {
            renderRow(up, upCol);
        })
    },

    // Write to log
    log: function(text, color){
        var color = color || 'black';
        this.logArea.innerHTML += "<span style='color:" + color + ";'>" + text + "</span><br>";
        this.logArea.scrollTop = this.logArea.scrollHeight;
        console.log(this.logArea.scrollHeight);
    },

    // Upload data from template
    upload: function(evt) {
        var _this = this,
            btn = evt.target,
            tag = btn.dataset['tag'];

        if (!tag) return;

        var row = this.el.querySelector('.row[data-tag="' + tag +  '"]'),
            input = row.querySelector('input[type="file"]'),
            file = input.files[0],
            encoding = this.el.querySelector('#encoding-select').value;

        // Check if there are files
        if (!file){
            this.alert('No file selected to upload!');
            return;
        }

        this.log("Uploading (" + file.name + ")...", 'red');

        var data = {
            'bulk_upload': file,
            'encoding': encoding
        };

        var model = new Model({}, {
            apiTag: tag
        });
    }

});
return BulkUploadView;
});