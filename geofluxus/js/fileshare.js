define(['views/fileshare/fileshare'],

function (FileShareView) {
    var fileShareView;

    function renderFileShare() {
        fileShareView = new FileShareView({
            el: document.getElementById('datasets'),
            template: 'fileshare-template'
        })
    }

    function render() {
        renderFileShare();
    }

    render();
})