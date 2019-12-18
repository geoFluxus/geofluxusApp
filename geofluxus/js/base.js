// Base
require(['jquery',
         'document-ready',
         'bootstrap',
         'utils/overrides',
         'static/css/base.css',
         'static/css/main-navbar.css',
         'static/css/sidebar.css',
         '@fortawesome/fontawesome-free/css/all.css'],
function($, ready){

    ready(function(){
         // hide sidebar if there is no content in it
         if (document.getElementById('sidebar-content').childElementCount == 0){
           document.getElementById('page-content-wrapper').style.paddingLeft = '0px';
           document.getElementById('page-content-wrapper').style.paddingTop = '0px';
         }
         else
           document.getElementById('sidebar-wrapper').style.display = 'inline';
         }
    )

})