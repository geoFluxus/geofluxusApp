// Bulk Upload
define(['views/common/baseview',
        'underscore',
        'models/model',
        'collections/collection',
        'app-config'],
function (BaseView, _, Model, Collection, config) {

var BulkUploadView = BaseView.extend({

    initialize: function(options){
        BulkUploadView.__super__.initialize.apply(this, [options]);
        this.render();
    },

    // DOM Events
    events: {
        "click button.upload": "upload",
        "click #refresh-status": "refreshStatus",
    },

    // Rendering
    render: function(){
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        this.el.innerHTML = template();
        this.logArea = this.el.querySelector('#upload-log');

        // Render all models for uploading
        var upCol = this.el.querySelector('#upload-column');
        var ups = [
            ['publicationtypes', 'Publication types'],
            ['publications', 'Publications'],
            ['activitygroups', 'Activity groups'],
            ['activities', 'Activities'],
            ['companies', 'Companies'],
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
                label = up[1];
                apiUrl = config.api[tag];
                url = apiUrl;
            div.innerHTML = template({label: label, apiTag: tag,
                                      templateUrl: url + '?request=template'});
            col.appendChild(div);
        }

        ups.forEach(function(up) {
            renderRow(up, upCol);
        })

        this.refreshStatus();
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

        var row = this.el.querySelector('.upload-row[data-tag="' + tag +  '"]'),
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
                _this.log('Created:');
                if (created.length == 0) _this.log('-', 'no');
                created.forEach(function(m){
                    _this.log(JSON.stringify(m), 'no');
                })
                _this.log('Updated:');
                if (updated.length == 0) _this.log('-', 'no');
                updated.forEach(function(m){
                    _this.log(JSON.stringify(m), 'no');
                })
                msg = res.created.length + ' entries created, ' + res.updated.length + ' entries updated';
                _this.log(msg, 'yes', 'green');
                _this.log('-'.repeat(u_msg.length*1.5), 'no');
                _this.refreshStatus(tag);
                _this.loader.deactivate();
            },
            error: function (res) {
                if (res.responseJSON) {
                    msg = res.responseJSON.message;
                    var url = res.responseJSON.file_url;
                    if (url){
                        msg += '<br><a href='+url+' style="color: rgb(255,0,0)">' +
                               '<span class="far fa-file-alt" style="margin-right: 2px;">' +
                               '</span><strong>Download here</strong></a>';
                    }
                } else {
                    msg = res.responseText;
                }
                _this.log(msg, 'yes', 'red');
                _this.log('-'.repeat(u_msg.length*1.5), 'no');
                _this.loader.deactivate();
            },
        });
    },

    refreshStatus: function(tag){
        var _this = this,
            rows;

        if (tag && typeof tag === 'string')
            rows = [this.el.querySelector('.upload-row[data-tag="' + tag + '"]')];
        else
            rows = Array.prototype.slice.call(this.el.querySelectorAll('.upload-row'));

        rows.forEach(function(row){
            var countDiv = row.querySelector('#count'),
                tag = row.dataset['tag'],
                data = {};

            if (!tag) return;

            var collection = new Collection({}, {
                apiTag: tag
            });

            // reduce the amount of data returned by paginated collections
            collection.state.pageSize = 1;

            var count = '?';
            countDiv.innerHTML = 'count' + ': ' + count;

            collection.fetch({
                data: data,
                success: function(){
                    // paginated collections return the count
                    // else get the length of the response
                    var count = collection.count || collection.length;
                    countDiv.innerHTML = 'count';
                    countDiv.innerHTML += ': ' + count;
                }
            });
        })
    }

});
return BulkUploadView;
});