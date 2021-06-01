define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'app-config'
       ],

    function (BaseView, _, Collection, config) {

        var FileShareView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                FileShareView.__super__.initialize.apply(this, [options]);

                this.template = options.template;

                // template model tags
                this.tags = {
                    'sharefiles': 'sharedfiles',
                }

                // model collections
                // refer to collection via tag
                this.collections = {};
                Object.values(this.tags).forEach(function (tag) {
                    var collection = new Collection([], {
                        apiTag: tag
                    });
                    _this.collections[tag] = collection;
                })

                // fetch model data
                this.loader.activate();
                var promises = [];
                Object.values(this.collections).forEach(function (collection) {
                    var promise = collection.fetch();
                    promises.push(promise);
                })

                Promise.all(promises).then(function () {
                    _this.loader.deactivate();
                    _this.render();
                })
            },

            // DOM events
            events: {
                'click .download-button': 'downloadFile',
            },

            render: function () {
                var html = document.getElementById(this.template).innerHTML,
                    template = _.template(html),
                    _this = this;
                // Add to template context:
                this.el.innerHTML = template(this.collections);

                // Activate help icons
                //var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                //$(popovers).popover({
                //    trigger: "focus"
                //});

                // Render all datasets
                var datasets = this.collections['sharedfiles'];
                function renderRow(dataset){
                    var type = dataset.get('type');
                    var datasetCol = _this.el.querySelector(`#${type}-column`);
                    var html = document.getElementById('dataset-row-template').innerHTML,
                        template = _.template(html),
                        div = document.createElement('div'),
                        label = dataset.get('name'),
                        id = dataset.get('url');
                    div.innerHTML = template({
                        label: label,
                        id: id
                    });
                    datasetCol.appendChild(div);
                }

                datasets.forEach(function(dataset) {
                    renderRow(dataset);
                })
            },

            downloadFile(evt) {
                var _this = this;
                this.loader.activate();

                // use id to request link for downloading file
                var id = evt.target.id,
                    url = config.api['sharedfiles'] + "?request=download&id=" + id;
                var request = $.ajax({
                    url: url,
                    type: "get"
                });

                // download file from link
                request.done(function (response, textStatus, jqXHR){
                    if (response) {
                        var link = document.createElement('a');
                        document.body.appendChild(link);
                        link.href = response;
                        link.click();
                    }
                    else {
                        alert('File does not exist')
                    }
                    _this.loader.deactivate();
                });
            },

            close: function () {
                FiltersView.__super__.close.call(this);
            }
        });

        return FileShareView;
    }
);