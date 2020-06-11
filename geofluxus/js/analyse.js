// Status Quo
define(['views/common/filters'],
function (FiltersView) {
    var filtersView;

    function renderFilters() {
        filtersView = new FiltersView({
            el: document.getElementById('filters'),
            template: 'filter-template'
        })
    }

    function render() {
        renderFilters();
    }

    render();
})