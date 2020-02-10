define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map'],

function(BaseView, _, Collection, Map){

var FilterFlowsView = BaseView.extend({
    initialize: function(options){
        var _this = this;
        FilterFlowsView.__super__.initialize.apply(this, [options]);
        _.bindAll(this, 'prepareAreas');

        this.template = options.template;
        this.activityGroups = new Collection([], {
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
        this.areaLevels = new Collection([], {
            apiTag: 'arealevels'
        });
        this.areas = {};

        this.loader.activate();
        var promises = [
            this.activityGroups.fetch(),
            this.activities.fetch(),
            this.actors.fetch(),
            this.processes.fetch(),
            this.wastes.fetch(),
            this.materials.fetch(),
            this.products.fetch(),
            this.composites.fetch(),
            this.areaLevels.fetch(),
        ];
        Promise.all(promises).then(function(){
            _this.loader.deactivate();
            _this.render();
        })
    },

    // DOM events
    events: {
        'click #area-select-button': 'showAreaSelection',
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
        this.areaModal.innerHTML = template({ levels: this.areaLevels });
        this.areaMap = new Map({
            el: this.areaModal.querySelector('.map'),
        });
        this.areaLevelSelect = this.el.querySelector('select[name="area-level-select"]');
        this.areaMap.addLayer(
            'areas',
            {
                stroke: 'rgb(100, 150, 250)',
                fill: 'rgba(100, 150, 250, 0.5)',
                select: {
                    selectable: true,
                    stroke: 'rgb(230, 230, 0)',
                    fill: 'rgba(230, 230, 0, 0.5)',
                    onChange: function(areaFeats){
                        var modalSelDiv = _this.el.querySelector('.selections'),
                            levelId = _this.areaLevelSelect.value
                            labels = [],
                            areas = _this.areas[levelId];
                        _this.selectedAreas = [];
                        areaFeats.forEach(function(areaFeat){
                            labels.push(areaFeat.label);
                            _this.selectedAreas.push(areas.get(areaFeat.id))
                        });
                        modalSelDiv.innerHTML = labels.join(', ');
                    }
                }
        });
        if (this.areaLevels.length > 0)
            this.changeAdminLevel();

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

    changeAdminLevel: function(){
        var levelId = this.areaLevelSelect.value;
        this.selectedAreas = [];
        this.el.querySelector('.selections').innerHTML = this.el.querySelector('#area-selections').innerHTML= '';
        this.prepareAreas(levelId);
    },

    prepareAreas: function(levelId, onSuccess){
        var _this = this;
        var areas = this.areas[levelId];
        if (areas && areas.size() > 0){
            this.drawAreas(areas)
            if (onSuccess) onSuccess();
        }
        else {
            areas = new Collection([], {
                apiTag: 'areas'
            });
            this.areas[levelId] = areas;
            this.loader.activate();
            areas.fetch({
                success: function(){
                    _this.loader.deactivate();
                    _this.drawAreas(areas);
                    if (onSuccess) onSuccess();
                },
                error: function(res) {
                    _this.loader.deactivate();
                    _this.onError(res);
                }
            });
        }
    },

    drawAreas: function(areas){
        var _this = this;
        this.areaMap.clearLayer('areas');
        areas.forEach(function(area){
            var coords = area.get('geom').coordinates,
                name = area.get('name');
            _this.areaMap.addPolygon(coords, {
                projection: 'EPSG:4326', layername: 'areas',
                type: 'MultiPolygon', tooltip: name,
                label: name, id: area.id, renderOSM: false
            });
        })
        this.areaMap.centerOnLayer('areas');
    },

    showAreaSelection: function(){
        $(this.areaModal).modal('show');
    },

    close: function(){
//        if (this.flowsView) this.flowsView.close();
        FilterFlowsView.__super__.close.call(this);
    }

});

return FilterFlowsView;

}
);