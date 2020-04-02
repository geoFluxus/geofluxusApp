// Routing
define(['views/routing/routes'],
function(RoutesView) {
    var routesView;

    function renderRoutes() {
        routesView = new RoutesView({
            el: document.getElementById('routes'),
            template: 'routes-template'
        })
    }

    function render() {
        renderRoutes();
    }

    render();
})