// Routing
define(['views/impact/flows'],
function(FlowsView) {
    var FlowsView;

    function renderRouting() {
        flowsView = new FlowsView({
            el: document.getElementById('flows'),
            template: 'flow-template'
        })
    }

    function render() {
        renderRouting();
    }

    render();
})