// Routes
define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map',],

function(BaseView, _, Collection, Map) {

    var RoutesView = BaseView.extend({

        // Initialization
        initialize: function (options) {
            var _this = this;
            RoutesView.__super__.initialize.apply(this, [options]);

            this.routes = new Collection([], {
                apiTag: 'routings'
            });

            this.loader.activate();
            var promises = [
                this.routes.fetch(),
            ];
            Promise.all(promises).then(function(){
                _this.loader.deactivate();
                _this.render();
            })
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

            this.routeMap = new Map({
                el: this.el.querySelector('.map'),
            });
            this.routeMap.addLayer('routes', {stroke: 'rgb(255, 0, 0)',});

            this.drawRoutes(_this.routes);
        },

        // Draw routes
        drawRoutes: function(routes){
            var _this = this;
            routes.forEach(function(route){
                var coords = route.get('geom').coordinates,
                    type = route.get('geom').type.toLowerCase();
                _this.routeMap.addGeometry(coords, {
                        projection: 'EPSG:4326', layername: 'routes',
                        type: type, renderOSM: false
                });
            })
            this.routeMap.centerOnLayer('routes');
        },

    });

    return RoutesView;
})