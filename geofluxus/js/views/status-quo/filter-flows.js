define(['views/common/baseview',
        'underscore',
        'collections/collection',],

function(BaseView, _, Collection){

var FilterFlowsView = BaseView.extend({
    initialize: function(options){
        var _this = this;
        FilterFlowsView.__super__.initialize.apply(this, [options]);

        this.template = options.template;
        this.activitygroups = new Collection([], {
            apiTag: 'activitygroups'
        });
        this.activities = new Collection([], {
            apiTag: 'activities'
        });
        this.actors = new Collection([], {
            apiTag: 'actors'
        });
        this.processes = new Collection([], {
            apiTag: 'processes'
        });
        this.wastes = new Collection([], {
            apiTag: 'wastes'
        });
        this.materials = new Collection([], {
            apiTag: 'materials'
        });
        this.products = new Collection([], {
            apiTag: 'products'
        });
        this.composites = new Collection([], {
            apiTag: 'composites'
        });
        this.adminlevels = new Collection([], {
            apiTag: 'adminlevels'
        });

        var promises = [
            this.activitygroups.fetch(),
            this.activities.fetch(),
            this.actors.fetch(),
            this.processes.fetch(),
            this.wastes.fetch(),
            this.materials.fetch(),
            this.products.fetch(),
            this.composites.fetch(),
            this.adminlevels.fetch()
        ];
        Promise.all(promises).then(function(){
            _this.render();
        })
    },

    // DOM events
    events: {

    },

    // Rendering
    render: function() {
        var html = document.getElementById(this.template).innerHTML,
            template = _.template(html),
            _this = this;
        // Add to template context !!!
        this.el.innerHTML = template({processes: this.processes});

        // Select filters
        this.processSelect = this.el.querySelector('select[name="process-select"]');
        $(this.processSelect).selectpicker();

        this.addEventListeners();
    },

    addEventListeners: function(){
        var _this = this;

//        function multiCheck(evt, clickedIndex, checked){
//            var select = evt.target;
//            if (checked) {
//                // 'All clicked -> deselect other options
//                if (clickedIndex == 0){
//                    $(select).selectpicker('deselectAll');
//                    select.value = -1;
//                }
//                // other option clicked -> deselect 'All'
//                else {
//                    select.option[0].selected = false;
//                }
//            }
//            // nothing selected anymore -> select 'All'
//            if (select.value == null || select.value == ''){
//                select.value = -1;
//            }
//            $(select).selectpicker('refresh');
//            console.log(select.value);
//        }
//
//        $(this.processSelect).on('changed.bs.select', multiCheck);
    },

});

return FilterFlowsView;

}
);