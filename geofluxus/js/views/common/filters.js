define(['views/common/baseview',
        'underscore',
        'collections/collection',
        'visualizations/map',
        'openlayers',
        'utils/utils',
        'bootstrap',
    ],

    function (BaseView, _, Collection, Map, ol, utils) {

        var FiltersView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                FiltersView.__super__.initialize.apply(this, [options]);
                _.bindAll(this, 'prepareAreas');

                this.origin = {};
                this.destination = {};
                this.flows = {};
                this.selectedAreasOrigin = [];
                this.selectedAreasDestination = [];
                this.selectedAreasFlows = [];
                this.savedFiltersModal = "";

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
                this.processgroups = new Collection([], {
                    apiTag: 'processgroups'
                });
                this.processes = new Collection([], {
                    apiTag: 'processes'
                });
                this.wastes02 = new Collection([], {
                    apiTag: 'wastes02'
                });
                this.wastes04 = new Collection([], {
                    apiTag: 'wastes04'
                });
                this.wastes06 = new Collection([], {
                    apiTag: 'wastes06'
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
                this.years = new Collection([], {
                    apiTag: 'years'
                });
                this.months = new Collection([], {
                    apiTag: 'months'
                });
                this.savedFilters = new Collection([], {
                    apiTag: 'filters'
                });

                this.areas = {};

                this.loader.activate();
                var promises = [
                    this.activityGroups.fetch(),
                    this.activities.fetch(),
                    this.processes.fetch(),
                    this.processgroups.fetch(),
                    this.wastes02.fetch(),
                    this.wastes04.fetch(),
                    this.wastes06.fetch(),
                    this.materials.fetch(),
                    this.products.fetch(),
                    this.composites.fetch(),
                    this.areaLevels.fetch(),
                    this.years.fetch(),
                    this.months.fetch(),
                    this.savedFilters.fetch(),
                ];
                Promise.all(promises).then(function () {
                    _this.loader.deactivate();
                    _this.render();
                })
            },

            // DOM events
            events: {
                'click .area-select-button': 'showAreaSelection',
                'change select[name="area-level-select"]': 'changeAreaLevel',
                'click #reset-filters': 'resetFiltersToDefault',
                'click .clear-areas-button': 'clearAreas',
                'click .openSavedFilterModal': 'showSavedFiltersModal',
                'click #new-filter-name-btn': 'saveNewFilter',
                'click #delete-filter-config': 'showConfirmModal',
                'click #update-filter-config': "updateFilterConfig",
                "click #edit-filter-name": "showFilterEdit",
                "click #save-filter-name": "updateFilterName",
                "click #load-filter-config": "loadFilterConfiguration",
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML,
                    template = _.template(html),
                    _this = this;
                // Add to template context:
                this.el.innerHTML = template({
                    processes: this.processes,
                    processgroups: this.processgroups,
                    wastes02: this.wastes02,
                    wastes04: this.wastes04,
                    wastes06: this.wastes06,
                    materials: this.materials,
                    products: this.products,
                    composites: this.composites,
                    activities: this.activities,
                    activityGroups: this.activityGroups,
                    levels: this.areaLevels,
                    years: this.years,
                    months: this.months,
                });

                console.log("Saved filters on render: ", this.savedFilters.models);

                // Activate help icons
                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                $(popovers).popover({
                    trigger: "focus"
                });

                this.renderSavedFiltersModal();
                this.renderAreaSelectModal();

                this.renderConfirmModal();

                this.initializeControls();

                this.addEventListeners();
            },

            addEventListeners: function () {
                var _this = this;

                function multiCheck(evt, clickedIndex, checked) {
                    var select = evt.target;
                    if (checked) {
                        // User clicks 'All'' -> deselect all other options:
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
                    let newActivityOptionsHTML = "";

                    let activityGroupsSelect;
                    let activitySelect;
                    let activitySelectContainer;

                    if (eventTargetID == "origin-activitygroup-select") {
                        activityGroupsSelect = _this.origin.activityGroupsSelect;
                        activitySelect = _this.origin.activitySelect;
                        activitySelectContainer = $(".activitySelectContainerOrigin");
                    } else if (eventTargetID == "destination-activitygroup-select") {
                        activityGroupsSelect = _this.destination.activityGroupsSelect;
                        activitySelect = _this.destination.activitySelect;
                        activitySelectContainer = $(".activitySelectContainerDestination");
                    }

                    // Get the array with ID's of the selected activityGroup(s) from the .selectpicker:
                    selectedActivityGroupIDs = $(activityGroupsSelect).val()

                    // If no activity groups are selected, reset the activity filter to again show all activities:
                    if (selectedActivityGroupIDs.length == 0 || selectedActivityGroupIDs[0] == "-1") {
                        activitySelectContainer.fadeOut("fast");

                    } else {
                        // Filter all activities by the selected Activity Groups:
                        filteredActivities = _this.activities.models.filter(function (activity) {
                            return selectedActivityGroupIDs.includes(activity.attributes.activitygroup.toString())
                        });

                        // Fill selectPicker with filtered activities, add to DOM, and refresh:
                        newActivityOptionsHTML = '<option selected value="-1">All (' + filteredActivities.length + ')</option><option data-divider="true"></option>';
                        filteredActivities.forEach(activity => newActivityOptionsHTML += "<option value='" + activity.attributes.id + "'>" + activity.attributes.nace + " " + activity.attributes.name + "</option>");
                        $(activitySelect).html(newActivityOptionsHTML);
                        $(activitySelect).selectpicker("refresh");

                        activitySelectContainer.fadeIn("fast");
                    }
                }

                function filterTreatmentMethods(event, clickedIndex, checked) {
                    let eventTargetID = event.target.id;

                    let selectedProcessGroupIDs = [];
                    let filteredProcesses = [];
                    let newProcessOptionsHTML = "";

                    let processGroupSelect;
                    let processSelect;
                    let processSelectContainer;

                    if (eventTargetID == "origin-processGroup-select") {
                        processGroupSelect = _this.origin.processGroupSelect;
                        processSelect = _this.origin.processSelect;
                        processSelectContainer = $("#originContainerProcesses");
                    } else if (eventTargetID == "destination-processGroup-select") {
                        processGroupSelect = _this.destination.processGroupSelect;
                        processSelect = _this.destination.processSelect;
                        processSelectContainer = $("#destinationContainerProcesses");
                    }

                    // Get the array with ID's of the selected treatment method group(s) from the .selectpicker:
                    selectedProcessGroupIDs = $(processGroupSelect).val()

                    // If no process groups are selected, reset filter:
                    if (selectedProcessGroupIDs.length == 0 || selectedProcessGroupIDs[0] == "-1") {
                        processSelectContainer.fadeOut("fast");

                    } else {
                        // Filter all activities by the selected Process Groups:
                        filteredProcesses = _this.processes.models.filter(function (process) {
                            return selectedProcessGroupIDs.includes(process.attributes.processgroup.toString())
                        });

                        // Fill selectPicker with filtered items, add to DOM, and refresh:
                        newProcessOptionsHTML = '<option selected value="-1">All (' + filteredProcesses.length + ')</option><option data-divider="true"></option>';
                        filteredProcesses.forEach(process => newProcessOptionsHTML += "<option value='" + process.attributes.id + "'>" + process.attributes.code + " " + process.attributes.name + "</option>");
                        $(processSelect).html(newProcessOptionsHTML);
                        $(processSelect).selectpicker("refresh");

                        processSelectContainer.fadeIn("fast");
                    }
                }

                function filterEwcHazardous(event, clickedIndex, checked) {
                    let showOnlyHazardous = $(_this.flows.hazardousSelect).val();

                    switch (showOnlyHazardous) {
                        case "both":
                            $("#wastes02col").show();
                            $("#wastes04col").hide();
                            $(".chevronEwc06").show();
                            $("#flows-waste06-label").css("position", "relative");
                            $("#helpiconWaste06").removeClass("hazaIconPos");
                            $("#wastes06col").hide();
                            break;
                        case "yes":
                            showOnlyHazardous = true;
                            $("#wastes02col").hide();
                            $("#wastes04col").hide();

                            break;
                        case "no":
                            showOnlyHazardous = false;
                            $("#wastes02col").hide();
                            $("#wastes04col").hide();
                            break;
                        default:
                            break;
                    }

                    if (showOnlyHazardous != "both") {
                        let filteredWastes06 = _this.wastes06.models.filter(function (waste06) {
                            return waste06.attributes.hazardous == showOnlyHazardous;
                        });

                        // Fill selectPicker with filtered items, add to DOM, and refresh:
                        newWastes06OptionsHTML = '<option selected value="-1">All (' + filteredWastes06.length + ')</option><option data-divider="true"></option>';
                        filteredWastes06.forEach(waste06 => newWastes06OptionsHTML += "<option class='dropdown-item' value='" + waste06.attributes.id + "'>" + waste06.attributes.ewc_code + " " + waste06.attributes.ewc_name + (waste06.attributes.hazardous ? "*" : "") + "</option>");
                        $(_this.flows.waste06Select).html(newWastes06OptionsHTML);
                        $(_this.flows.waste06Select).selectpicker("refresh");

                        $(".chevronEwc06").hide();
                        $("#flows-waste06-label").css("position", "static");
                        $("#helpiconWaste06").addClass("hazaIconPos");
                        $("#wastes06col").fadeIn("fast");
                    }
                }

                function filterEWC02to04(event, clickedIndex, checked) {
                    let selectedEWC02IDs = [];
                    let filteredWastes04 = [];
                    let newWastes04OptionsHTML = "";

                    selectedEWC02IDs = $(_this.flows.waste02Select).val()

                    if (selectedEWC02IDs.length == 0 || selectedEWC02IDs[0] == "-1") {
                        $("#wastes04col").fadeOut("fast");

                    } else {
                        filteredWastes04 = _this.wastes04.models.filter(function (waste04) {
                            return selectedEWC02IDs.includes(waste04.attributes.waste02.toString())
                        });

                        newWastes04OptionsHTML = '<option selected value="-1">All (' + filteredWastes04.length + ')</option><option data-divider="true"></option>';
                        filteredWastes04.forEach(waste04 => newWastes04OptionsHTML += "<option value='" + waste04.attributes.id + "'>" + waste04.attributes.ewc_code + " " + waste04.attributes.ewc_name + "</option>");
                        $(_this.flows.waste04Select).html(newWastes04OptionsHTML);
                        $(_this.flows.waste04Select).selectpicker("refresh");

                        $("#wastes04col").fadeIn("fast");
                    }
                }

                function filterEWC04to06() {
                    let selectedEWC04IDs = [];
                    let filteredWastes06 = [];
                    let newWastes06OptionsHTML = "";

                    selectedEWC04IDs = $(_this.flows.waste04Select).val()

                    if (selectedEWC04IDs.length == 0 || selectedEWC04IDs[0] == "-1") {
                        $("#wastes06col").fadeOut("fast");

                    } else {
                        filteredWastes06 = _this.wastes06.models.filter(function (waste06) {
                            return selectedEWC04IDs.includes(waste06.attributes.waste04.toString())
                        });

                        // Fill selectPicker with filtered items, add to DOM, and refresh:
                        newWastes06OptionsHTML = '<option selected value="-1">All (' + filteredWastes06.length + ')</option><option data-divider="true"></option>';
                        filteredWastes06.forEach(waste06 => newWastes06OptionsHTML += "<option class='dropdown-item' value='" + waste06.attributes.id + "'>" + waste06.attributes.ewc_code + " " + waste06.attributes.ewc_name + (waste06.attributes.hazardous ? "*" : "") + "</option>");
                        $(_this.flows.waste06Select).html(newWastes06OptionsHTML);
                        $(_this.flows.waste06Select).selectpicker("refresh");

                        $("#wastes06col").fadeIn("fast");
                    }
                }

                function filterMonths() {
                    let selectedYearIDs = [];
                    let filteredMonths = [];
                    let newMonthOptionsHTML = "";

                    selectedYearIDs = $(_this.flows.yearSelect).val()

                    if (selectedYearIDs.length == 0 || selectedYearIDs[0] == "-1") {
                        $("#monthCol").fadeOut("fast");

                    } else {
                        filteredMonths = _this.months.models.filter(function (month) {
                            return selectedYearIDs.includes(month.attributes.year.toString())
                        });

                        newMonthOptionsHTML = '<option selected value="-1">All (' + filteredMonths.length + ')</option><option data-divider="true"></option>';
                        filteredMonths.forEach(month => newMonthOptionsHTML += "<option value='" + month.attributes.id + "'>" + month.attributes.code.substring(2, 6) + " " + utils.toMonthString(month.attributes.code.substring(0, 2)) + "</option>");
                        $(_this.flows.monthSelect).html(newMonthOptionsHTML);
                        $(_this.flows.monthSelect).selectpicker("refresh");

                        $("#monthCol").fadeIn("fast");
                    }
                }

                // /////////////////////////////////
                // Multicheck events:

                // Origin: -------------------------
                $(this.origin.activityGroupsSelect).on('changed.bs.select', multiCheck);
                $(this.origin.activityGroupsSelect).on('changed.bs.select', filterActivities);
                $(this.origin.activitySelect).on('changed.bs.select', multiCheck);
                $(this.origin.processGroupSelect).on('changed.bs.select', multiCheck);
                $(this.origin.processGroupSelect).on('changed.bs.select', filterTreatmentMethods);
                $(this.origin.processSelect).on('changed.bs.select', multiCheck);

                // Hide/show Activity Group or Treatment method group containers
                $("#origin-role-radio-production").on('click', function () {
                    _this.origin.role = "production";
                    $(".originContainerTreatmentMethod").hide();
                    $(".originContainerActivity").fadeIn();
                });
                $("#origin-role-radio-both").on('click', function () {
                    _this.origin.role = "both";
                    $(".originContainerActivity").fadeOut();
                    $(".originContainerTreatmentMethod").fadeOut();
                });
                $("#origin-role-radio-treatment").on('click', function () {
                    _this.origin.role = "treatment";
                    $(".originContainerActivity").hide();
                    $(".originContainerTreatmentMethod").fadeIn();
                });

                // Destination: ---------------------
                $(this.destination.activityGroupsSelect).on('changed.bs.select', multiCheck);
                $(this.destination.activityGroupsSelect).on('changed.bs.select', filterActivities);
                $(this.destination.activitySelect).on('changed.bs.select', multiCheck);
                $(this.destination.processGroupSelect).on('changed.bs.select', multiCheck);
                $(this.destination.processGroupSelect).on('changed.bs.select', filterTreatmentMethods);
                $(this.destination.processSelect).on('changed.bs.select', multiCheck);

                // Hide/show Activity Group and Activity or Treatment method:
                $("#destination-role-radio-production").on('click', function () {
                    _this.destination.role = "production";
                    $(".destinationContainerTreatmentMethod").hide();
                    $(".destinationContainerActivity").fadeIn();
                });
                $("#destination-role-radio-both").on('click', function () {
                    _this.destination.role = "both";
                    $(".destinationContainerActivity").fadeOut();
                    $(".destinationContainerTreatmentMethod").fadeOut();
                });
                $("#destination-role-radio-treatment").on('click', function () {
                    _this.destination.role = "treatment";
                    $(".destinationContainerActivity").hide();
                    $(".destinationContainerTreatmentMethod").fadeIn();
                });

                // Flows: ---------------------------
                $(this.flows.yearSelect).on('changed.bs.select', multiCheck);
                $(this.flows.yearSelect).on('changed.bs.select', filterMonths);
                $(this.flows.monthSelect).on('changed.bs.select', multiCheck);

                $(this.flows.hazardousSelect).on('changed.bs.select', filterEwcHazardous);
                $(this.flows.waste02Select).on('changed.bs.select', multiCheck);
                $(this.flows.waste02Select).on('changed.bs.select', filterEWC02to04);
                $(this.flows.waste04Select).on('changed.bs.select', multiCheck);
                $(this.flows.waste04Select).on('changed.bs.select', filterEWC04to06);
                $(this.flows.waste06Select).on('changed.bs.select', multiCheck);

                $(this.flows.materialSelect).on('changed.bs.select', multiCheck);
                $(this.flows.productSelect).on('changed.bs.select', multiCheck);
                $(this.flows.compositesSelect).on('changed.bs.select', multiCheck);

                $(this.flows.cleanSelect).on('changed.bs.select', multiCheck);
                $(this.flows.mixedSelect).on('changed.bs.select', multiCheck);
                $(this.flows.directSelect).on('changed.bs.select', multiCheck);
                $(this.flows.isCompositeSelect).on('changed.bs.select', multiCheck);


                // Hide the .filterEdit container when the selected filter changes:
                $(this.filterConfigSelect).on('changed.bs.select', function () {
                    $(".filterEdit").fadeOut();
                    console.log("selected filter changed")
                });
            },

            initializeControls: function () {
                // Origin-controls:
                this.origin.inOrOut = this.el.querySelector('#origin-area-in-or-out');
                this.origin.activityGroupsSelect = this.el.querySelector('select[name="origin-activitygroup-select"]');
                this.origin.activitySelect = this.el.querySelector('select[name="origin-activity-select"]');
                this.origin.processGroupSelect = this.el.querySelector('select[name="origin-processGroup-select"]');
                this.origin.processSelect = this.el.querySelector('select[name="origin-process-select"]');

                // Destination-controls:
                this.destination.inOrOut = this.el.querySelector('#destination-area-in-or-out');
                this.destination.activityGroupsSelect = this.el.querySelector('select[name="destination-activitygroup-select"]');
                this.destination.activitySelect = this.el.querySelector('select[name="destination-activity-select"]');
                this.destination.processGroupSelect = this.el.querySelector('select[name="destination-processGroup-select"]');
                this.destination.processSelect = this.el.querySelector('select[name="destination-process-select"]');

                // Flows-controls:
                this.flows.yearSelect = this.el.querySelector('select[name="flows-year-select"]');
                this.flows.monthSelect = this.el.querySelector('select[name="flows-month-select"]');
                this.flows.waste02Select = this.el.querySelector('select[name="flows-waste02-select"]');
                this.flows.waste04Select = this.el.querySelector('select[name="flows-waste04-select"]');
                this.flows.waste06Select = this.el.querySelector('select[name="flows-waste06-select"]');

                this.flows.materialSelect = this.el.querySelector('select[name="flows-material-select"]');
                this.flows.productSelect = this.el.querySelector('select[name="flows-product-select"]');
                this.flows.compositesSelect = this.el.querySelector('select[name="flows-composites-select"]');
                this.flows.routeSelect = this.el.querySelector('select[name="flows-route-select"]');
                this.flows.collectorSelect = this.el.querySelector('select[name="flows-collector-select"]');
                this.flows.hazardousSelect = this.el.querySelector('select[name="flows-hazardous-select"]');
                this.flows.cleanSelect = this.el.querySelector('select[name="flows-clean-select"]');
                this.flows.mixedSelect = this.el.querySelector('select[name="flows-mixed-select"]');
                this.flows.directSelect = this.el.querySelector('select[name="flows-direct-select"]');
                this.flows.isCompositeSelect = this.el.querySelector('select[name="flows-iscomposite-select"]');
                this.areaLevelSelect = this.el.querySelector('#area-level-select');

                // Saved filter configs
                this.filterConfigSelect = this.el.querySelector('select[name="saved-filters-select"]');

                // Initialize all bootstrapToggles:
                $(".bootstrapToggle").bootstrapToggle();

                // Initialize all selectpickers:
                $(".selectpicker").selectpicker();

                // Initialize all textarea-autoresize components:
                $(".selections").textareaAutoSize();
            },

            renderSavedFiltersModal: function () {
                var _this = this;
                let form;

                this.savedFiltersModal = this.el.querySelector('.saved-filters.modal');
                html = document.getElementById('saved-filters-modal-template').innerHTML;
                template = _.template(html);
                this.savedFiltersModal.innerHTML = template({
                    savedFilters: this.savedFilters,
                });

                $('.saved-filters.modal').on('hide.bs.modal', function (e) {
                    switch (_this.savedFiltersModal.mode) {
                        case "savedMode":
                            form = $("form.savedMode")[0];
                            $(".filterEdit").hide();
                            $(".update-filter-name").val("");
                            $(".filterEdit .invalid-feedback").hide();
                            $(".filterEdit #filterNameUpdated").hide();
                            break;
                        case "newMode":
                            form = $("form.newMode")[0];
                            $("#newFilterAdded").hide();
                            $("#new-filter-name-input").val("");
                            $(".invalid-feedback").hide();
                            $("#new-filter-name-input").attr("readonly", false);
                            break;
                    }
                    form.classList.remove('was-validated');
                    form.classList.add('needs-validation');
                })
            },

            renderConfirmModal: function () {
                var _this = this;
                this.confirmationModal = $('#confirmation-modal')[0];
                html = document.getElementById('delete-modal-template').innerHTML;
                template = _.template(html);
                this.confirmationModal.innerHTML = template({
                    title: "Please confirm",
                    confirmButtonText: "Delete",
                    message: "Are you sure you want to delete the selected filter configuration?"
                });

                $("#modal-confirm-btn").click(function () {
                    _this.deleteFilterConfig();
                })
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
                        stroke: 'rgb(114, 145, 128)',
                        fill: 'rgba(121, 209, 161, 0.25)',
                        select: {
                            selectable: true,
                            stroke: 'rgb(196, 255, 223)',
                            fill: 'rgba(89, 155, 119, 0.6)',
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
                                        $(".areaSelectionsOrigin").fadeIn();
                                    } else {
                                        $(".areaSelectionsOrigin").fadeOut();
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
                                        $(".areaSelectionsDestination").fadeIn();
                                    } else {
                                        $(".areaSelectionsDestination").fadeOut();
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

            clearAreas: function (event) {
                let buttonClicked = $(event.currentTarget).data('area-clear-button');
                let _this = this;

                if (buttonClicked == "origin" && _this.selectedAreasOrigin.length > 0) {
                    _this.selectedAreasOrigin = [];
                    $("#areaSelectionsOriginTextarea").html("");
                    setTimeout(function () {
                        $(".areaSelectionsOrigin").fadeOut();
                    }, 400);

                } else if (buttonClicked == "destination" && _this.selectedAreasDestination.length > 0) {
                    _this.selectedAreasDestination = [];
                    $("#areaSelectionsDestinationTextarea").html("");
                    setTimeout(function () {
                        $(".areaSelectionsDestination").fadeOut();
                    }, 400);
                } else if (buttonClicked == "flows" && _this.selectedAreasFlows.length > 0) {
                    _this.selectedAreasFlows = [];
                    $("#areaSelectionsFlowsTextarea").html("");
                    setTimeout(function () {
                        $("#areaSelectionsFlows").fadeOut();
                    }, 400);
                }
            },

            reloadFilterSelectPicker: function (response) {
                let newSavedFiltersHtml = "";
                this.savedFilters = response;


                console.log("Saved filters on reloadFilterSelectPicker: ", this.savedFilters.models);


                let filterArray = this.savedFilters.models;
                filterArray.sort(function (a, b) {
                    return (a.attributes.date < b.attributes.date) ? 1 : ((a.attributes.date > b.attributes.date) ? -1 : 0);
                });

                filterArray.forEach(filter => newSavedFiltersHtml += "<option class='dropdown-item' value='" + filter.attributes.id + "'>" + filter.attributes.name + "</option>");
                $(this.filterConfigSelect).html(newSavedFiltersHtml);

                console.log(newSavedFiltersHtml);

                $(this.filterConfigSelect).selectpicker("refresh");
            },

            loadFilterConfiguration: function (event) {
                $(".filterEdit").fadeOut();

                let selectedFilterConfig = $(this.filterConfigSelect).val();
                let configToLoad = this.savedFilters.find(filter => filter.attributes.id == selectedFilterConfig).get("filter");

                let origin = configToLoad.origin;
                let destination = configToLoad.destination;
                let flows = configToLoad.flows;

                // ///////////////////////////////
                // Origin filters:
                if (_.has(origin, 'selectedAreas')) {
                    // set origin areas
                }

                if (_.has(flows, 'origin_role')) {

                    $("#origin-role-radio-production").parent().removeClass("active");
                    $("#origin-role-radio-both").parent().removeClass("active");
                    $("#origin-role-radio-treatment").parent().removeClass("active");

                    // set origin role
                    switch (flows.origin_role) {
                        case "production":
                            $($("#origin-role-radio-production").parent()[0]).addClass("active")
                            break;
                        case "both":
                            $($("#origin-role-radio-both").parent()[0]).addClass("active")
                            break;
                        case "treatment":
                            $($("#origin-role-radio-treatment").parent()[0]).addClass("active")
                            break;
                    }

                }

                // ///////////////////////////////
                // Destination filters:


                // ///////////////////////////////
                // Flows filters:

                event.preventDefault();
                event.stopPropagation();
            },

            saveNewFilter: function (event) {
                var _this = this;
                let newFilterName = $("#new-filter-name-input").val();
                let newFilterForm = $("form.newMode")[0];
                let formIsValid = newFilterForm.checkValidity();

                console.log(formIsValid);

                if (formIsValid) {
                    let newFilterParams = _this.getFilterParams();

                    newFilterParams.name = newFilterName;
                    console.log("New filter saved: ", newFilterName);

                    _this.savedFilters.postfetch({
                        data: {},
                        body: {
                            action: "create",
                            name: newFilterName,
                            filter: newFilterParams,
                        },
                        success: function (response) {
                            console.log("Postfetch create success: ", response.models)
                            $("#newFilterAdded").fadeIn("fast");
                            $("#new-filter-name-input").attr("readonly", true);

                            _this.reloadFilterSelectPicker(response);
                        },
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }
                newFilterForm.classList.add('was-validated');
                event.preventDefault();
                event.stopPropagation();
            },

            deleteFilterConfig: function () {
                var _this = this;
                let idToDelete = $(this.filterConfigSelect).val();

                console.log("Id of filter config to delete: ", idToDelete);

                _this.savedFilters.postfetch({
                    data: {},
                    body: {
                        action: "delete",
                        id: idToDelete,
                    },
                    success: function (response) {
                        console.log("Postfetch delete success: ", response.models)
                        _this.savedFilters = response;
                        _this.reloadFilterSelectPicker(response);


                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
                // event.preventDefault();
                // event.stopPropagation();
            },

            updateFilterConfig: function (event) {
                var _this = this;
                let idToUpdate = $(this.filterConfigSelect).val();

                console.log("Id of filter config to update: ", idToUpdate);

                _this.savedFilters.postfetch({
                    data: {},
                    body: {
                        action: "update",
                        id: idToUpdate,
                        filter: _this.getFilterParams(),
                    },
                    success: function (response) {
                        console.log("Postfetch update config success: ", response.models)
                        _this.reloadFilterSelectPicker(response);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
                event.preventDefault();
                event.stopPropagation();
            },

            updateFilterName: function (event) {
                var _this = this;
                let idToUpdate = $(this.filterConfigSelect).val();

                let newFilterName = $("#update-filter-name").val();

                let savedFilterForm = $(".savedMode.needs-validation")[0];
                let formIsValid = savedFilterForm.checkValidity()

                if (formIsValid) {
                    console.log("Id of filter config to rename: ", idToUpdate);

                    _this.savedFilters.postfetch({
                        data: {},
                        body: {
                            action: "update",
                            id: idToUpdate,
                            name: newFilterName,
                        },
                        success: function (response) {
                            console.log("Postfetch update name success: ", response.models);

                            $("#filterNameUpdated").fadeIn("fast");
                            $("#update-filter-name").attr("readonly", true);

                            _this.reloadFilterSelectPicker(response);

                            setTimeout(() => {
                                $(".filterEdit").fadeOut();
                            }, 2500);
                        },
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }
                savedFilterForm.classList.add('was-validated');
                event.preventDefault();
                event.stopPropagation();
            },

            showConfirmModal: function (event) {
                $(".filterEdit").fadeOut();
                $(this.confirmationModal).modal('show');
                event.preventDefault();
                event.stopPropagation();
            },

            showFilterEdit: function (event) {
                let idToUpdate = $(this.filterConfigSelect).val();
                let oldFilterName = this.savedFilters.find(filter => filter.attributes.id == idToUpdate).get("name");
                let form = $("form.savedMode")[0];

                // Hide if shown:
                $("#filterNameUpdated").hide();
                $(".update-filter-name").val("");
                $(".filterEdit .invalid-feedback").hide();
                $(".filterEdit #filterNameUpdated").hide();

                form.classList.remove('was-validated');
                form.classList.add('needs-validation');

                $("#update-filter-name").val(oldFilterName);
                $(".filterEdit").fadeIn("fast");
                $("#update-filter-name").attr("readonly", false);
                event.preventDefault();
                event.stopPropagation();
            },

            showSavedFiltersModal(event) {
                var _this = this;
                _this.savedFiltersModal.mode = $(event.currentTarget).data('filter-modal-mode');
                switch (_this.savedFiltersModal.mode) {
                    case "savedMode":
                        $(".newMode").hide();
                        $(".savedMode").show();
                        break;
                    case "newMode":
                        $(".savedMode").hide();
                        $(".newMode").show();
                        break;
                }
                $(this.savedFiltersModal).modal('show');
            },

            showAreaSelection: function (event) {
                var _this = this;
                var labelStringArray = [];

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
                    // Create ol.Collection of Features to which we can add Features:
                    let features = _this.areaMap.layers.areas.select.getFeatures();

                    // Add the correct selected features to the areaMap:
                    if (_this.areaMap.block == "origin") {
                        // Add selected origin areas as selections to the map:
                        if (_this.selectedAreasOrigin && _this.selectedAreasOrigin.length > 0) {

                            // Loop through all selected areas in selectedAreasOrigin:
                            _this.selectedAreasOrigin.forEach(selectedArea => {
                                // Get the feature object based on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);
                                labelStringArray.push(selectedArea.attributes.name);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                        }

                    } else if (_this.areaMap.block == "destination") {
                        // Add selected destination areas as selections to the map:
                        if (_this.selectedAreasDestination && _this.selectedAreasDestination.length > 0) {

                            // // Create ol.Collection of Features to which we can add Features:
                            // var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasDestination:
                            _this.selectedAreasDestination.forEach(selectedArea => {
                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);
                                labelStringArray.push(selectedArea.attributes.name);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                        }

                    } else if (_this.areaMap.block == "flows") {
                        // Add selected Flows areas as selections to the map:
                        if (_this.selectedAreasFlows && _this.selectedAreasFlows.length > 0) {

                            // // Create ol.Collection of Features to which we can add Features:
                            // var features = _this.areaMap.layers.areas.select.getFeatures();

                            // Loop through all selected areas in selectedAreasFlows:
                            _this.selectedAreasFlows.forEach(selectedArea => {
                                // Get the feature object base on the id:
                                let feature = _this.areaMap.getFeature("areas", selectedArea.id);
                                labelStringArray.push(selectedArea.attributes.name);

                                // Add it to the Features ol.Collection:
                                features.push(feature);
                            });
                        }
                    }

                    // Display the previousy selected regions in the label on the modal:
                    $("#areaSelectionsModalTextarea").html(labelStringArray.join('; '));

                    // Show the text in the area selection modal Textarea and trigger input:
                    $("#areaSelectionsModalTextarea").html(labelStringArray.join("; "));
                    $(".selections").trigger('input');

                    // End of setTimeout
                }, 200);
            },

            resetFiltersToDefault: function () {
                _this = this;

                _this.selectedAreasOrigin = [];
                _this.selectedAreasDestination = [];
                _this.selectedAreasFlows = [];

                // HTML string for activity-select:
                allActivitiesOptionsHTML = '<option selected value="-1">All (' + _this.activities.length + ')</option><option data-divider="true"></option>';
                _this.activities.models.forEach(activity => allActivitiesOptionsHTML += "<option>" + activity.attributes.name + "</option>");


                // ///////////////////////////////////////////////
                // Origin-controls:
                $(".areaSelectionsOrigin").hide();
                $("#areaSelectionsOriginTextarea").html("");
                $("#origin-role-radio-production").parent().removeClass("active");
                $("#origin-role-radio-both").parent().addClass("active")
                $("#origin-role-radio-treatment").parent().removeClass("active");

                $(_this.origin.activityGroupsSelect).val('-1');
                $(_this.origin.activitySelect).html(allActivitiesOptionsHTML);
                $(_this.origin.processGroupSelect).val('-1');
                $(_this.origin.processSelect).val('-1');
                $(".originContainerActivity").hide();
                $(".originContainerTreatmentMethod").hide();


                $(".activitySelectContainer").hide();

                // ///////////////////////////////////////////////
                // Destination-controls:
                $(".areaSelectionsDestination").hide();
                $("#areaSelectionsDestinationTextarea").html("");
                $("#destination-role-radio-production").parent().removeClass("active");
                $("#destination-role-radio-both").parent().addClass("active")
                $("#destination-role-radio-treatment").parent().removeClass("active");

                $(_this.destination.activityGroupsSelect).val('-1');
                $(_this.destination.activitySelect).html(allActivitiesOptionsHTML);
                $(_this.destination.processGroupSelect).val('-1');
                $(_this.destination.processSelect).val('-1');
                $(".destinationContainerActivity").hide();
                $(".destinationContainerTreatmentMethod").hide();


                // ///////////////////////////////////////////////
                // Flows-controls:
                $("#areaSelectionsFlows").hide();
                $("#areaSelectionsFlowsTextarea").html("");
                $("#areaSelectionsFlows").hide();
                $(_this.flows.yearSelect).val("-1");
                $(_this.flows.monthSelect).val("-1");
                $("#monthCol").hide("fast");

                $(_this.flows.waste02Select).val("-1");
                $(_this.flows.waste04Select).val("-1");
                $("#wastes04col").hide("fast");
                $(_this.flows.waste06Select).val("-1");
                $("#wastes06col").hide("fast");

                $(_this.flows.materialSelect).val("-1");
                $(_this.flows.productSelect).val("-1");
                $(_this.flows.compositesSelect).val("-1");
                $(_this.flows.routeSelect).val("both");
                $(_this.flows.collectorSelect).val("both");
                $(_this.flows.hazardousSelect).val("both");
                $(_this.flows.cleanSelect).val("-1");
                $(_this.flows.mixedSelect).val("-1");
                $(_this.flows.directSelect).val("-1");
                $(_this.flows.isCompositeSelect).val("-1");


                // Empty all textareas:
                $(".selections").html("");
                $(".selections").textareaAutoSize();

                // Refresh all selectpickers:
                $(".selectpicker").selectpicker('refresh');
            },

            getFilterParams: function () {

                let filterParams = {
                    origin: {},
                    destination: {},
                    flows: {},
                }

                // ///////////////////////////////
                // ORIGIN

                if (this.selectedAreasOrigin !== undefined &&
                    this.selectedAreasOrigin.length > 0) {
                    filterParams.origin.selectedAreas = [];
                    this.selectedAreasOrigin.forEach(function (area) {
                        filterParams.origin.selectedAreas.push(area.id);
                    });
                }
                if ($(this.origin.inOrOut).prop('checked')) {
                    filterParams.origin.inOrOut = 'out';
                } else {
                    filterParams.origin.inOrOut = 'in';
                }
                if (this.origin.role != 'both') {
                    filterParams.flows['origin_role'] = this.origin.role;
                }

                if (this.origin.role == "production") {
                    if ($(this.origin.activityGroupsSelect).val() != '-1') {
                        if ($(this.origin.activitySelect).val() == '-1') {
                            filterParams.flows['origin__activity__activitygroup__in'] = $(this.origin.activityGroupsSelect).val();
                        } else {
                            filterParams.flows['origin__activity__in'] = $(this.origin.activitySelect).val();
                        }
                    }
                } else if (this.origin.role == "treatment") {
                    if ($(this.origin.processGroupSelect).val() != '-1') {
                        if ($(this.origin.processSelect).val() == '-1') {
                            filterParams.flows['origin__process__processgroup__in'] = $(this.origin.processGroupSelect).val();
                        } else {
                            filterParams.flows['origin__process__in'] = $(this.origin.processSelect).val();
                        }
                    }
                }


                // ///////////////////////////////
                // DESTINATION

                if (this.selectedAreasDestination !== undefined &&
                    this.selectedAreasDestination.length > 0) {
                    filterParams.destination.selectedAreas = [];
                    this.selectedAreasDestination.forEach(function (area) {
                        filterParams.destination.selectedAreas.push(area.id);
                    });
                }
                if ($(this.destination.inOrOut).prop('checked')) {
                    filterParams.destination.inOrOut = 'out';
                } else {
                    filterParams.destination.inOrOut = 'in';
                }
                if (this.destination.role != 'both') {
                    filterParams.flows['destination_role'] = this.destination.role;
                }

                if (this.destination.role == "production") {
                    if ($(this.destination.activityGroupsSelect).val() != '-1') {
                        if ($(this.destination.activitySelect).val() == '-1') {
                            filterParams.flows['destination__activity__activitygroup__in'] = $(this.destination.activityGroupsSelect).val();
                        } else {
                            filterParams.flows['destination__activity__in'] = $(this.destination.activitySelect).val();
                        }
                    }
                } else if (this.destination.role == "treatment") {
                    if ($(this.destination.processGroupSelect).val() != '-1') {
                        if ($(this.destination.processSelect).val() == '-1') {
                            filterParams.flows['destination__process__processgroup__in'] = $(this.destination.processGroupSelect).val();
                        } else {
                            filterParams.flows['destination__process__in'] = $(this.destination.processSelect).val();
                        }
                    }
                }

                // ///////////////////////////////
                // FLOWS
                if (this.selectedAreasFlows !== undefined &&
                    this.selectedAreasFlows.length > 0) {
                    filterParams.flows.selectedAreas = [];
                    this.selectedAreasFlows.forEach(function (area) {
                        filterParams.flows.selectedAreas.push(area.id);
                    });
                }

                // Year
                let year = $(this.flows.yearSelect).val();
                let month = $(this.flows.monthSelect).val();

                if (year[0] !== "-1") {
                    if (month == "-1") {
                        filterParams.flows['flowchain__month__year__in'] = year;
                    } else {
                        filterParams.flows['flowchain__month__in'] = month;
                    }
                }

                // Wastes
                let wastes02 = $(this.flows.waste02Select).val();
                let wastes04 = $(this.flows.waste04Select).val();
                let wastes06 = $(this.flows.waste06Select).val();

                // Waste02 is not All:
                if (wastes02[0] !== "-1") {
                    // Waste04 is All, so send Waste02:
                    if (wastes04[0] == "-1") {
                        filterParams.flows['flowchain__waste06__waste04__waste02__in'] = wastes02;
                    } else {
                        // Waste06 is All, so send Waste04
                        if (wastes06[0] == "-1") {
                            filterParams.flows['flowchain__waste06__waste04__in'] = wastes04;
                        } else {
                            // Send Waste06:
                            filterParams.flows['flowchain__waste06__in'] = wastes06;
                        }
                    }
                }

                // Materials
                let materials = $(this.flows.materialSelect).val();
                if (materials[0] !== "-1") {
                    filterParams.flows['flowchain__materials__in'] = materials;
                }

                // Products
                let products = $(this.flows.productSelect).val();
                if (products[0] !== "-1") {
                    filterParams.flows['flowchain__products__in'] = products;
                }

                // Composites
                let composites = $(this.flows.compositesSelect).val();
                if (composites[0] !== "-1") {
                    filterParams.flows['flowchain__composites__in'] = composites;
                }

                // isRoute
                let route = $(this.flows.routeSelect).val();
                if (route != 'both') {
                    let is_route = (route == 'yes') ? true : false;
                    filterParams.flows['flowchain__route'] = is_route;
                }

                // isCollector
                let collector = $(this.flows.collectorSelect).val();
                if (collector != 'both') {
                    let is_collector = (collector == 'yes') ? true : false;
                    filterParams.flows['flowchain__collector'] = is_collector;
                }

                // isHazardous
                let hazardous = $(this.flows.hazardousSelect).val();
                if (hazardous != 'both') {
                    let is_hazardous = (hazardous == 'yes') ? true : false;
                    filterParams.flows['flowchain__waste06__hazardous'] = is_hazardous;
                }

                // isClean
                let clean = $(this.flows.cleanSelect).val();
                if (clean[0] !== "-1") {
                    var options = [];
                    clean.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_clean = (option == 'yes') ? true : false;
                            options.push(is_clean);
                        }
                    })
                    filterParams.flows['clean'] = options;
                }

                // isMixed
                let mixed = $(this.flows.mixedSelect).val();
                if (mixed[0] !== "-1") {
                    var options = [];
                    mixed.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_mixed = (option == 'yes') ? true : false;
                            options.push(is_mixed);
                        }
                    })
                    filterParams.flows['mixed'] = options;
                }

                // isDirectUse
                let direct = $(this.flows.directSelect).val();
                if (direct[0] !== "-1") {
                    var options = [];
                    direct.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_direct = (option == 'yes') ? true : false;
                            options.push(is_direct);
                        }
                    })
                    filterParams.flows['direct'] = options;
                }

                // isComposite
                let composite = $(this.flows.isCompositeSelect).val();
                if (composite[0] !== "-1") {
                    var options = [];
                    composite.forEach(function (option) {
                        if (option == 'unknown') {
                            options.push(null);
                        } else {
                            var is_composite = (option == 'yes') ? true : false;
                            options.push(is_composite);
                        }
                    })
                    filterParams.flows['composite'] = options;
                }

                return filterParams;
            },

            close: function () {
                //        if (this.flowsView) this.flowsView.close();
                FiltersView.__super__.close.call(this);
            }

        });

        return FiltersView;

    }
);