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

                this.origin = {};
                this.destination = {};
                this.flows = {};
                this.dimensions = {};
                this.maxNumberOfDimensions = 1;
                this.selectedAreasOrigin = [];
                this.selectedAreasDestination = [];
                this.selectedAreasFlows = [];

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
                'click #reset-filters': 'resetFiltersToDefault',
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
                    levels: this.areaLevels
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

                function filterActivities(event, clickedIndex, checked) {
                    let eventTargetID = event.target.id;

                    let selectedActivityGroupIDs = [];
                    let filteredActivities = [];
                    let allActivitiesOptionsHTML = "";
                    let newActivityOptionsHTML = "";

                    let activityGroupsSelect;
                    let activitySelect;
                    if (eventTargetID == "origin-activitygroup-select") {
                        activityGroupsSelect = _this.origin.activityGroupsSelect;
                        activitySelect = _this.origin.activitySelect;

                    } else if (eventTargetID == "destination-activitygroup-select") {
                        activityGroupsSelect = _this.destination.activityGroupsSelect;
                        activitySelect = _this.destination.activitySelect;
                    }

                    // Get the array with ID's of the selected activityGroup(s) from the .selectpicker:
                    selectedActivityGroupIDs = $(activityGroupsSelect).val()

                    // If no activity groups are selected, reset the activity filter to again show all activities:
                    if (selectedActivityGroupIDs.length == 0) {
                        allActivitiesOptionsHTML = '<option selected value="-1">All (' + _this.activities.length + ')</option><option data-divider="true"></option>';
                        _this.activities.models.forEach(activity => allActivitiesOptionsHTML += "<option>" + activity.attributes.name + "</option>");
                        $(activitySelect).html(allActivitiesOptionsHTML);
                        $(activitySelect).selectpicker("refresh");
                    } else {
                        // Filter all activities by the selected Activity Groups:
                        filteredActivities = _this.activities.models.filter(function (activity) {
                            return selectedActivityGroupIDs.includes(activity.attributes.activitygroup.toString())
                        });

                        // Fill selectPicker with filtered activities, add to DOM, and refresh:
                        newActivityOptionsHTML = '<option selected value="-1">All (' + filteredActivities.length + ')</option><option data-divider="true"></option>';
                        filteredActivities.forEach(activity => newActivityOptionsHTML += "<option>" + activity.attributes.name + "</option>");
                        $(activitySelect).html(newActivityOptionsHTML);
                        $(activitySelect).selectpicker("refresh");
                    }
                }


                // /////////////////////////////////
                // Multicheck events:

                // Origin: -------------------------
                $(this.origin.filterLevelSelect).change(function () {
                    $(".activitySelectContainerOrigin").fadeToggle("fast");
                });
                $(this.origin.filterLevelSelect).on('changed.bs.select', multiCheck);
                $(this.origin.activityGroupsSelect).on('changed.bs.select', multiCheck);
                $(this.origin.activityGroupsSelect).on('changed.bs.select', filterActivities);
                $(this.origin.activitySelect).on('changed.bs.select', multiCheck);
                $(this.origin.processSelect).on('changed.bs.select', multiCheck);

                // Hide/show Activity Group and Activity or Treatment method:
                $(this.origin.roleSelect).on('changed.bs.select', function () {
                    let role = $(_this.origin.roleSelect).val();
                    if (role == "treatment") {
                        $(".originContainerActivity").fadeOut();
                        $(".originContainerTreatmentMethod").fadeIn();
                    } else if (role == "production") {
                        $(".originContainerActivity").fadeIn();
                        $(".originContainerTreatmentMethod").fadeOut();
                    } else {
                        $(".originContainerActivity").fadeOut();
                        $(".originContainerTreatmentMethod").fadeOut();
                    }
                });


                // Destination: ---------------------

                $(this.destination.filterLevelSelect).change(function () {
                    $(".activitySelectContainerDestination").fadeToggle("fast");
                });
                $(this.destination.filterLevelSelect).on('changed.bs.select', multiCheck);
                $(this.destination.activityGroupsSelect).on('changed.bs.select', multiCheck);
                $(this.destination.activityGroupsSelect).on('changed.bs.select', filterActivities);
                $(this.destination.activitySelect).on('changed.bs.select', multiCheck);
                $(this.destination.processSelect).on('changed.bs.select', multiCheck);

                // Hide/show Activity Group and Activity or Treatment method:
                $(this.destination.roleSelect).on('changed.bs.select', function () {
                    let role = $(_this.destination.roleSelect).val();
                    if (role == "treatment") {
                        $(".destinationContainerActivity").fadeOut();
                        $(".destinationContainerTreatmentMethod").fadeIn();
                    } else if (role == "production") {
                        $(".destinationContainerActivity").fadeIn();
                        $(".destinationContainerTreatmentMethod").fadeOut();
                    } else {
                        $(".destinationContainerActivity").fadeOut();
                        $(".destinationContainerTreatmentMethod").fadeOut();
                    }
                });


                // Flows: ---------------------------
                $(this.flows.wasteSelect).on('changed.bs.select', multiCheck);
                $(this.flows.materialSelect).on('changed.bs.select', multiCheck);
                $(this.flows.productSelect).on('changed.bs.select', multiCheck);
                $(this.flows.compositeSelect).on('changed.bs.select', multiCheck);
                $(this.flows.cleanSelect).on('changed.bs.select', multiCheck);
                $(this.flows.mixedSelect).on('changed.bs.select', multiCheck);
                $(this.flows.directSelect).on('changed.bs.select', multiCheck);
                $(this.flows.isCompositeSelect).on('changed.bs.select', multiCheck);



                // Dimension toggles: ---------------------------

                $(".dimensionToggle").change(function () {
                    let checkedToggles = [];
                    let uncheckedToggles = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.dimensionToggle').each(function (index, value) {

                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            uncheckedToggles.push($(this));
                        } else {
                            checkedToggles.push($(this));
                        }
                    });

                    // If the maximum number of dimensions has been selected:
                    if (_this.maxNumberOfDimensions == checkedToggles.length) {
                        // Disable the remaining unchecked toggles:
                        $(uncheckedToggles).each(function (index, value) {
                            this.bootstrapToggle('disable');
                        });
                    } else {
                        // (Re)enable the toggles:
                        $(uncheckedToggles).each(function (index, value) {
                            this.bootstrapToggle('enable');
                        });
                    }

                });

                // Show granularity on toggle change:
                $("#dim-toggle-time").change(function () {
                    $("#gran-toggle-time-col").fadeToggle();
                });
                $("#dim-toggle-space").change(function () {
                    $("#gran-space-col").fadeToggle();
                });
                $("#dim-toggle-economic-activity").change(function () {
                    $("#gran-econ-activity-col").fadeToggle();
                });
                $("#dim-toggle-treatment-method").change(function () {
                    $("#gran-treatment-method-col").fadeToggle();
                });
            },

            initializeControls: function () {

                // ///////////////////////////////////////////////
                // Origin-controls:

                // Initialize bootstrap-toggle for filter level:
                this.origin.filterLevelSelect = this.el.querySelector('#origin-toggleFilterLevel');
                $(this.origin.filterLevelSelect).bootstrapToggle();

                this.origin.roleSelect = this.el.querySelector('select[name="origin-role"]');
                $(this.origin.roleSelect).selectpicker();

                this.origin.activityGroupsSelect = this.el.querySelector('select[name="origin-activitygroup-select"]');
                $(this.origin.activityGroupsSelect).selectpicker();

                this.origin.activitySelect = this.el.querySelector('select[name="origin-activity-select"]');
                $(this.origin.activitySelect).selectpicker();

                this.origin.processSelect = this.el.querySelector('select[name="origin-process-select"]');
                $(this.origin.processSelect).selectpicker();

                // ///////////////////////////////////////////////
                // Destination-controls:

                this.destination.filterLevelSelect = this.el.querySelector('#destination-toggleFilterLevel');
                $(this.destination.filterLevelSelect).bootstrapToggle();

                this.destination.roleSelect = this.el.querySelector('select[name="destination-role"]');
                $(this.destination.roleSelect).selectpicker();

                this.destination.activityGroupsSelect = this.el.querySelector('select[name="destination-activitygroup-select"]');
                $(this.destination.activityGroupsSelect).selectpicker();

                this.destination.activitySelect = this.el.querySelector('select[name="destination-activity-select"]');
                $(this.destination.activitySelect).selectpicker();

                this.destination.processSelect = this.el.querySelector('select[name="destination-process-select"]');
                $(this.destination.processSelect).selectpicker();


                // ///////////////////////////////////////////////
                // Flows-controls:

                this.flows.yearSelect = this.el.querySelector('select[name="flows-year-select"]');
                $(this.flows.yearSelect).selectpicker();

                this.flows.wasteSelect = this.el.querySelector('select[name="flows-waste-select"]');
                $(this.flows.wasteSelect).selectpicker();

                this.flows.materialSelect = this.el.querySelector('select[name="flows-material-select"]');
                $(this.flows.materialSelect).selectpicker();

                this.flows.productSelect = this.el.querySelector('select[name="flows-product-select"]');
                $(this.flows.productSelect).selectpicker();

                this.flows.compositesSelect = this.el.querySelector('select[name="flows-composites-select"]');
                $(this.flows.compositesSelect).selectpicker();

                this.flows.routeSelect = this.el.querySelector('select[name="flows-route-select"]');
                $(this.flows.routeSelect).selectpicker();

                this.flows.collectorSelect = this.el.querySelector('select[name="flows-collector-select"]');
                $(this.flows.collectorSelect).selectpicker();

                this.flows.hazardousSelect = this.el.querySelector('select[name="flows-hazardous-select"]');
                $(this.flows.hazardousSelect).selectpicker();

                this.flows.cleanSelect = this.el.querySelector('select[name="flows-clean-select"]');
                $(this.flows.cleanSelect).selectpicker();

                this.flows.mixedSelect = this.el.querySelector('select[name="flows-mixed-select"]');
                $(this.flows.mixedSelect).selectpicker();

                this.flows.directSelect = this.el.querySelector('select[name="flows-direct-select"]');
                $(this.flows.directSelect).selectpicker();

                this.flows.isCompositeSelect = this.el.querySelector('select[name="flows-iscomposite-select"]');
                $(this.flows.isCompositeSelect).selectpicker();


                // //////////////////////////////////
                // Dimension controls:

                // Time
                this.dimensions.timeToggle = this.el.querySelector('#dim-toggle-time');
                $(this.dimensions.timeToggle).bootstrapToggle();
                this.dimensions.timeToggleGran = this.el.querySelector('#gran-toggle-time');
                $(this.dimensions.timeToggleGran).bootstrapToggle();

                // Space
                this.dimensions.spaceToggle = this.el.querySelector('#dim-toggle-space');
                $(this.dimensions.spaceToggle).bootstrapToggle();
                this.dimensions.spaceLevelGranSelect = this.el.querySelector('#dim-space-gran-select');

                // Economic activity:
                this.dimensions.economicActivityToggle = this.el.querySelector('#dim-toggle-economic-activity');
                $(this.dimensions.economicActivityToggle).bootstrapToggle();
                this.dimensions.economicActivityToggleGran = this.el.querySelector('#gran-toggle-econ-activity');
                $(this.dimensions.economicActivityToggleGran).bootstrapToggle();

                // Treatment method:
                this.dimensions.treatmentMethodToggle = this.el.querySelector('#dim-toggle-treatment-method');
                $(this.dimensions.treatmentMethodToggle).bootstrapToggle();

                this.dimensions.treatmentMethodToggleGran = this.el.querySelector('#gran-toggle-treatment-method');
                $(this.dimensions.treatmentMethodToggleGran).bootstrapToggle();

                // Materials:
                this.dimensions.materialToggle = this.el.querySelector('#dim-toggle-material');
                $(this.dimensions.materialToggle).bootstrapToggle();

                // Logistics:
                this.dimensions.logisticsToggle = this.el.querySelector('#dim-toggle-logistics');
                $(this.dimensions.logisticsToggle).bootstrapToggle();


                // //////////////////////////////////
                // Other:

                this.displayLevelSelect = this.el.querySelector('select[name="display-level-select"]');

                // Initialize all textarea-autoresize components:
                $(".selections").textareaAutoSize();

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

                                if (_this.areaMap.block == "origin") {
                                    // The user has selected an area for the Origin block:
                                    _this.selectedAreasOrigin = [];
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

                                } else if (_this.areaMap.block == "destination") {
                                    // The user has selected an area for the Destination block:
                                    _this.selectedAreasDestination = [];
                                    areaFeats.forEach(function (areaFeat) {
                                        labels.push(areaFeat.label);
                                        _this.selectedAreasDestination.push(areas.get(areaFeat.id));
                                    });

                                    if (_this.selectedAreasDestination.length > 0) {
                                        $("#areaSelectionsDestination").fadeIn();
                                    } else {
                                        $("#areaSelectionsDestination").fadeOut();
                                    }
                                    $("#areaSelectionsDestinationTextarea").html(labels.join('; '))

                                } else if (_this.areaMap.block == "flows") {
                                    // The user has selected an area for the Flows block:
                                    _this.selectedAreasFlows = [];
                                    areaFeats.forEach(function (areaFeat) {
                                        labels.push(areaFeat.label);
                                        _this.selectedAreasFlows.push(areas.get(areaFeat.id));
                                    });

                                    if (_this.selectedAreasFlows.length > 0) {
                                        $("#areaSelectionsFlows").fadeIn();
                                    } else {
                                        $("#areaSelectionsFlows").fadeOut();
                                    }
                                    $("#areaSelectionsFlowsTextarea").html(labels.join('; '))
                                }

                                // Show the selected areas in the textarea in the modal:
                                $("#areaSelectionsModalTextarea").html(labels.join('; '));

                                // Trigger input event on textareas in order to autoresize if needed:
                                $(".selections").trigger('input');


                                // Refresh after onChange:
                                _this.areaMap.map.updateSize()
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

                // Clear all the selected features from the areaMap:
                //_this.areaMap.removeSelectedFeatures('areas');

                // Used to determine which 'Select area'-button the user has pressed, either 'origin', 'flows', or 'destination': 
                _this.areaMap.block = $(event.currentTarget).data('area-select-block');

                // Show the actual modal:
                $(this.areaModal).modal('show');

                // After the modal has fully opened...
                setTimeout(function () {
                    // Call updateSize to render the map with the correct dimensions:
                    _this.areaMap.map.updateSize();
                    if (_this.areaLevels.length > 0) {
                        _this.changeAreaLevel(false);
                    }

                    // Add the correct selected features to the areaMap:
                    if (_this.areaMap.block == "origin") {

                        // Add selected origin areas as selections to the map:
                        if (_this.selectedAreasOrigin && _this.selectedAreasOrigin.length > 0) {
                            var labels = [];
                            // Create ol.Collection of Features to which we can add Features:
                            var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasOrigin:
                            _this.selectedAreasOrigin.forEach(selectedArea => {
                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);
                                labels.push(selectedArea.label);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                            $("#areaSelectionsModalTextarea").html(labels.join('; '));
                        }

                    } else if (_this.areaMap.block == "destination") {
                        // Add selected destination areas as selections to the map:
                        if (_this.selectedAreasDestination && _this.selectedAreasDestination.length > 0) {

                            // Create ol.Collection of Features to which we can add Features:
                            var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasDestination:
                            _this.selectedAreasDestination.forEach(selectedArea => {
                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                        }

                    } else if (_this.areaMap.block == "flows") {
                        // Add selected Flows areas as selections to the map:
                        if (_this.selectedAreasFlows && _this.selectedAreasFlows.length > 0) {

                            // Create ol.Collection of Features to which we can add Features:
                            var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasFlows:
                            _this.selectedAreasFlows.forEach(selectedArea => {
                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                        }
                    }

                    // Show the text in the area selection modal Textarea and trigger input:
                    $("#areaSelectionsModalTextarea").html(labelStringArray.join("; "));
                    $(".selections").trigger('input');

                    // End of setTimeout
                }, 200);



            },

            resetFiltersToDefault: function () {
                console.log("resetFiltersToDefault");

                // ///////////////////////////////////////////////
                // Origin-controls:

                // // Initialize bootstrap-toggle for filter level:
                // this.origin.filterLevelSelect = this.el.querySelector('#origin-toggleFilterLevel');
                // $(this.origin.filterLevelSelect).bootstrapToggle();

                // this.origin.roleSelect = this.el.querySelector('select[name="origin-role"]');
                // $(this.origin.roleSelect).selectpicker();

                // this.origin.activityGroupsSelect = this.el.querySelector('select[name="origin-activitygroup-select"]');
                // $(this.origin.activityGroupsSelect).selectpicker();

                // this.origin.activitySelect = this.el.querySelector('select[name="origin-activity-select"]');
                // $(this.origin.activitySelect).selectpicker();

                // this.origin.processSelect = this.el.querySelector('select[name="origin-process-select"]');
                // $(this.origin.processSelect).selectpicker();

                // // ///////////////////////////////////////////////
                // // Destination-controls:

                // this.destination.filterLevelSelect = this.el.querySelector('#destination-toggleFilterLevel');
                // $(this.destination.filterLevelSelect).bootstrapToggle();

                // this.destination.roleSelect = this.el.querySelector('select[name="destination-role"]');
                // $(this.destination.roleSelect).selectpicker();

                // this.destination.activityGroupsSelect = this.el.querySelector('select[name="destination-activitygroup-select"]');
                // $(this.destination.activityGroupsSelect).selectpicker();

                // this.destination.activitySelect = this.el.querySelector('select[name="destination-activity-select"]');
                // $(this.destination.activitySelect).selectpicker();

                // this.destination.processSelect = this.el.querySelector('select[name="destination-process-select"]');
                // $(this.destination.processSelect).selectpicker();


                // // ///////////////////////////////////////////////
                // // Flows-controls:

                // this.flows.yearSelect = this.el.querySelector('select[name="flows-year-select"]');
                // $(this.flows.yearSelect).selectpicker();

                // this.flows.wasteSelect = this.el.querySelector('select[name="flows-waste-select"]');
                // $(this.flows.wasteSelect).selectpicker();

                // this.flows.materialSelect = this.el.querySelector('select[name="flows-material-select"]');
                // $(this.flows.materialSelect).selectpicker();

                // this.flows.productSelect = this.el.querySelector('select[name="flows-product-select"]');
                // $(this.flows.productSelect).selectpicker();

                // this.flows.compositesSelect = this.el.querySelector('select[name="flows-composites-select"]');
                // $(this.flows.compositesSelect).selectpicker();

                // this.flows.routeSelect = this.el.querySelector('select[name="flows-route-select"]');
                // $(this.flows.routeSelect).selectpicker();

                // this.flows.collectorSelect = this.el.querySelector('select[name="flows-collector-select"]');
                // $(this.flows.collectorSelect).selectpicker();

                // this.flows.hazardousSelect = this.el.querySelector('select[name="flows-hazardous-select"]');
                // $(this.flows.hazardousSelect).selectpicker();

                // this.flows.cleanSelect = this.el.querySelector('select[name="flows-clean-select"]');
                // $(this.flows.cleanSelect).selectpicker();

                // this.flows.mixedSelect = this.el.querySelector('select[name="flows-mixed-select"]');
                // $(this.flows.mixedSelect).selectpicker();

                // this.flows.directSelect = this.el.querySelector('select[name="flows-direct-select"]');
                // $(this.flows.directSelect).selectpicker();

                // this.flows.isCompositeSelect = this.el.querySelector('select[name="flows-iscomposite-select"]');
                // $(this.flows.isCompositeSelect).selectpicker();


                // // //////////////////////////////////
                // // Dimension controls:

                // // Time
                // this.dimensions.timeToggle = this.el.querySelector('#dim-toggle-time');
                // $(this.dimensions.timeToggle).bootstrapToggle();
                // this.dimensions.timeToggleGran = this.el.querySelector('#gran-toggle-time');
                // $(this.dimensions.timeToggleGran).bootstrapToggle();

                // // Space
                // this.dimensions.spaceToggle = this.el.querySelector('#dim-toggle-space');
                // $(this.dimensions.spaceToggle).bootstrapToggle();
                // this.dimensions.spaceLevelGranSelect = this.el.querySelector('#dim-space-gran-select');

                // // Economic activity:
                // this.dimensions.economicActivityToggle = this.el.querySelector('#dim-toggle-economic-activity');
                // $(this.dimensions.economicActivityToggle).bootstrapToggle();
                // this.dimensions.economicActivityToggleGran = this.el.querySelector('#gran-toggle-econ-activity');
                // $(this.dimensions.economicActivityToggleGran).bootstrapToggle();

                // // Treatment method:
                // this.dimensions.treatmentMethodToggle = this.el.querySelector('#dim-toggle-treatment-method');
                // $(this.dimensions.treatmentMethodToggle).bootstrapToggle();

                // this.dimensions.treatmentMethodToggleGran = this.el.querySelector('#gran-toggle-treatment-method');
                // $(this.dimensions.treatmentMethodToggleGran).bootstrapToggle();

                // // Materials:
                // this.dimensions.materialToggle = this.el.querySelector('#dim-toggle-material');
                // $(this.dimensions.materialToggle).bootstrapToggle();

                // // Logistics:
                // this.dimensions.logisticsToggle = this.el.querySelector('#dim-toggle-logistics');
                // $(this.dimensions.logisticsToggle).bootstrapToggle();


                // // //////////////////////////////////
                // // Other:

                // this.displayLevelSelect = this.el.querySelector('select[name="display-level-select"]');

                // // Initialize all textarea-autoresize components:
                // $(".selections").textareaAutoSize();


            },

            close: function () {
                //        if (this.flowsView) this.flowsView.close();
                FilterFlowsView.__super__.close.call(this);
            }

        });

        return FilterFlowsView;

    }
);