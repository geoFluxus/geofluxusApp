define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map'],

function(BaseView, _, Collection, Map){

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

        this.loader.activate();
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
            _this.loader.deactivate();
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
        this.el.innerHTML = template({ processes: this.processes,
                                       wastes: this.wastes,
                                       materials: this.materials,
                                       products: this.products,
                                       composites: this.composites
                                     });

        // Activate help icons
        var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
        $(popovers).popover({ trigger: "focus" });

        // Area selection modal
        this.areaModal = this.el.querySelector('.area-filter.modal');
        html = document.getElementById('area-select-modal-template').innerHTML;
        template = _.template(html);
        this.areaModal.innerHTML = template({ levels: this.adminlevels });
        this.areaMap = new Map({
            el: this.areaModal.querySelector('.map'),
        });

        // Select filters
        this.processSelect = this.el.querySelector('select[name="process-select"]');
        this.wasteSelect = this.el.querySelector('select[name="waste-select"]');
        this.materialSelect = this.el.querySelector('select[name="material-select"]');
        this.productSelect = this.el.querySelector('select[name="product-select"]');
        this.compositeSelect = this.el.querySelector('select[name="composite-select"]');
        this.cleanSelect = this.el.querySelector('select[name="clean-select"]');
        this.mixedSelect = this.el.querySelector('select[name="mixed-select"]');
        this.directSelect = this.el.querySelector('select[name="direct-select"]');
        this.compoSelect = this.el.querySelector('select[name="compo-select"]');

        $(this.processSelect).selectpicker();
        $(this.wasteSelect).selectpicker();
        $(this.materialSelect).selectpicker();
        $(this.productSelect).selectpicker();
        $(this.compositeSelect).selectpicker();
        $(this.cleanSelect).selectpicker();
        $(this.mixedSelect).selectpicker();
        $(this.directSelect).selectpicker();
        $(this.compoSelect).selectpicker();

        this.addEventListeners();
    },

    addEventListeners: function(){
        var _this = this;

        function multiCheck(evt, clickedIndex, checked){
            var select = evt.target;
            if (checked) {
                // 'All clicked -> deselect other options
                if (clickedIndex == 0){
                    $(select).selectpicker('deselectAll');
                    select.value = -1;
                }
                // other option clicked -> deselect 'All'
                else {
                    select.options[0].selected = false;
                }
            }
            // nothing selected anymore -> select 'All'
            if (select.value == null || select.value == ''){
                select.value = -1;
            }
            $(select).selectpicker('refresh');
            console.log(select.value);
        }

        $(this.processSelect).on('changed.bs.select', multiCheck);
        $(this.wasteSelect).on('changed.bs.select', multiCheck);
        $(this.materialSelect).on('changed.bs.select', multiCheck);
        $(this.productSelect).on('changed.bs.select', multiCheck);
        $(this.compositeSelect).on('changed.bs.select', multiCheck);
        $(this.cleanSelect).on('changed.bs.select', multiCheck);
        $(this.mixedSelect).on('changed.bs.select', multiCheck);
        $(this.directSelect).on('changed.bs.select', multiCheck);
        $(this.compoSelect).on('changed.bs.select', multiCheck);
    },

    close: function(){
//        if (this.flowsView) this.flowsView.close();
        FilterFlowsView.__super__.close.call(this);
    }

});

return FilterFlowsView;

}
);