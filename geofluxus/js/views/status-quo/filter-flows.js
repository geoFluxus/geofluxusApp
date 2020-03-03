define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map',
        'views/status-quo/flows',
        'openlayers',
        'bootstrap-toggle',
        'bootstrap-toggle/css/bootstrap-toggle.min.css',
    ],

    function (BaseView, _, Collection, Map, FlowsView, ol) {

        var FilterFlowsView = BaseView.extend({
            initialize: function (options) {
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
                Promise.all(promises).then(function () {
                    _this.loader.deactivate();
                    _this.render();
                })
            },

            // DOM events
            events: {
                'click #area-select-button': 'showAreaSelection',
                'change select[name="area-level-select"]': 'changeAreaLevel',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML,
                    template = _.template(html),
                    _this = this;
                // Add to template context !!!
                this.el.innerHTML = template({
                    processes: this.processes,
                    wastes: this.wastes,
                    materials: this.materials,
                    products: this.products,
                    composites: this.composites,
                    activities: this.activities,
                    activityGroups: this.activityGroups,
                });

                // Activate help icons
                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                $(popovers).popover({
                    trigger: "focus"
                });

                this.renderAreaSelectModal();

                this.initializeControls();

                this.addEventListeners();
            },

            addEventListeners: function () {
                var _this = this;

                function multiCheck(evt, clickedIndex, checked) {
                    var select = evt.target;
                    if (checked) {
                        // 'All clicked -> deselect other options
                        if (clickedIndex == 0) {
                            $(select).selectpicker('deselectAll');
                            select.value = -1;
                        }
                        // other option clicked -> deselect 'All'
                        else {
                            select.options[0].selected = false;
                        }
                    }
                    // nothing selected anymore -> select 'All'
                    if (select.value == null || select.value == '') {
                        select.value = -1;
                    }
                    $(select).selectpicker('refresh');
                }

                function filterActivities(evt, clickedIndex, checked) {
                    let selectedActivityGroupIDs = [];
                    let filteredActivities = [];
                    let allActivitiesOptionsHTML = "";
                    let newActivityOptionsHTML = "";

                    // Get the array with ID's of the selected activityGroup(s) from the .selectpicker:
                    selectedActivityGroupIDs = $(_this.activityGroupsSelect).val()

                    // If no activity groups are selected, reset the activity filter to again show all activities:
                    if (selectedActivityGroupIDs.length == 0) {
                        allActivitiesOptionsHTML = '<option selected value="-1">All (' + _this.activities.length + ')</option><option data-divider="true"></option>';
                        _this.activities.models.forEach(activity => allActivitiesOptionsHTML += "<option>" + activity.attributes.name + "</option>");
                        $(_this.activitySelect).html(allActivitiesOptionsHTML);
                        $(_this.activitySelect).selectpicker("refresh");
                    } else {
                        // Filter all activities by the selected Activity Groups:
                        filteredActivities = _this.activities.models.filter(function (activity) {
                            return selectedActivityGroupIDs.includes(activity.attributes.activitygroup.toString())
                        });

                        // Fill selectPicker with filtered activities, add to DOM, and refresh:
                        newActivityOptionsHTML = '<option selected value="-1">All (' + filteredActivities.length + ')</option><option data-divider="true"></option>';
                        filteredActivities.forEach(activity => newActivityOptionsHTML += "<option>" + activity.attributes.name + "</option>");
                        $(_this.activitySelect).html(newActivityOptionsHTML);
                        $(_this.activitySelect).selectpicker("refresh");
                    }
                }

                // Event handler for changing filter level with bootstrap-toggle:
                $(this.filterLevelSelect).change(function () {
                    $(".activitySelectContainer").fadeToggle("fast");
                });

                $(this.activityGroupsSelect).on('changed.bs.select', filterActivities);

                // Multicheck:
                $(this.activityGroupsSelect).on('changed.bs.select', multiCheck);
                $(this.activitySelect).on('changed.bs.select', multiCheck);
                $(this.processSelect).on('changed.bs.select', multiCheck);
                $(this.wasteSelect).on('changed.bs.select', multiCheck);
                $(this.materialSelect).on('changed.bs.select', multiCheck);
                $(this.productSelect).on('changed.bs.select', multiCheck);
                $(this.compositeSelect).on('changed.bs.select', multiCheck);
                $(this.cleanSelect).on('changed.bs.select', multiCheck);
                $(this.mixedSelect).on('changed.bs.select', multiCheck);
                $(this.directSelect).on('changed.bs.select', multiCheck);
                $(this.isCompositeSelect).on('changed.bs.select', multiCheck);
            },

            initializeControls: function () {

                // Initialize textarea-autoresize components:
                $(".selections").textareaAutoSize();

                // Initialize bootstrap-toggle for filter level:
                this.filterLevelSelect = this.el.querySelector('#toggleFilterLevel');
                $(this.filterLevelSelect).bootstrapToggle();

                this.activityGroupsSelect = this.el.querySelector('select[name="activitygroup-select"]');
                $(this.activityGroupsSelect).selectpicker();

                this.activitySelect = this.el.querySelector('select[name="activity-select"]');
                $(this.activitySelect).selectpicker();

                this.roleSelect = this.el.querySelector('select[name="role"]');
                $(this.roleSelect).selectpicker();

                this.yearSelect = this.el.querySelector('select[name="year"]');
                $(this.yearSelect).selectpicker();

                this.processSelect = this.el.querySelector('select[name="process-select"]');
                $(this.processSelect).selectpicker();

                this.wasteSelect = this.el.querySelector('select[name="waste-select"]');
                $(this.wasteSelect).selectpicker();

                this.materialSelect = this.el.querySelector('select[name="material-select"]');
                $(this.materialSelect).selectpicker();

                this.productSelect = this.el.querySelector('select[name="product-select"]');
                $(this.productSelect).selectpicker();

                this.compositesSelect = this.el.querySelector('select[name="composites-select"]');
                $(this.compositesSelect).selectpicker();

                this.routeSelect = this.el.querySelector('select[name="route-select"]');
                $(this.routeSelect).selectpicker();

                this.collectorSelect = this.el.querySelector('select[name="collector-select"]');
                $(this.collectorSelect).selectpicker();

                this.hazardousSelect = this.el.querySelector('select[name="hazardous-select"]');
                $(this.hazardousSelect).selectpicker();

                this.cleanSelect = this.el.querySelector('select[name="clean-select"]');
                $(this.cleanSelect).selectpicker();

                this.mixedSelect = this.el.querySelector('select[name="mixed-select"]');
                $(this.mixedSelect).selectpicker();

                this.directSelect = this.el.querySelector('select[name="direct-select"]');
                $(this.directSelect).selectpicker();

                this.isCompositeSelect = this.el.querySelector('select[name="iscomposite-select"]');
                $(this.isCompositeSelect).selectpicker();

                this.displayLevelSelect = this.el.querySelector('select[name="display-level-select"]');
            },

            renderAreaSelectModal: function () {
                var _this = this;

                this.areaModal = this.el.querySelector('.area-filter.modal');
                html = document.getElementById('area-select-modal-template').innerHTML;
                template = _.template(html);
                this.areaModal.innerHTML = template({
                    levels: this.areaLevels
                });
                this.areaMap = new Map({
                    el: this.areaModal.querySelector('.map'),
                    center: [-3.65, 37.53], // check centerOnLayer (map.js)
                    zoom: 2, // check centerOnLayer (map.js)
                    source: 'light',
                    opacity: 1.0
                });
                this.areaLevelSelect = this.el.querySelector('select[name="area-level-select"]');
                this.areaMap.addLayer(
                    'areas', {
                        stroke: 'rgb(100, 150, 250)',
                        fill: 'rgba(100, 150, 250, 0.5)',
                        select: {
                            selectable: true,
                            stroke: 'rgb(230, 230, 0)',
                            fill: 'rgba(230, 230, 0, 0.5)',
                            onChange: function (areaFeats) {
                                var levelId = _this.areaLevelSelect.value;
                                var labels = [];
                                var areas = _this.areas[levelId];
                                _this.selectedAreasOrigin = [];

                                console.log("areaFeats: ", areaFeats);

                                if (_this.areaMap.block == "origin") {
                                    // The user has selected an area for the Origin block:

                                    areaFeats.forEach(function (areaFeat) {
                                        labels.push(areaFeat.label);
                                        _this.selectedAreasOrigin.push(areas.get(areaFeat.id));
                                    });

                                    if (_this.selectedAreasOrigin.length > 0) {
                                        $("#areaSelectionsOrigin").fadeIn();
                                    } else {
                                        $("#areaSelectionsOrigin").fadeOut();
                                    }

                                    $("#areaSelectionsOriginTextarea").html(labels.join('; '))

                                } else if (_this.areaMap.block == "flows") {


                                } else if (_this.areaMap.block == "destination") {


                                }


                                // Show the selected areas in the textarea in the modal:
                                $("#areaSelectionsModalTextarea").html(labels.join('; '))

                                // Trigger input event on textareas in order to autoresize if needed:
                                $(".selections").trigger('input');
                            }
                        }
                    });
            },

            changeAreaLevel: function (resetValues) {
                var levelId = this.areaLevelSelect.value;

                if (resetValues) {
                    if (this.areaMap.block == "origin") {
                        this.selectedAreasOrigin = [];
                        this.el.querySelector('#areaSelectionsOriginTextarea').innerHTML = '';
                    } else if (this.areaMap.block == "flows") {
                        this.selectedAreasFlows = [];
                    } else if (this.areaMap.block == "destination") {
                        this.selectedAreasDestination = [];
                    }
                }

                // Clear the textarea with selected areas in the modal:
                $("#areaSelectionsModalTextarea").html("")

                this.prepareAreas(levelId);
            },

            prepareAreas: function (levelId, onSuccess) {
                var _this = this;
                var areas = this.areas[levelId];
                if (areas && areas.size() > 0) {
                    this.drawAreas(areas)
                    if (onSuccess) onSuccess();
                } else {
                    areas = new Collection([], {
                        apiTag: 'areas',
                        apiIds: [levelId]
                    });
                    this.areas[levelId] = areas;
                    this.loader.activate();
                    areas.fetch({
                        success: function () {
                            _this.loader.deactivate();
                            _this.drawAreas(areas);
                            if (onSuccess) onSuccess();
                        },
                        error: function (res) {
                            _this.loader.deactivate();
                            _this.onError(res);
                        }
                    });
                }
            },

            drawAreas: function (areas) {
                var _this = this;
                this.areaMap.clearLayer('areas');
                areas.forEach(function (area) {
                    var coords = area.get('geom').coordinates,
                        name = area.get('name');
                    _this.areaMap.addPolygon(coords, {
                        projection: 'EPSG:4326',
                        layername: 'areas',
                        type: 'MultiPolygon',
                        tooltip: name,
                        label: name,
                        id: area.id,
                        renderOSM: false
                    });
                })
                this.areaMap.centerOnLayer('areas');
            },

            showAreaSelection: function (event) {
                var _this = this;
                var labelStringArray = [];
                var selectionStyle = new ol.style.Style({
                    stroke: 'rgb(230, 230, 0)',
                    fill: 'rgba(230, 230, 0, 0.5)',
                });

                // Used to determine which 'Select area'-button the user has pressed, either 'origin', 'flows', or 'destination': 
                _this.areaMap.block = $(event.currentTarget).data('area-select-block');

                // Show the text in the area selection modal Textarea and trigger input:
                $("#areaSelectionsModalTextarea").html(labelStringArray.join("; "));
                $(".selections").trigger('input');

                // Show the actual modal:
                $(this.areaModal).modal('show');

                setTimeout(function () {

                    // After the modal has fully opened, call updateSize to render the map with the correct dimensions:
                    _this.areaMap.map.updateSize();
                    if (_this.areaLevels.length > 0) {
                        _this.changeAreaLevel(false);
                    }



                    // Clear all the selected features from the areaMap:
                    _this.areaMap.layers.areas.select.getFeatures().clear();

                    // Add the correct selected features to the areaMap:
                    if (_this.areaMap.block == "origin") {

                        // Add selected origin areas as selections to the map:
                        if (_this.selectedAreasOrigin && _this.selectedAreasOrigin.length > 0) {

                            // Create ol.Collection of Features to which we can add Features:
                            var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasOrigin:
                            _this.selectedAreasOrigin.forEach(selectedArea => {

                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);

                                // Add it to the Features ol.Collection: 
                                features.push(feature);

                            });


                            //_this.areaMap.getLayer('areas').redraw();

                        }

                    } else if (this.areaMap.block == "flows") {
                        //this.selectedAreasFlows = [];
                    } else if (this.areaMap.block == "destination") {
                        //this.selectedAreasDestination = [];
                    }

                    // End of setTimeout
                }, 200);



            },

            close: function () {
                //        if (this.flowsView) this.flowsView.close();
                FilterFlowsView.__super__.close.call(this);
            }

        });

        return FilterFlowsView;

    }
);