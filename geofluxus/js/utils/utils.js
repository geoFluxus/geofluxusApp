module.exports = {

    // loader shown in center of given div as spinning circle when activated
    // options.disable disables given div while loader is active
    Loader: function(div, options) {
        var loaderDiv = document.createElement('div');
        loaderDiv.className = 'loader';
        var backdropDiv = document.createElement('div');
        backdropDiv.className = 'modal-backdrop in';

        this.activate = function(opt){
            var opt = opt || {};
            loaderDiv.style.top = null;
            if (options != null && options.disable)
                div.classList.add('disabled');
            if (opt.offsetX != null) loaderDiv.style.top = opt.offsetX;
            div.appendChild(loaderDiv);
            div.appendChild(backdropDiv);
        }

        this.deactivate = function(){
            if (options != null && options.disable)
                div.classList.remove('disabled');
            try{
                div.removeChild(loaderDiv);
                div.removeChild(backdropDiv);
            }
            catch(err){
                console.log(err.message)
            }
        }
    }

}