// Routes
define(['views/common/baseview',
        'underscore',],

function(BaseView, _) {

    var RoutesView = BaseView.extend({

        // Initialization
        initialize: function (options) {
            var _this = this;
            RoutesView.__super__.initialize.apply(this, [options]);
            this.render();
        },

        // DOM Events
        events: {

        },

        // Rendering
        render: function() {
            var html = document.getElementById(this.template).innerHTML,
                template = _.template(html),
                _this = this;
            this.el.innerHTML = template();
        }

    });

    return RoutesView;
})