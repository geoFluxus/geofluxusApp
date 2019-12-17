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
    log: function(text, time, color){
        var color = color || 'black';
        var time = (time == 'no') ? false : true;

        displayDate = '';
        if (time) {
            var d = new Date(),
            h = `${d.getHours()}`.padStart(2,'0'),
            m = `${d.getMinutes()}`.padStart(2,'0'),
            s = `${d.getSeconds()}`.padStart(2,'0'),
            displayDate = h + ":" + m + ":" + s + ": ";
        }

        this.logArea.innerHTML += "<span style='color:" + color + ";'>" + displayDate + text + "</span><br>";
        this.logArea.scrollTop = this.logArea.scrollHeight;
    },

    // Upload data from template
    upload: function(evt) {
        var _this = this,
            btn = evt.target,
            tag = btn.dataset['tag'],
            label = btn.id.toLowerCase();

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

        var data = {
            'bulk_upload': file,
            'encoding': encoding
        };

        var model = new Model({}, {
            apiTag: tag
        });

        _this.loader.activate();
        var u_msg = "Uploading " + label + " (" + file.name + ")...";
        _this.log(u_msg);
        model.save(data, {
            success: function (res) {
                var res = res.toJSON(),
                    updated = res.updated,
                    created = res.created;
                _this.log('Created models:');
                if (created.length == 0) _this.log('-');
                created.forEach(function(m){
                    _this.log(JSON.stringify(m));
                })
                _this.log('Updated models:');
                if (updated.length == 0) _this.log('-');
                updated.forEach(function(m){
                    _this.log(JSON.stringify(m));
                })
                msg = res.created.length + ' entries created, ' + res.updated.length + ' entries updated';
                _this.log(msg, 'yes', 'green');
                _this.log('-'.repeat(u_msg.length*1.5), 'no');
            },
            error: function (res) {
                msg = res.responseJSON['detail'];
                _this.log(msg, 'yes', 'red');
                _this.log('-'.repeat(u_msg.length*1.5), 'no');
            },
        });
        _this.loader.deactivate();
    }

});
return BulkUploadView;
});