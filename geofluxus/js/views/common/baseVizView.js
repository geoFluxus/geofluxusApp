define(['backbone', 'underscore', 'utils/utils'],
    function (Backbone, _, utils) {


        var baseVizView = Backbone.View.extend({

            initialize: function (options) {
                _.bindAll(this, 'render');
                _.bindAll(this, 'alert');
                var _this = this;
                this.template = options.template;
                this.loader = new utils.Loader(options.el, {
                    disable: true
                });
            },

            events: {

            },

            render: function () {

            },



        });
        return baseVizView;
    }
)