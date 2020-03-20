// Base
require(['jquery',
         'document-ready',
         'utils/overrides',
         'bootstrap',
         'bootstrap-select',
         'bootstrap-select/dist/css/bootstrap-select.css',
         'static/css/base.css',
         'static/css/main-navbar.css',
         'static/css/sidebar.css',
         '@fortawesome/fontawesome-free/css/all.css',
         'openlayers/css/ol.css',
         'static/css/map.css',
         'textarea-autosize'],
function($, ready){
    ready(function(){
         // hide sidebar if there is no content in it
        //  if (document.getElementById('sidebar-content').childElementCount == 0){
        //    document.getElementById('page-content-wrapper').style.paddingLeft = '0px';
        //    document.getElementById('page-content-wrapper').style.paddingTop = '0px';
        //  }
        //  else {
        //    document.getElementById('sidebar-wrapper').style.display = 'inline';
        //  }

        // Hide navbar on scroll down, show navbar on scroll up:
        var prevScrollpos = window.pageYOffset;
        window.onscroll = function() {
          var currentScrollPos = window.pageYOffset;
          if (prevScrollpos > currentScrollPos) {
            document.getElementById("navbarID").style.top = "0";
          } else {
            document.getElementById("navbarID").style.top = "-90px";
          }
          prevScrollpos = currentScrollPos;
        }
    });
})