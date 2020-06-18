define(['views/common/baseview',
        'underscore',
        'views/analyse/monitor',
        'views/analyse/impact',
        'collections/collection',
        'visualizations/map',
        'openlayers',
        'utils/utils',
        'utils/filterUtils',
    ],

    function (BaseView, _, MonitorView, ImpactView, Collection, Map, ol, utils, filterUtils) {

        var FiltersView = BaseView.extend({
            initialize: function (options) {
                var _this = this;
                FiltersView.__super__.initialize.apply(this, [options]);
                _.bindAll(this, 'prepareAreas');

                this.origin = {};
                this.destination = {};
                this.flows = {};
                this.selectedAreas = {};
                this.selectedAreas.origin = [];
                this.selectedAreas.destination = [];
                this.selectedAreas.flows = [];
                this.savedFiltersModal = "";

                this.template = options.template;

                // group filters on hierarchy
                this.filters = [
                    {'year':        'flowchain__month__year__in',
                     'month':       'flowchain__month__in'},
                    {'hazardous':   'flowchain__waste06__hazardous'},
                    {'waste02':     'flowchain__waste06__waste04__waste02__in',
                     'waste04':     'flowchain__waste06__waste04__in',
                     'waste06':     'flowchain__waste06__in'},
                    {'material':    'flowchain__materials__in'},
                    {'product':     'flowchain__products__in'},
                    {'composites':  'flowchain__composites__in'},
                    {'route':       'flowchain__route'},
                    {'collector':   'flowchain__collector'},
                    {'clean':       'clean'},
                    {'mixed':       'mixed'},
                    {'direct':      'direct_use'},
                    {'isComposite': 'composite'},
                    {'dataset':     'datasets'}
                ]

                this.boolean = {
                    'unknown': null,
                    'yes': true,
                    'no': false
                }

                // Load model here
                // singular: plural form
                this.tags = {
                    'activitygroup': 'activitygroups',
                    'activity':      'activities',
                    'processgroup':  'processgroups',
                    'process':       'processes',
                    'waste02':       'wastes02',
                    'waste04':       'wastes04',
                    'waste06':       'wastes06',
                    'material':      'materials',
                    'product':       'products',
                    'composite':     'composites',
                    'arealevel':     'arealevels',
                    'year':          'years',
                    'month':         'months',
                    'filter':        'filters',
                    'dataset':       'datasets'
                }

                // Model collections
                // Refer to collection via tag
                this.collections = {};
                Object.values(this.tags).forEach(function(tag) {
                    var collection = new Collection([], {
                        apiTag: tag
                    });
                    _this.collections[tag] = collection;
                })

                this.areas = {};

                // Fetch model data
                this.loader.activate();
                var promises = [];
                Object.values(this.collections).forEach(function(collection) {
                    var promise = collection.fetch();
                    promises.push(promise);
                })

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
                "click .hide-filter-name-button": "hideFilterNameInput",
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML,
                    template = _.template(html),
                    _this = this;
                // Add to template context:
                this.el.innerHTML = template(this.collections);

                // Activate help icons
                var popovers = this.el.querySelectorAll('[data-toggle="popover"]');
                $(popovers).popover({
                    trigger: "focus"
                });

                // Set default admin level to Country:
                this.idOfCountryLevel = this.collections['arealevels'].find(level => level.attributes.level == 1).id;
                this.adminLevel = {};
                this.adminLevel.origin = this.idOfCountryLevel;
                this.adminLevel.destination = this.idOfCountryLevel;
                this.adminLevel.flows = this.idOfCountryLevel;

                this.renderSavedFiltersModal();
                this.renderAreaSelectModal();
                this.renderConfirmModal();

                this.initializeControls();
                this.addEventListeners();
            },

            initializeControls: function () {
                var _this = this;

                // Origin/Destination-controls:
                nodes = ['origin', 'destination']
                nodes.forEach(function(node) {
                    _this[node].inOrOut = _this.el.querySelector('#' + node + '-area-in-or-out');
                    _this[node].activityGroupsSelect = _this.el.querySelector('select[name="' + node + '-activitygroup-select"]');
                    _this[node].activitySelect = _this.el.querySelector('select[name="' + node + '-activity-select"]');
                    _this[node].processGroupSelect = _this.el.querySelector('select[name="' + node + '-processGroup-select"]');
                    _this[node].processSelect = _this.el.querySelector('select[name="' + node + '-process-select"]');
                })

                // Flows-controls:
                this.filters.forEach(function(filter) {
                    Object.keys(filter).forEach(function(key) {
                        var selector = 'select[name="flows-' + key.toLowerCase() + '-select"]';
                        _this.flows[key + 'Select'] = _this.el.querySelector(selector);
                    })
                })

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

            renderMonitorView: function (_this) {
                var el = document.querySelector('#monitor-content');
                _this.monitorView = new MonitorView({
                    el: el,
                    template: 'monitor-template',
                    mode: "monitor",
                    filtersView: _this,
                    indicator: "Waste",
                    titleNumber: 3,
                    maxNumberOfDimensions: 2,
                    levels: this.areaLevels,
                });
            },

            renderImpactView: function (_this) {
                var el = document.querySelector('#impact-content');
                _this.impactView = new ImpactView({
                    el: el,
                    template: 'impact-template',
                    filtersView: _this,
                    levels: this.areaLevels,
                });
            },

            addEventListeners: function () {
                var _this = this;

                $('.analyse-mode-radio-label').on("click", function (event) {
                    let clickedMode = $(this).attr("data-mode");

                    if (clickedMode != _this.analyseMode) {
                        _this.analyseMode = clickedMode;

                        $(".analyse-content-container").hide();
                        
                        if (_this.monitorView) _this.monitorView.close();
                        if (_this.impactView) _this.impactView.close();
                        
                        switch (_this.analyseMode) {
                            case "monitor":
                                _this.renderMonitorView(_this);
                                $("#monitor-content").fadeIn();
                                break;
                            case "impact":
                                _this.renderImpactView(_this);
                                $("#impact-content").fadeIn();
                                break;
                        }
                    }
                    event.preventDefault();
                });


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
                    let eventTargetID = event.target.id,
                        node =  eventTargetID.split('-')[0],
                        activityGroupsSelect = _this[node].activityGroupsSelect,
                        activitySelect = _this[node].activitySelect,
                        activitySelectContainer = $(".activitySelectContainer-" + node);

                    // Get the array with ID's of the selected activityGroup(s) from the .selectpicker:
                    let selectedActivityGroupIDs = $(activityGroupsSelect).val();

                    // If no activity groups are selected, reset the activity filter to again show all activities:
                    if (selectedActivityGroupIDs.length == 0 || selectedActivityGroupIDs[0] == "-1") {
                        activitySelectContainer.fadeOut("fast");
                    } else {
                        // Filter all activities by the selected Activity Groups:
                        filteredActivities = _this.collections['activities'].models.filter(function (activity) {
                            return selectedActivityGroupIDs.includes(activity.attributes.activitygroup.toString())
                        });
                        filterUtils.fillSelectPicker("activity", activitySelect, filteredActivities);
                        activitySelectContainer.fadeIn("fast");
                    }
                }

                function filterTreatmentMethods(event, clickedIndex, checked) {
                    let eventTargetID = event.target.id,
                        node =  eventTargetID.split('-')[0],
                        processGroupSelect = _this[node].processGroupSelect,
                        processSelect = _this[node].processSelect,
                        processSelectContainer = $("#" + node + "ContainerProcesses");

                    // Get the array with ID's of the selected treatment method group(s) from the .selectpicker:
                    let selectedProcessGroupIDs = $(processGroupSelect).val();

                    // If no process groups are selected, reset filter:
                    if (selectedProcessGroupIDs.length == 0 || selectedProcessGroupIDs[0] == "-1") {
                        processSelectContainer.fadeOut("fast");
                    } else {
                        // Filter all activities by the selected Process Groups:
                        filteredProcesses = _this.collections['processes'].models.filter(function (process) {
                            return selectedProcessGroupIDs.includes(process.attributes.processgroup.toString())
                        });
                        filterUtils.fillSelectPicker("treatmentMethod", processSelect, filteredProcesses);
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
                        let filteredWastes06 = _this.collections['wastes06'].models.filter(function (waste06) {
                            return waste06.attributes.hazardous == showOnlyHazardous;
                        });

                        filterUtils.fillSelectPicker("wastes06", _this.flows.waste06Select, filteredWastes06);
                        $(".chevronEwc06").hide();
                        $("#flows-waste06-label").css("position", "static");
                        $("#helpiconWaste06").addClass("hazaIconPos");
                        $("#wastes06col").fadeIn("fast");
                    }
                }

                function filterbyParent(evt, clickedIndex, checked) {
                    // enable multiCheck
                    multiCheck(evt, clickedIndex, checked);

                    // filter children
                    let ids = $(evt.target).val(),
                        parent = evt.data.parent,
                        child = evt.data.child;
                        picker = _this.flows[child + 'Select'];
                    if (ids.length == 0 || ids[0] == "-1") {
                        $("#" + tag + "col").fadeOut("fast");
                    } else {
                        let tag = _this.tags[child];
                            children = _this.collections[tag].models.filter(function (child) {
                                return ids.includes(child.attributes[parent].toString())
                            });
                        filterUtils.fillSelectPicker(tag, picker, children);
                        $("#" + tag + "col").fadeIn("fast");
                    }
                }

                // /////////////////////////////////
                // Multicheck events:

                // Origin/Destination: -------------------------
                nodes = ['origin', 'destination']
                nodes.forEach(function(node) {
                    $(_this[node].activityGroupsSelect).on('changed.bs.select', multiCheck);
                    $(_this[node].activityGroupsSelect).on('changed.bs.select', filterActivities);
                    $(_this[node].activitySelect).on('changed.bs.select', multiCheck);
                    $(_this[node].processGroupSelect).on('changed.bs.select', multiCheck);
                    $(_this[node].processGroupSelect).on('changed.bs.select', filterTreatmentMethods);
                    $(_this[node].processSelect).on('changed.bs.select', multiCheck);

                    // Hide/show Activity Group or Treatment method group containers
                    $("#" + node + "-role-radio-production").on('click', function () {
                        _this[node].role = "production";
                        $("." + node + "ContainerTreatmentMethod").hide();
                        $("." + node + "ContainerActivity").fadeIn();
                    });
                    $("#" + node + "-role-radio-both").on('click', function () {
                        _this[node].role = "both";
                        $("." + node + "ContainerActivity").fadeOut();
                        $("." + node + "ContainerTreatmentMethod").fadeOut();
                    });
                    $("#" + node + "-role-radio-treatment").on('click', function () {
                        _this[node].role = "treatment";
                        $("." + node + "ContainerActivity").hide();
                        $("." + node + "ContainerTreatmentMethod").fadeIn();
                    });
                })

                // Flows: ---------------------------
                this.filters.forEach(function(filter) {
                    // all filter fields
                    var fields = Object.keys(filter);

                    fields.forEach(function(field, idx) {
                        var selector = $(_this.flows[field + 'Select']), // field selector
                            options = selector[0].options;                // selector options

                        // no selectors for non-fuzzy booleans (either true or false)
                        // to find them, check if there are options, including 'both'
                        if (!(options.length > 0 && options[0].value == 'both')) {
                            // for hierarchical fields, check for child field
                            var next = fields[idx + 1]; // next field in order

                            // if child does exist
                            if (next !== undefined) {
                                // render child menu, filtered by current field
                                selector.on('changed.bs.select', {parent: field, child: next}, filterbyParent);
                            } else {
                                selector.on('changed.bs.select', multiCheck);
                            }
                        }
                    })
                })

                // Hide the .filterEdit container when the selected filter changes:
                $(this.filterConfigSelect).on('changed.bs.select', function () {
                    $(".filterEdit").fadeOut();
                });

                // Select text in input on focus:
                var focusedElement;
                $(document).on('focus', 'input', function () {
                    if (focusedElement == this) return; //already focused, return so user can now place cursor at specific point in input.
                    focusedElement = this;
                    setTimeout(function () {
                        try {
                            focusedElement.select();
                        } catch (error) {

                        }
                    }, 50); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
                });
                $(document).on('blur', 'input', function () {
                    focusedElement = null;
                })
            },

            renderSavedFiltersModal: function () {
                var _this = this;
                let form;

                this.savedFiltersModal = this.el.querySelector('.saved-filters.modal');
                html = document.getElementById('saved-filters-modal-template').innerHTML;
                template = _.template(html);
                this.savedFiltersModal.innerHTML = template({
                    filters: this.collections['filters']
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
                    levels: this.collections['arealevels']
                });
                this.areaLevelSelect = this.el.querySelector('select[name="area-level-select"]');

                this.areaMap = new Map({
                    el: this.areaModal.querySelector('.map'),
                    center: [-3.65, 37.53], // check centerOnLayer (map.js)
                    zoom: 2, // check centerOnLayer (map.js)
                    source: 'light',
                    opacity: 1.0
                });
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
                                var block = _this.areaMap.block;

                                // The user has selected an area for the Origin block:
                                _this.selectedAreas[block] = [];
                                areaFeats.forEach(function (areaFeat) {
                                    labels.push(areaFeat.label);
                                    _this.selectedAreas[block].push(areas.get(areaFeat.id));
                                });

                                if (_this.selectedAreas[block].length > 0) {
                                    $(".areaSelections-" + block).fadeIn();
                                } else {
                                    $(".areaSelections-" + block).fadeOut();
                                }
                                $("#areaSelections-Textarea-" + block).html(labels.join('; '))

                                // Show the selected areas in the textarea in the modal:
                                $("#areaSelectionsModalTextarea").html(labels.join('; '));

                                // Trigger input event on textareas in order to autoresize if needed:
                                $(".selections").trigger('input');
                                $(".selections").textareaAutoSize();
                            }
                        }
                    });
            },

            changeAreaLevel: function () {
                var levelId = this.areaLevelSelect.value;

                this.adminLevel[this.areaMap.block] = levelId;

                // Clear the textarea with selected areas in the modal:
                $("#areaSelectionsModalTextarea").html("");

                this.prepareAreas(levelId, true);
            },

            prepareAreas: function (levelId, loaderOn, executeAfterLoading, block) {
                var _this = this;
                var areas = this.areas[levelId];
                if (areas && areas.size() > 0) {
                    this.drawAreas(areas)
                    if (executeAfterLoading) {
                        executeAfterLoading(_this, levelId, block);
                    }
                } else {
                    areas = new Collection([], {
                        apiTag: 'areas',
                        apiIds: [levelId]
                    });
                    this.areas[levelId] = areas;
                    if (loaderOn) {
                        this.loader.activate();
                    }
                    areas.fetch({
                        success: function () {
                            _this.loader.deactivate();

                            if (executeAfterLoading) {
                                _this.areas[levelId] = areas;
                                executeAfterLoading(_this, levelId, block);
                            }
                            _this.drawAreas(areas);
                        },
                        error: function (res) {
                            _this.loader.deactivate();
                            console.log("Error in prepareAreas: ", res);
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

                if (_this.selectedAreas[buttonClicked].length > 0) {
                    _this.selectedAreas[buttonClicked] = [];
                    $("#areaSelections-Textarea-" + buttonClicked).html("");
                    setTimeout(function () {
                        $(".areaSelections-" + buttonClicked).fadeOut();
                    }, 400);
                }
            },

            reloadFilterSelectPicker: function (response) {
                let newSavedFiltersHtml = "";
                this.savedFilters = response;
                let filterArray = this.savedFilters.models;
                filterArray.forEach(filter => newSavedFiltersHtml += "<option class='dropdown-item' value='" + filter.attributes.id + "'>" + filter.attributes.name + "</option>");
                $(this.filterConfigSelect).html(newSavedFiltersHtml);
                $(this.filterConfigSelect).selectpicker("refresh");
            },

            loadFilterConfiguration: function (event) {
                try {
                    var _this = this;
                    this.resetFiltersToDefault();
                    $(".filterEdit").fadeOut();

                    let selectedFilterConfig = $(this.filterConfigSelect).val();
                    let configToLoad = this.collections['filters'].find(filter => filter.attributes.id == selectedFilterConfig).get("filter");

                    let origin = configToLoad.origin;
                    let destination = configToLoad.destination;
                    let flows = configToLoad.flows;

                    console.log("Loading saved filter configuration: ", configToLoad);

                    // Dataset filter:
                    $(this.flows.datasetSelect).val(flows.datasets);

                    /**
                     * Load saved areas for given section
                     * @param {string} block the name of the section: 'origin', 'destination', or 'flows'.
                     * @param {object} savedConfig the saved filter config of the section
                     */
                    function loadSavedAreas(block, savedConfig) {
                        _this.adminLevel[block] = parseInt(savedConfig.adminLevel);

                        /**
                         * Function to be executed after areas of this level have been loaded:
                         * @param {int} adminLevel 
                         */
                        let executeAfterLoading = function (_this, adminLevel, block) {
                            let labelStringArray = [];
                            savedConfig.selectedAreas.forEach(selectedAreaId => {
                                let areaObject = _this.areas[adminLevel].models.find(area => area.attributes.id == selectedAreaId);
                                _this.selectedAreas[block].push(areaObject);
                                labelStringArray.push(areaObject.attributes.name);
                            });
                            $(".areaSelections-" + block).fadeIn();
                            $("#areaSelections-Textarea-" + block).html(labelStringArray.join('; '));
                            $(".selections").trigger('input');
                            $(".selections").textareaAutoSize();

                            // Inside or outside toggle:
                            if (savedConfig.inOrOut == 'in') {
                                $(_this[block].inOrOut).bootstrapToggle("off");
                            } else {
                                $(_this[block].inOrOut).bootstrapToggle("on");
                            }
                        }
                        _this.prepareAreas(_this.adminLevel[block], false, executeAfterLoading, block);
                    }

                    // Load saved areas for each section:
                    if (_.has(origin, 'selectedAreas')) {
                        loadSavedAreas("origin", origin);
                    }
                    if (_.has(destination, 'selectedAreas')) {
                        loadSavedAreas("destination", destination);
                    }
                    if (_.has(flows, 'selectedAreas')) {
                        loadSavedAreas("flows", flows);
                    }

                    /**
                     * Load saved role for given section
                     * @param {string} block the name of the section: 'origin' or 'destination'
                     * @param {object} savedConfig the saved filter config of the section
                     */
                    function loadSavedRole(block) {
                        $("#" + block + "-role-radio-production").parent().removeClass("active");
                        $("#" + block + "-role-radio-both").parent().removeClass("active");
                        $("#" + block + "-role-radio-treatment").parent().removeClass("active");
                        _this[block].role = flows[block + "_role"];
                        // Set origin role
                        switch (_this[block].role) {
                            case "production":
                                $($("#" + block + "-role-radio-production").parent()[0]).addClass("active")
                                $("." + block + "ContainerTreatmentMethod").hide();
                                $("." + block + "ContainerActivity").fadeIn();
                                break;
                            case "both":
                                $($("#" + block + "-role-radio-both").parent()[0]).addClass("active")
                                $("." + block + "ContainerActivity").fadeOut();
                                $("." + block + "ContainerTreatmentMethod").fadeOut();
                                break;
                            case "treatment":
                                $($("#" + block + "-role-radio-treatment").parent()[0]).addClass("active")
                                $("." + block + "ContainerActivity").hide();
                                $("." + block + "ContainerTreatmentMethod").fadeIn();
                                break;
                        }
                    }
                    if (_.has(flows, 'origin_role')) {
                        loadSavedRole("origin", origin)
                    }
                    if (_.has(flows, 'destination_role')) {
                        loadSavedRole("destination", destination)
                    }

                    /**
                     * Load activity groups for Origin / Destination:
                     */
                    if (_.has(flows, 'origin__activity__activitygroup__in')) {
                        $(_this.origin.activityGroupsSelect).selectpicker('val', flows.origin__activity__activitygroup__in);
                    }
                    if (_.has(flows, 'destination__activity__activitygroup__in')) {
                        $(_this.destination.activityGroupsSelect).selectpicker('val', flows.destination__activity__activitygroup__in);
                    }

                    /**
                     * Load activities for given section
                     * @param {string} block the name of the section: 'origin' or 'destination'
                     * @param {object} savedConfig the saved filter config of the section
                     */
                    function loadSavedActivities(block) {

                        let activityObjects = _this.activities.models.filter(function (activity) {
                            return flows[block + "__activity__in"].includes(activity.attributes.id.toString());
                        });

                        // Get activity groups to which the selected activities belong and select in selectpicker:
                        let activityGroupsToDisplay = [];
                        activityObjects.forEach(activity => {
                            activityGroupsToDisplay.push(activity.attributes.activitygroup.toString());
                        });
                        activityGroupsToDisplay = _.uniq(activityGroupsToDisplay, 'id');
                        $(_this[block].activityGroupsSelect).selectpicker('val', activityGroupsToDisplay);

                        // Filter all activities by the selected Activity Groups:
                        let filteredActivities = [];
                        filteredActivities = _this.activities.models.filter(function (activity) {
                            return activityGroupsToDisplay.includes(activity.attributes.activitygroup.toString())
                        });
                        filterUtils.fillSelectPicker("activity", $(_this[block].activitySelect), filteredActivities);

                        $(_this[block].activitySelect).selectpicker('val', flows[block + "__activity__in"]);
                        $(".activitySelectContainer-" + block).fadeIn("fast");
                    }


                    // Activities
                    if (_.has(flows, 'origin__activity__in')) {
                        loadSavedActivities("origin")
                    }
                    if (_.has(flows, 'destination__activity__in')) {
                        loadSavedActivities("destination")
                    }

                    /**
                     * Load treatment method groups for Origin / Destination
                     */
                    if (_.has(flows, 'origin__process__processgroup__in')) {
                        $(_this.origin.processGroupSelect).selectpicker('val', flows.origin__process__processgroup__in);
                    }
                    if (_.has(flows, 'destination__process__processgroup__in')) {
                        $(_this.destination.processGroupSelect).selectpicker('val', flows.destination__process__processgroup__in);
                    }


                    /**
                     * Load treatment methods for given section
                     * @param {string} block the name of the section: 'origin' or 'destination'
                     * @param {object} savedConfig the saved filter config of the section
                     */
                    function loadSavedTreatmentMethods(block) {
                        let processObjects = _this.processes.models.filter(function (process) {
                            return flows[block + "__process__in"].includes(process.attributes.id.toString());
                        });

                        let processGroupsToDisplay = [];
                        processObjects.forEach(process => {
                            processGroupsToDisplay.push(process.attributes.processgroup.toString());
                        });
                        processGroupsToDisplay = _.uniq(processGroupsToDisplay, 'id');
                        $(_this[block].processGroupSelect).selectpicker('val', processGroupsToDisplay);

                        let filteredProcesses = [];
                        filteredProcesses = _this.processes.models.filter(function (process) {
                            return processGroupsToDisplay.includes(process.attributes.processgroup.toString())
                        });
                        filterUtils.fillSelectPicker("treatmentMethod", $(_this[block].processSelect), filteredProcesses);

                        $(_this[block].processSelect).selectpicker('val', flows[block + "__process__in"]);
                        $("#" + block + "ContainerProcesses").fadeIn("fast");
                    }

                    // Treatment methods
                    if (_.has(flows, 'origin__process__in')) {
                        loadSavedTreatmentMethods("origin");
                    }
                    if (_.has(flows, 'destination__process__in')) {
                        loadSavedTreatmentMethods("destination");
                    }


                    // ///////////////////////////////
                    // Flows filters:

                    this.filters.forEach(function(filter) {
                        fields = Object.keys(filter).reverse()
                        console.log(fields);
                        fields.forEach(function(field) {
                            var val = flows[filter[field]];
                            if (val !== undefined) {
                               $(_this.flows[field + 'Select']).selectpicker("val", val);
                            }
                        })
                    })

//                    if (_.has(flows, 'flowchain__month__year__in')) {
//                        $(this.flows.yearSelect).selectpicker("val", flows.flowchain__month__year__in);
//                    }
//                    if (_.has(flows, 'flowchain__month__in')) {
//                        let monthObjects = _this.months.models.filter(function (month) {
//                            return flows.flowchain__month__in.includes(month.attributes.id.toString());
//                        });
//
//                        let yearsToDisplay = [];
//                        monthObjects.forEach(month => {
//                            yearsToDisplay.push(month.attributes.year.toString());
//                        });
//                        yearsToDisplay = _.uniq(yearsToDisplay, 'id');
//                        $(_this.flows.yearSelect).selectpicker('val', yearsToDisplay);
//
//                        let filteredMonths = [];
//                        filteredMonths = _this.months.models.filter(function (month) {
//                            return yearsToDisplay.includes(month.attributes.year.toString())
//                        });
//                        filterUtils.fillSelectPicker("month", $(_this.flows.monthSelect), filteredMonths);
//                        $(_this.flows.monthSelect).selectpicker('val', flows.flowchain__month__in);
//                        $("#monthscol").fadeIn("fast");
//                    }
//
//                    // EWC
//                    if (_.has(flows, 'flowchain__waste06__hazardous')) {
//                        if (flows.flowchain__waste06__hazardous) {
//                            $(this.flows.hazardousSelect).val("yes");
//                        } else {
//                            $(this.flows.hazardousSelect).val("no");
//                        }
//                        $(this.flows.hazardousSelect).trigger('changed.bs.select');
//
//                        if (_.has(flows, 'flowchain__waste06__in')) {
//                            $(_this.flows.waste06Select).selectpicker('val', flows.flowchain__waste06__in);
//                        }
//                        $("#wastes04col").hide();
//                    }
//
//
//                    if (_.has(flows, 'flowchain__waste06__waste04__waste02__in')) {
//                        $(_this.origin.waste02Select).selectpicker('val', flows.flowchain__waste06__waste04__waste02__in);
//                    }
//
//                    if (_.has(flows, 'flowchain__waste06__waste04__in')) {
//                        let waste04Objects = _this.wastes04.models.filter(function (ewc4) {
//                            return flows.flowchain__waste06__waste04__in.includes(ewc4.attributes.id.toString());
//                        });
//
//                        let wastes02 = [];
//                        waste04Objects.forEach(ewc4 => {
//                            wastes02.push(ewc4.attributes.waste02.toString());
//                        });
//                        wastes02 = _.uniq(wastes02, 'id');
//                        $(_this.flows.waste02Select).selectpicker('val', wastes02);
//
//                        let filteredEwc4 = [];
//                        filteredEwc4 = _this.wastes04.models.filter(function (ewc4) {
//                            return wastes02.includes(ewc4.attributes.waste02.toString())
//                        });
//                        filterUtils.fillSelectPicker("waste04", $(_this.flows.waste04Select), filteredEwc4);
//                        $(_this.flows.waste04Select).selectpicker('val', flows.flowchain__waste06__waste04__in);
//                        $("#wastes04col").fadeIn("fast");
//                    }
//
//                    if (_.has(flows, 'flowchain__waste06__in') && !_.has(flows, 'flowchain__waste06__hazardous')) {
//                        let waste6Objects = _this.wastes06.models.filter(function (ewc6) {
//                            return flows.flowchain__waste06__in.includes(ewc6.attributes.id.toString());
//                        });
//
//                        // EWC 4 to which EWC6 belong:
//                        let wastes04 = [];
//                        waste6Objects.forEach(ewc6 => {
//                            wastes04.push(ewc6.attributes.waste04.toString());
//                        });
//                        wastes04 = _.uniq(wastes04, 'id');
//                        let waste04Objects = _this.wastes04.models.filter(function (ewc4) {
//                            return wastes04.includes(ewc4.attributes.id.toString());
//                        });
//
//                        // EWC2 to which EWC 4 belong:
//                        let wastes02 = [];
//                        waste04Objects.forEach(ewc4 => {
//                            wastes02.push(ewc4.attributes.waste02.toString());
//                        });
//                        wastes02 = _.uniq(wastes02, 'id');
//                        $(_this.flows.waste02Select).selectpicker('val', wastes02);
//
//                        // Select EWC4 after EWC2 automatically fills EWC4:
//                        $(_this.flows.waste04Select).selectpicker('val', wastes04);
//                        $("#wastes04col").fadeIn("fast");
//
//                        // Fill EWC6 after EWC4:
//                        let filteredEwc6 = [];
//                        filteredEwc6 = _this.wastes06.models.filter(function (ewc6) {
//                            return wastes04.includes(ewc6.attributes.waste04.toString())
//                        });
//                        filterUtils.fillSelectPicker("waste06", $(_this.flows.waste06Select), filteredEwc6);
//                        $(_this.flows.waste06Select).selectpicker('val', flows.flowchain__waste06__in);
//                        $("#wastes06col").fadeIn("fast");
//                    }
//
//                    // Materials
//                    if (_.has(flows, 'flowchain__materials__in')) {
//                        $(this.flows.materialSelect).selectpicker("val", flows.flowchain__materials__in);
//                    }
//                    // Products
//                    if (_.has(flows, 'flowchain__products__in')) {
//                        $(this.flows.productSelect).selectpicker("val", flows.flowchain__products__in);
//                    }
//                    // Composites
//                    if (_.has(flows, 'flowchain__composites__in')) {
//                        $(this.flows.compositesSelect).selectpicker("val", flows.flowchain__composites__in);
//                    }
//
//                    // Composites
//                    if (_.has(flows, 'flowchain__composites__in')) {
//                        $(this.flows.compositesSelect).selectpicker("val", flows.flowchain__composites__in);
//                    }
//
//                    function loadBooleanFilters(filter) {
//                        let valuesToSet = [];
//                        if (flows[filter].includes(false)) {
//                            valuesToSet.push("no");
//                        }
//                        if (flows[filter].includes(true)) {
//                            valuesToSet.push("yes");
//                        }
//                        if (flows[filter].includes(null)) {
//                            valuesToSet.push("unknown");
//                        }
//
//                        if (filter == "composite") {
//                            filter = "isComposite";
//                        }
//                        $(_this.flows[filter + "Select"]).selectpicker("val", valuesToSet);
//                    }
//                    let booleanFilters = ["clean", "mixed", "direct", "composite"];
//                    booleanFilters.forEach(boolean => {
//                        if (_.has(flows, boolean)) {
//                            loadBooleanFilters(boolean);
//                        }
//                    });
//
//                    // Route
//                    if (_.has(flows, 'flowchain__route')) {
//                        if (flows.flowchain__route) {
//                            $(this.flows.routeSelect).selectpicker("val", "yes");
//                        } else {
//                            $(this.flows.routeSelect).selectpicker("val", "no");
//                        }
//                    }
//
//                    // Collector
//                    if (_.has(flows, 'flowchain__collector')) {
//                        if (flows.flowchain__collector) {
//                            $(this.flows.collectorSelect).selectpicker("val", "yes");
//                        } else {
//                            $(this.flows.collectorSelect).selectpicker("val", "no");
//                        }
//                    }

                    $(".selectpicker").selectpicker("refresh");

                    $(".filterLoaded").fadeIn();
                    setTimeout(() => {
                        $(".filterLoaded").fadeOut();
                    }, 2500);

                } catch (error) {
                    console.log("Error loading saved filters: ", error);
                }
                event.preventDefault();
                event.stopPropagation();
            },

            saveNewFilter: function (event) {
                var _this = this;
                let newFilterName = $("#new-filter-name-input").val();
                let newFilterForm = $("form.newMode")[0];
                newFilterForm.classList.remove('was-validated');
                newFilterForm.classList.add('needs-validation');

                let formIsValid = newFilterForm.checkValidity();

                if (formIsValid) {
                    _this.collections['filters'].postfetch({
                        data: {},
                        body: {
                            action: "create",
                            name: newFilterName,
                            filter: _this.getFilterParams(),
                        },
                        success: function (response) {
                            $("#newFilterAdded").fadeIn("fast");
                            $("#new-filter-name-input").attr("readonly", true);
                            _this.reloadFilterSelectPicker(response);
                        },
                        error: function (error) {
                            console.log(error);
                            $(".newMode #filterNameExists").html("<span>A filter with this name already exists.</span><br><span>Please fill in another name.</span>")
                            $(".newMode #filterNameExists").fadeIn();
                            setTimeout(() => {
                                $(".newMode #filterNameExists").fadeOut();
                            }, 3000);
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

                _this.collections['filters'].postfetch({
                    data: {},
                    body: {
                        action: "delete",
                        id: idToDelete,
                    },
                    success: function (response) {
                        _this.savedFilters = response;
                        _this.reloadFilterSelectPicker(response);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            updateFilterConfig: function (event) {
                var _this = this;
                let idToUpdate = $(this.filterConfigSelect).val();

                $(".filterEdit").fadeOut();

                _this.collections['filters'].postfetch({
                    data: {},
                    body: {
                        action: "update",
                        id: idToUpdate,
                        filter: _this.getFilterParams(),
                    },
                    success: function (response) {
                        _this.reloadFilterSelectPicker(response);

                        $(".filterUpdated").fadeIn();
                        setTimeout(() => {
                            $(".filterUpdated").fadeOut();
                        }, 2500);
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
                    _this.savedFilters.postfetch({
                        data: {},
                        body: {
                            action: "update",
                            id: idToUpdate,
                            name: newFilterName,
                        },
                        success: function (response) {
                            $("#filterNameUpdated").fadeIn("fast");
                            $("#update-filter-name").attr("readonly", true);

                            _this.reloadFilterSelectPicker(response);

                            setTimeout(() => {
                                $(".filterEdit").fadeOut();
                            }, 2500);
                        },
                        error: function (error) {
                            console.log(error);
                            $(".savedMode #filterNameExists").html("<span>A filter with this name already exists.</span><br><span>Please fill in another name.</span>")
                            $(".savedMode #filterNameExists").fadeIn();
                            setTimeout(() => {
                                $(".savedMode #filterNameExists").fadeOut();
                            }, 3000);
                        }
                    });
                }
                savedFilterForm.classList.add('was-validated');
                event.preventDefault();
                event.stopPropagation();
            },

            hideFilterNameInput: function (event) {
                $(".filterEdit").fadeOut();
                event.preventDefault();
                event.stopPropagation();
            },

            showConfirmModal: function (event) {
                let idToUpdate = $(this.filterConfigSelect).val();
                if (!idToUpdate) {
                    return false;
                }

                $(".filterEdit").fadeOut();
                $(this.confirmationModal).modal('show');
                event.preventDefault();
                event.stopPropagation();
            },

            showFilterEdit: function (event) {
                let idToUpdate = $(this.filterConfigSelect).val();
                if (!idToUpdate) {
                    return false;
                }

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

                // Used to determine which 'Select area'-button the user has pressed, either 'origin', 'flows', or 'destination': 
                _this.areaMap.block = $(event.currentTarget).data('area-select-block');

                let adminLevel = _this.adminLevel[_this.areaMap.block];
                // Set the admin level for origin/destination/flows in the selectpicker
                $(this.areaLevelSelect).val(adminLevel);
                $(this.areaLevelSelect).selectpicker("refresh");

                // Show the actual modal:
                $(this.areaModal).modal('show');

                // After the modal has fully opened...
                setTimeout(function () {
                    // Call updateSize to render the map with the correct dimensions:
                    _this.areaMap.map.updateSize();
                    // Fetch areas if they aren't there yet:
                    if (_this.collections['arealevels'].length > 0) {
                        _this.changeAreaLevel();
                    }
                    _this.addFeaturesToMap();
                }, 200);
            },

            addFeaturesToMap: function () {
                var labelStringArray = [];
                // Create ol.Collection of Features to which we can add Features:
                let features = this.areaMap.layers.areas.select.getFeatures();

                // Add the correct selected features to the areaMap:
                var block = this.areaMap.block;
                if (this.selectedAreas[block] && this.selectedAreas[block].length > 0) {
                    // Loop through all selected areas in selectedAreas.origin:
                    this.selectedAreas[block].forEach(selectedArea => {
                        // Get the feature object based on the id:
                        let feature = this.areaMap.getFeature("areas", selectedArea.id);
                        labelStringArray.push(selectedArea.attributes.name);

                        // Add it to the Features ol.Collection:
                        features.push(feature);
                    });
                }

                // Display the previousy selected regions in the label on the modal:
                $("#areaSelectionsModalTextarea").html(labelStringArray.join('; '));

                // Show the text in the area selection modal Textarea and trigger input:
                $("#areaSelectionsModalTextarea").html(labelStringArray.join("; "));
                $(".selections").trigger('input');
            },

            resetFiltersToDefault: function () {
                _this = this;

                _this.selectedAreas.origin = [];
                _this.selectedAreas.destination = [];
                _this.selectedAreas.flows = [];

                // HTML string for activity-select:
                let activities =  _this.collections['activities'];
                allActivitiesOptionsHTML = '<option selected value="-1">All (' + activities.length + ')</option><option data-divider="true"></option>';
                activities.models.forEach(activity => allActivitiesOptionsHTML += "<option>" + activity.attributes.name + "</option>");

                // Datasets:
                $(this.flows.datasetSelect).val("-1");

                // ///////////////////////////////////////////////
                // Origin-controls:
                let nodes = ['origin', 'destination']
                nodes.forEach(function(node) {
                    _this.adminLevel[node] = _this.idOfCountryLevel;
                    $(".areaSelections-" + node).hide();
                    $("#areaSelections-Textarea-" + node).html("");
                    $(_this[node].inOrOut).bootstrapToggle("off");

                    $("#" + node + "-role-radio-production").parent().removeClass("active");
                    $("#" + node + "-role-radio-both").parent().addClass("active")
                    $("#" + node + "-role-radio-treatment").parent().removeClass("active");

                    $("#" + node + "-role-radio label input").removeAttr("checked");
                    $("#" + node + "-role-radio-both").attr("checked", true);
                    _this[node].role = "both";

                    $(_this[node].activityGroupsSelect).val('-1');
                    $(_this[node].activitySelect).html(allActivitiesOptionsHTML);
                    $(_this[node].processGroupSelect).val('-1');
                    $(_this[node].processSelect).val('-1');
                    $("." + node + "ContainerActivity").hide();
                    $("." + node + "ContainerTreatmentMethod").hide();
                })

                // ///////////////////////////////////////////////
                // Flows-controls:
                this.adminLevel.flows = this.idOfCountryLevel;
                $("#areaSelections-flows").hide();
                $("#areaSelections-Textarea-flows").html("");
                $(this.flows.inOrOut).bootstrapToggle("off");
                $("#areaSelections-flows").hide();

                $(_this.flows.yearSelect).val("-1");
                $(_this.flows.monthSelect).val("-1");
                $("#monthscol").hide("fast");

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
                var _this = this;

                let filterParams = {
                    origin: {},
                    destination: {},
                    flows: {},
                }

                // Datasets filter:
                console.log(this.collections['datasets']);
                if (this.collections['datasets'].length == 1) {
                    filterParams.flows['datasets'] = this.collections['datasets'].models[0].get("id");
                } else {

                    if ($(this.flows.datasetSelect).val() == '-1') {
                        filterParams.flows['datasets'] = [];
                        this.collections['datasets'].forEach(dataset => {
                            filterParams.flows['datasets'].push(dataset.get("id"));
                        });
                    } else {
                        filterParams.flows['datasets'] = $(this.flows.datasetSelect).val();
                    }
                }

                // ///////////////////////////////
                // ORIGIN/DESTINATION
                let nodes = ['origin', 'destination']
                nodes.forEach(function(node) {
                    filterParams[node].adminLevel = _this.adminLevel[node];

                    if (_this.selectedAreas[node] !== undefined &&
                        _this.selectedAreas[node].length > 0) {
                        filterParams[node].selectedAreas = [];
                        _this.selectedAreas[node].forEach(function (area) {
                            filterParams[node].selectedAreas.push(area.id);
                        });
                    }
                    if ($(_this[node].inOrOut).prop('checked')) {
                        filterParams[node].inOrOut = 'out';
                    } else {
                        filterParams[node].inOrOut = 'in';
                    }
                    if (_this[node].role != 'both') {
                        filterParams.flows['origin_role'] = _this.origin.role;
                    }

                    if (_this[node].role == "production") {
                        if ($(_this[node].activityGroupsSelect).val() != '-1') {
                            if ($(_this[node].activitySelect).val() == '-1') {
                                filterParams.flows[node + '__activity__activitygroup__in'] = $(_this[node].activityGroupsSelect).val();
                            } else {
                                filterParams.flows[node + '__activity__in'] = $(_this[node].origin.activitySelect).val();
                            }
                        }
                    } else if (_this[node].role == "treatment") {
                        if ($(_this[node].processGroupSelect).val() != '-1') {
                            if ($(_this[node].processSelect).val() == '-1') {
                                filterParams.flows[node + '__process__processgroup__in'] = $(_this[node].processGroupSelect).val();
                            } else {
                                filterParams.flows[node + '__process__in'] = $(_this[node].processSelect).val();
                            }
                        }
                    }
                })

                // ///////////////////////////////
                // FLOWS

                filterParams.flows.adminLevel = this.adminLevel.flows;

                if (this.selectedAreas.flows !== undefined &&
                    this.selectedAreas.flows.length > 0) {
                    filterParams.flows.selectedAreas = [];
                    this.selectedAreas.flows.forEach(function (area) {
                        filterParams.flows.selectedAreas.push(area.id);
                    });
                }

                // process value
                function process(value) {
                    // might be a list of values or only one
                    if (Array.isArray(value)) {
                        // check if we have only boolean values
                        if (value.every(function(v) {return _this.boolean[v] !== undefined})) {
                            // if so, turn into real boolean values
                            var _value = [];
                            value.forEach(function(v) {
                                _value.push(_this.boolean[v]);
                            })
                            value = _value;
                        }
                    // unique value -> only non-fuzzy booleans (true or false)
                    } else {
                        value = boolean[value];
                    }
                    return value;
                }

                // load filters to request
                this.filters.forEach(function(filter) {
                    let _key = _value = null;

                    Object.keys(filter).forEach(function(key) {
                        // retrieve filter value
                        var value = $(_this.flows[key + 'Select']).val();

                        // forbidden values
                        var conditions = [
                            value.length > 0, // not an empty array
                            value[0] !== "-1", // not 'all' option
                            value !== 'both' // not 'both' option
                        ]

                        // if no forbidden values, process
                        if (!conditions.includes(false)) {
                            _key = filter[key];
                            _value = process(value);
                        }
                    })

                    // if no value, do not include filter in request
                    if (_value) {
                        filterParams.flows[_key] = _value;
                    }
                })

                return filterParams;
            },

            close: function () {
                FiltersView.__super__.close.call(this);
            }

        });

        return FiltersView;

    }
);