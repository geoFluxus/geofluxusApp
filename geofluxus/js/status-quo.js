// Status Quo
define(['views/status-quo/flows'],
function (FlowsView) {
    var flowsView;

    function renderFlows() {
        flowsView = new FlowsView({
            el: document.getElementById('flows'),
            template: 'flows-template'
        })
    }

    function render() {
        renderFlows();
    }

    render();
})