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

                // Load model here
                var tags = [
                    'activitygroups',
                    'activities',
                    'actors',
                    'processgroups',
                    'processes',
                    'wastes02',
                    'wastes04',
                    'wastes06',
                    'materials',
                    'products',
                    'composites',
                    'arealevels',
                    'years',
                    'months',
                    'filters',
                ]

                // Model collections
                // Refer to collection via tag
                this.collections = {};
                tags.forEach(function(tag) {
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

                //this.renderMonitorView();
            },

            renderMonitorView: function (_this) {
                var el = _this.el.querySelector('#analyse-content');
                _this.monitorView = new MonitorView({
                    el: el,
                    template: 'monitor-template',
                    filtersView: _this
                });
            },

            renderImpactView: function (_this) {
                var el = _this.el.querySelector('#analyse-content');
                _this.impactView = new ImpactView({
                    el: el,
                    template: 'impact-template',
                    filtersView: _this
                });
            },

            addEventListeners: function () {
                var _this = this;

                $('.analyse-mode-radio-label').on("click", function (event) {
                    let clickedMode = $(this).attr("data-mode");

                    if (clickedMode != _this.analyseMode) {
                        _this.analyseMode = clickedMode;

                        switch (_this.analyseMode) {
                            case "monitor":
                                _this.renderMonitorView(_this);
                                break;
                            case "impact":
                                _this.renderImpactView(_this);
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

                        filterUtils.fillSelectPicker("waste06", _this.flows.waste06Select, filteredWastes06);
                        $(".chevronEwc06").hide();
                        $("#flows-waste06-label").css("position", "static");
                        $("#helpiconWaste06").addClass("hazaIconPos");
                        $("#wastes06col").fadeIn("fast");
                    }
                }

                function filterEWC02to04(event, clickedIndex, checked) {
                    let filteredWastes04 = [];
                    let selectedEWC02IDs = $(_this.flows.waste02Select).val();
                    if (selectedEWC02IDs.length == 0 || selectedEWC02IDs[0] == "-1") {
                        $("#wastes04col").fadeOut("fast");
                    } else {
                        filteredWastes04 = _this.collections['wastes04'].models.filter(function (waste04) {
                            return selectedEWC02IDs.includes(waste04.attributes.waste02.toString())
                        });
                        filterUtils.fillSelectPicker("waste04", _this.flows.waste04Select, filteredWastes04);
                        $("#wastes04col").fadeIn("fast");
                    }
                }

                function filterEWC04to06() {
                    let filteredWastes06 = [];
                    let selectedEWC04IDs = $(_this.flows.waste04Select).val();
                    if (selectedEWC04IDs.length == 0 || selectedEWC04IDs[0] == "-1") {
                        $("#wastes06col").fadeOut("fast");

                    } else {
                        filteredWastes06 = _this.collections['wastes06'].models.filter(function (waste06) {
                            return selectedEWC04IDs.includes(waste06.attributes.waste04.toString())
                        });
                        filterUtils.fillSelectPicker("waste06", _this.flows.waste06Select, filteredWastes06);
                        $("#wastes06col").fadeIn("fast");
                    }
                }

                function filterMonths() {
                    let filteredMonths = [];
                    let selectedYearIDs = $(_this.flows.yearSelect).val();
                    if (selectedYearIDs.length == 0 || selectedYearIDs[0] == "-1") {
                        $("#monthCol").fadeOut("fast");
                    } else {
                        filteredMonths = _this.collections['months'].models.filter(function (month) {
                            return selectedYearIDs.includes(month.attributes.year.toString())
                        });
                        filterUtils.fillSelectPicker("month", _this.flows.monthSelect, filteredMonths);
                        $("#monthCol").fadeIn("fast");
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
                    let configToLoad = this.savedFilters.find(filter => filter.attributes.id == selectedFilterConfig).get("filter");

                    let origin = configToLoad.origin;
                    let destination = configToLoad.destination;
                    let flows = configToLoad.flows;

                    console.log("Loading saved filter configuration: ", configToLoad);


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

                    if (_.has(flows, 'flowchain__month__year__in')) {
                        $(this.flows.yearSelect).selectpicker("val", flows.flowchain__month__year__in);
                    }
                    if (_.has(flows, 'flowchain__month__in')) {
                        let monthObjects = _this.months.models.filter(function (month) {
                            return flows.flowchain__month__in.includes(month.attributes.id.toString());
                        });

                        let yearsToDisplay = [];
                        monthObjects.forEach(month => {
                            yearsToDisplay.push(month.attributes.year.toString());
                        });
                        yearsToDisplay = _.uniq(yearsToDisplay, 'id');
                        $(_this.flows.yearSelect).selectpicker('val', yearsToDisplay);

                        let filteredMonths = [];
                        filteredMonths = _this.months.models.filter(function (month) {
                            return yearsToDisplay.includes(month.attributes.year.toString())
                        });
                        filterUtils.fillSelectPicker("month", $(_this.flows.monthSelect), filteredMonths);
                        $(_this.flows.monthSelect).selectpicker('val', flows.flowchain__month__in);
                        $("#monthCol").fadeIn("fast");
                    }

                    // EWC
                    if (_.has(flows, 'flowchain__waste06__hazardous')) {
                        if (flows.flowchain__waste06__hazardous) {
                            $(this.flows.hazardousSelect).val("yes");
                        } else {
                            $(this.flows.hazardousSelect).val("no");
                        }
                        $(this.flows.hazardousSelect).trigger('changed.bs.select');

                        if (_.has(flows, 'flowchain__waste06__in')) {
                            $(_this.flows.waste06Select).selectpicker('val', flows.flowchain__waste06__in);
                        }
                        $("#wastes04col").hide();
                    }


                    if (_.has(flows, 'flowchain__waste06__waste04__waste02__in')) {
                        $(_this.origin.waste02Select).selectpicker('val', flows.flowchain__waste06__waste04__waste02__in);
                    }

                    if (_.has(flows, 'flowchain__waste06__waste04__in')) {
                        let waste04Objects = _this.wastes04.models.filter(function (ewc4) {
                            return flows.flowchain__waste06__waste04__in.includes(ewc4.attributes.id.toString());
                        });

                        let wastes02 = [];
                        waste04Objects.forEach(ewc4 => {
                            wastes02.push(ewc4.attributes.waste02.toString());
                        });
                        wastes02 = _.uniq(wastes02, 'id');
                        $(_this.flows.waste02Select).selectpicker('val', wastes02);

                        let filteredEwc4 = [];
                        filteredEwc4 = _this.wastes04.models.filter(function (ewc4) {
                            return wastes02.includes(ewc4.attributes.waste02.toString())
                        });
                        filterUtils.fillSelectPicker("waste04", $(_this.flows.waste04Select), filteredEwc4);
                        $(_this.flows.waste04Select).selectpicker('val', flows.flowchain__waste06__waste04__in);
                        $("#wastes04col").fadeIn("fast");
                    }

                    if (_.has(flows, 'flowchain__waste06__in') && !_.has(flows, 'flowchain__waste06__hazardous')) {
                        let waste6Objects = _this.wastes06.models.filter(function (ewc6) {
                            return flows.flowchain__waste06__in.includes(ewc6.attributes.id.toString());
                        });

                        // EWC 4 to which EWC6 belong:
                        let wastes04 = [];
                        waste6Objects.forEach(ewc6 => {
                            wastes04.push(ewc6.attributes.waste04.toString());
                        });
                        wastes04 = _.uniq(wastes04, 'id');
                        let waste04Objects = _this.wastes04.models.filter(function (ewc4) {
                            return wastes04.includes(ewc4.attributes.id.toString());
                        });

                        // EWC2 to which EWC 4 belong:
                        let wastes02 = [];
                        waste04Objects.forEach(ewc4 => {
                            wastes02.push(ewc4.attributes.waste02.toString());
                        });
                        wastes02 = _.uniq(wastes02, 'id');
                        $(_this.flows.waste02Select).selectpicker('val', wastes02);

                        // Select EWC4 after EWC2 automatically fills EWC4:
                        $(_this.flows.waste04Select).selectpicker('val', wastes04);
                        $("#wastes04col").fadeIn("fast");

                        // Fill EWC6 after EWC4:
                        let filteredEwc6 = [];
                        filteredEwc6 = _this.wastes06.models.filter(function (ewc6) {
                            return wastes04.includes(ewc6.attributes.waste04.toString())
                        });
                        filterUtils.fillSelectPicker("waste06", $(_this.flows.waste06Select), filteredEwc6);
                        $(_this.flows.waste06Select).selectpicker('val', flows.flowchain__waste06__in);
                        $("#wastes06col").fadeIn("fast");
                    }

                    // Materials
                    if (_.has(flows, 'flowchain__materials__in')) {
                        $(this.flows.materialSelect).selectpicker("val", flows.flowchain__materials__in);
                    }
                    // Products
                    if (_.has(flows, 'flowchain__products__in')) {
                        $(this.flows.productSelect).selectpicker("val", flows.flowchain__products__in);
                    }
                    // Composites
                    if (_.has(flows, 'flowchain__composites__in')) {
                        $(this.flows.compositesSelect).selectpicker("val", flows.flowchain__composites__in);
                    }

                    // Composites
                    if (_.has(flows, 'flowchain__composites__in')) {
                        $(this.flows.compositesSelect).selectpicker("val", flows.flowchain__composites__in);
                    }

                    function loadBooleanFilters(filter) {
                        let valuesToSet = [];
                        if (flows[filter].includes(false)) {
                            valuesToSet.push("no");
                        }
                        if (flows[filter].includes(true)) {
                            valuesToSet.push("yes");
                        }
                        if (flows[filter].includes(null)) {
                            valuesToSet.push("unknown");
                        }

                        if (filter == "composite") {
                            filter = "isComposite";
                        }
                        $(_this.flows[filter + "Select"]).selectpicker("val", valuesToSet);
                    }
                    let booleanFilters = ["clean", "mixed", "direct", "composite"];
                    booleanFilters.forEach(boolean => {
                        if (_.has(flows, boolean)) {
                            loadBooleanFilters(boolean);
                        }
                    });

                    // Route
                    if (_.has(flows, 'flowchain__route')) {
                        if (flows.flowchain__route) {
                            $(this.flows.routeSelect).selectpicker("val", "yes");
                        } else {
                            $(this.flows.routeSelect).selectpicker("val", "no");
                        }
                    }

                    // Collector
                    if (_.has(flows, 'flowchain__collector')) {
                        if (flows.flowchain__collector) {
                            $(this.flows.collectorSelect).selectpicker("val", "yes");
                        } else {
                            $(this.flows.collectorSelect).selectpicker("val", "no");
                        }
                    }

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
                var _this = this;

                let filterParams = {
                    origin: {},
                    destination: {},
                    flows: {},
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


                // isHazardous
                let hazardous = $(this.flows.hazardousSelect).val();
                if (hazardous != 'both') {
                    let is_hazardous = (hazardous == 'yes') ? true : false;
                    filterParams.flows['flowchain__waste06__hazardous'] = is_hazardous;

                    // Waste06 is not All
                    if (wastes06[0] != "-1") {
                        // Send Waste06:
                        filterParams.flows['flowchain__waste06__in'] = wastes06;
                    }
                }

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
                FiltersView.__super__.close.call(this);
            }

        });

        return FiltersView;

    }
);