// Data Entry
define(['views/data-entry/bulk-upload', 'static/css/data-entry.css'],
function (BulkUploadView) {
    var bulkUploadView;

    function renderBulkUpload() {
        bulkUploadView = new BulkUploadView({
            el: document.getElementById('bulk-upload'),
            template: 'bulk-upload-template'
        })
    }

    function render() {
        renderBulkUpload();
    }

    render();
})