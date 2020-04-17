// Routes
define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map',
        'views/common/filters',
        'textarea-autosize',
        'bootstrap-select',
        ],

function(BaseView, _, Collection, Map, FiltersView) {

    var RoutingView = BaseView.extend({

        // Initialization
        initialize: function (options) {
            var _this = this;
            RoutingView.__super__.initialize.apply(this, [options]);

            this.render();

//            this.routings = new Collection([], {
//                apiTag: 'routings'
//            });
//            this.actors = new Collection([], {
//                apiTag: 'actors'
//            })

//            this.loader.activate();
//            var promises = [
//                this.routings.fetch(),
//                this.actors.fetch(),
//            ];
//            Promise.all(promises).then(function(){
//                _this.loader.deactivate();
//                _this.render();
//            })
        },

        // DOM Events
        events: {
            'click #apply-filters': 'fetchFlows',
        },

        // Rendering
        render: function() {
            var html = document.getElementById(this.template).innerHTML,
                template = _.template(html),
                _this = this;
            this.el.innerHTML = template();

            this.renderFiltersView();

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

//            this.drawRoutings(_this.routings);
//            this.drawActors(_this.actors);
        },

        // Render filters
        renderFiltersView: function(){
            var el = this.el.querySelector('#filter-content'),
                    _this = this;

            this.filtersView = new FiltersView({
                el: el,
                template: 'filter-template',
            });
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
        },

        // Returns parameters for filtered post-fetching based on assigned filter
        getFlowFilterParams: function () {
            // Prepare filters for request
            let filterParams = this.filtersView.getFilterParams();

            return filterParams;
        },

        // Fetch flows
        fetchFlows: function (options) {
            let _this = this,
                filterParams = this.getFlowFilterParams(),
                data = {};

            let flows = new Collection([], {
                apiTag: 'flows',
            });

            this.loader.activate();

            flows.postfetch({
                data: data,
                body: filterParams,
                success: function (response) {

                    _this.flows = flows.models;

                    _this.flows.forEach(function (flow, index) {
                        this[index] = flow.attributes;
                    }, _this.flows);

                    _this.loader.deactivate();
                    if (options.success) {
                        options.success(flows);
                    }
                },
                error: function (error) {
                    _this.loader.deactivate();
                    console.log(error);
                }
            });
        },

    });

    return RoutingView;
})