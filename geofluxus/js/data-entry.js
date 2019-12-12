// Data Entry
define(['views/data-entry/bulk-upload', 'views/data-entry/update'],
function (BulkUploadView, UpdateView) {
    var bulkUploadView,
        updateView;

    function renderBulkUpload() {
        bulkUploadView = new BulkUploadView({
            el: document.getElementById('bulk-upload'),
            template: 'bulk-upload-template'
        })
    }

    function renderUpdate() {
        updateView = new UpdateView({
            el: document.getElementById('update'),
            template: 'update-template'
        })
    }

    function render() {
        renderBulkUpload();
        renderUpdate();
    }

    render();
})