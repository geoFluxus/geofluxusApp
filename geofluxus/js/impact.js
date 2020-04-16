// Routing
define(['views/impact/routing'],
function(RoutingView) {
    var routingView;

    function renderRouting() {
        routingView = new RoutingView({
            el: document.getElementById('routing'),
            template: 'routing-template'
        })
    }

    function render() {
        renderRouting();
    }

    render();
})