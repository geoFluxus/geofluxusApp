// Routes
define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map'
        ],

function(BaseView, _, Collection, Map) {

    var RoutingView = BaseView.extend({

        // Initialization
        initialize: function (options) {
            var _this = this;
            RoutingView.__super__.initialize.apply(this, [options]);

            this.routings = new Collection([], {
                apiTag: 'routings'
            });
            this.actors = new Collection([], {
                apiTag: 'actors'
            })

            this.loader.activate();
            var promises = [
                this.routings.fetch(),
                this.actors.fetch(),
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

            this.routingMap = new Map({
                el: this.el.querySelector('.map'),
                source: 'light',
                opacity: 1.0
            });
            this.routingMap.addLayer('routings', {
                stroke: 'rgb(255, 0, 0)',
                select: {
                    selectable: true,
                    strokeWidth: 10,
                    stroke: 'rgb(0, 255, 0)'
                }
            });
            this.routingMap.addLayer('actors', {
                radius: 5,
                fill: 'rgb(255, 200, 0)'
            });

            this.drawRoutings(_this.routings);
            this.drawActors(_this.actors);
        },

        // Draw routes
        drawRoutings: function(routings){
            var _this = this;
            routings.forEach(function(routing){
                var coords = routing.get('geom').coordinates,
                    type = routing.get('geom').type.toLowerCase();
                _this.routingMap.addGeometry(coords, {
                        projection: 'EPSG:4326', layername: 'routings',
                        type: type, renderOSM: false
                });
            })
            this.routingMap.centerOnLayer('routings');
        },

        // Draw actors
        drawActors: function(actors){
            var _this = this;
            actors.forEach(function(actor){
                var coords = actor.get('geom').coordinates;
                _this.routingMap.addGeometry(coords, {
                        projection: 'EPSG:4326', layername: 'actors',
                        type: 'Point', renderOSM: false
                });
            })
        }

    });

    return RoutingView;
})