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

                this.template = options.template;

                this.areas = {};
                this.savedFiltersModal = "";

                // boolean selections
                this.boolean = {
                    'unknown': null,
                    'yes': true,
                    'no': false
                }

                // group filters on hierarchy
                this.filters = {
                    'origin': [
                        {'activitygroup': 'origin__activity__activitygroup__in',
                         'activity':      'origin__activity__in'},
                        {'processgroup':  'origin__process__processgroup__in',
                         'process':       'origin__process__in'}
                    ],
                    'destination': [
                        {'activitygroup': 'destination__activity__activitygroup__in',
                         'activity':      'destination__activity__in'},
                        {'processgroup':  'destination__process__processgroup__in',
                         'process':       'destination__process__in'}
                    ],
                    'flows': [
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
                }

                // template model tags
                // singular: plural form
                this.tags = {
                    'dataset':       'datasets',
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
                }

                // model collections
                // refer to collection via tag
                this.collections = {};
                Object.values(this.tags).forEach(function(tag) {
                    var collection = new Collection([], {
                        apiTag: tag
                    });
                    _this.collections[tag] = collection;
                })

                // fetch model data
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
                // AREA MODAL
                'click .area-select-button': 'showAreaSelection',
                'change select[name="area-level-select"]': 'changeAreaLevel',
                'click .clear-areas-button': 'clearAreas',

                // FILTER MODAL
                'click .openSavedFilterModal': 'showSavedFiltersModal',
                'click #new-filter-name-btn': 'saveNewFilter',
                'click #delete-filter-config': 'showConfirmModal',
                'click #update-filter-config': "updateFilterConfig",
                "click #edit-filter-name": "showFilterEdit",
                "click #save-filter-name": "updateFilterName",
                "click #load-filter-config": "loadFilterConfiguration",
                "click .hide-filter-name-button": "hideFilterNameInput",

                'click #reset-filters': 'resetFiltersToDefault',
            },

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

                this.renderSavedFiltersModal();
                this.renderAreaSelectModal();
                this.renderConfirmModal();

                this.initializeControls();
                this.addEventListeners();
            },

            renderModeView: function () {
                var el = document.querySelector('#' + this.mode + '-content'),
                    options = {
                        el: el,
                        template: this.mode + '-template',
                        filtersView: this,
                        levels: this.collections['arealevels'],
                    };

                this.modeView = this.mode == 'monitor' ? new MonitorView(options) : new ImpactView(options);
            },

            initializeControls: function () {
                var _this = this;

                // Set default admin level to Country:
                var areaLevels = this.collections['arealevels'];
                this.idOfCountryLevel = areaLevels.find(level => level.attributes.level == 1).id;

                // filters
                var groups = Object.keys(this.filters);
                groups.forEach(function(group) {
                    // initialize group object without areas
                    _this[group] = {'selectedAreas': [],
                                    'adminLevel': _this.idOfCountryLevel};

                    // get group filters
                    var filters = _this.filters[group];

                    filters.forEach(function(filter) {
                        // get filter fields
                        fields = Object.keys(filter);

                        // initialize field selectors
                        fields.forEach(function(field) {
                            var selector = 'select[name="' + group + '-' + field.toLowerCase() + '-select"]';
                            _this[group][field + 'Select'] = _this.el.querySelector(selector);
                        })
                    })
                })

                // in-or-out toggles
                this.origin.inOrOut = _this.el.querySelector('#origin-area-in-or-out');
                this.destination.inOrOut = _this.el.querySelector('#destination-area-in-or-out');

                // Initialize all bootstrapToggles:
                $(".bootstrapToggle").bootstrapToggle();

                // Initialize all selectpickers:
                $(".selectpicker").selectpicker();

                // Initialize all textarea-autoresize components:
                $(".selections").textareaAutoSize();
            },

            addEventListeners: function () {
                var _this = this;

                // render mode (monitor/impact)
                $('.analyse-mode-radio-label').on("click", function(event) {
                    let mode = $(this).attr("data-mode");

                    if (mode != _this.mode) {
                        _this.mode = mode;

                        $(".analyse-content-container").hide();
                        if (_this.modeView) _this.modeView.close();

                        _this.renderModeView();
                        $("#" + _this.mode + "-content").fadeIn();
                    }
                    event.preventDefault(); // avoid firing twice!
                });

                // origin/destination role buttons
                groups = ['origin', 'destination']
                groups.forEach(function(group) {
                    $('.' + group + '-role').on("click", function(event) {
                        let role =  $(this).attr('role'),
                            containers = ['production', 'treatment'];

                        _this[group].role = role;
                        containers.forEach(function(container) {
                            $("." + group + "-" + container)[(container == role) ? 'fadeIn' : 'hide']();
                        })

                        event.preventDefault(); // avoid firing twice!
                    })
                })

                // render ewc codes based on hazardous selection
                function filterHazardous(evt) {
                    let select = evt.target.value;

                    $("#flows-wastes04Col").hide(); // to happen in all cases
                    $("#flows-wastes02Col")[select == 'both' ? 'show' : 'hide']();
                    $(".chevronEwc06")[select == 'both' ? 'show' : 'hide']();
                    $("#flows-waste06-label").css("position", select == 'both' ? "relative" : "static");
                    $("#helpiconWaste06")[select == 'both' ? 'removeClass' : 'addClass']("hazaIconPos");
                    $("#flows-wastes06Col")[select == 'both' ? 'hide' : 'show']();

                    // load all hazardous/non-hazardous codess
                    if (select != 'both') {
                        let filteredWastes06 = _this.collections['wastes06'].models.filter(function (waste06) {
                            return waste06.attributes.hazardous == _this.boolean[select];
                        });
                        filterUtils.fillSelectPicker("wastes06", _this.flows.waste06Select, filteredWastes06);
                    }
                }
                $(this.flows.hazardousSelect).on('changed.bs.select', filterHazardous);

                // enable multiple check for selectors
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

                 // create menu based on parent field selection
                function filterbyParent(evt, clickedIndex, checked) {
                    let ids = $(evt.target).val(),
                        group = evt.data.group,
                        parent = evt.data.parent,
                        child = evt.data.child;
                        picker = _this[group][child + 'Select'],
                        tag = _this.tags[child];

                    // find child values
                    var values = _this.collections[tag].models.filter(function (child) {
                        return ids.includes(child.attributes[parent].toString())
                    });
                    filterUtils.fillSelectPicker(tag, picker, values);

                    // show/hide child menu column on parent selection
                    var column  = "#" + group + "-" + tag + "Col";
                    if (ids.length == 0 || ids[0] == "-1") {
                        $(column).fadeOut("fast");
                        $(picker).trigger("changed.bs.select"); // trigger change event
                    } else {
                        $(column).fadeIn("fast");
                    }
                }

                var groups = Object.keys(this.filters);
                groups.forEach(function(group) {
                    // all group filters
                    var filters = _this.filters[group];

                    filters.forEach(function(filter) {
                        var fields = Object.keys(filter);

                        fields.forEach(function(field, idx) {
                            var selector = $(_this[group][field + 'Select']); // field selector
                                options = selector[0].options;                // selector options

                            // no selectors for non-fuzzy booleans (either true or false)
                            // to find them, check if there are options, including 'both'
                            if (!(options.length > 0 && options[0].value == 'both')) {
                                // for hierarchical fields, check for child field
                                var next = fields[idx + 1]; // next field in order

                                // if child does exist
                                selector.on('changed.bs.select', multiCheck);
                                if (next !== undefined) {
                                    // render child menu, filtered by current field
                                    selector.on('changed.bs.select',
                                                {group: group, parent: field, child: next},
                                                filterbyParent);
                                }
                            }
                        })
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


            // AREA MODAL //
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
                                _this[block].selectedAreas = [];
                                areaFeats.forEach(function (areaFeat) {
                                    labels.push(areaFeat.label);
                                    _this[block].selectedAreas.push(areas.get(areaFeat.id));
                                });

                                $(".areaSelections-" + block)[_this[block].selectedAreas.length > 0 ? 'fadeIn' : 'fadeOut']();
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

                this[this.areaMap.block].adminLevel = levelId;

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

                if (_this[buttonClicked].selectedAreas.length > 0) {
                    _this[buttonClicked].selectedAreas = [];
                    $("#areaSelections-Textarea-" + buttonClicked).html("");
                    setTimeout(function () {
                        $(".areaSelections-" + buttonClicked).fadeOut();
                    }, 400);
                }
            },

            showAreaSelection: function (event) {
                var _this = this;

                // Used to determine which 'Select area'-button the user has pressed, either 'origin', 'flows', or 'destination':
                _this.areaMap.block = $(event.currentTarget).data('area-select-block');

                let adminLevel = _this[_this.areaMap.block].adminLevel;
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
                if (this[block].selectedAreas && this[block].selectedAreas.length > 0) {
                    // Loop through all selected areas in selectedAreas.origin:
                    this[block].selectedAreas.forEach(selectedArea => {
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
            // AREA MODAL //


            // FILTER MODAL //
            renderSavedFiltersModal: function () {
                var _this = this;
                let form;

                this.savedFiltersModal = this.el.querySelector('.saved-filters.modal');
                html = document.getElementById('saved-filters-modal-template').innerHTML;
                template = _.template(html);
                this.savedFiltersModal.innerHTML = template({
                    filters: this.collections['filters']
                });
                this.filterConfigSelect = this.el.querySelector('select[name="saved-filters-select"]');

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
                        _this[block].adminLevel = parseInt(savedConfig.adminLevel);

                        /**
                         * Function to be executed after areas of this level have been loaded:
                         * @param {int} adminLevel 
                         */
                        let executeAfterLoading = function (_this, adminLevel, block) {
                            let labelStringArray = [];
                            savedConfig.selectedAreas.forEach(selectedAreaId => {
                                let areaObject = _this.areas[adminLevel].models.find(area => area.attributes.id == selectedAreaId);
                                _this[block].selectedAreas.push(areaObject);
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
                        _this.prepareAreas(_this[block].adminLevel, false, executeAfterLoading, block);
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

                    // load origin/destination role
                    var groups = ['origin', 'destination'];
                    groups.forEach(function(group) {
                        var role = flows[group + '_role'];
                        if (role !== undefined) {
                            $("#" + group + "-role-radio-" + role).click();
                        }
                    })

                    // load fields with multiple fields
                    function load(group, picker, parents) {
                        // store ALL selectors
                        var field = picker[0],
                            val = picker[1],
                            pickers = [picker];

                        var tag = _this.tags[field];
                        parents.forEach(function(parent) {
                            // get current field collection
                            var collection = _this.collections[tag];

                            // filter collection with field values
                            collection = collection.models.filter(function(item) {
                                return val.includes(item.attributes.id.toString());
                            })

                            // find all parent ids
                            var ids = new Set(); // unique ids
                            collection.forEach(item => {
                                ids.add(item.attributes[parent].toString());
                            });

                            // store parent selector
                            val = Array.from(ids);
                            pickers.push([parent, val]);

                            // update tag
                            tag = _this.tags[parent];
                        })

                        // update ALL selectors
                        // lowest -> highest in hierarchy
                        pickers.reverse().forEach(function(picker) {
                            var field = picker[0],
                                val = picker[1];
                            $(_this[group][field + 'Select']).selectpicker("val", val);
                        })
                    }

                    // invert boolean inventory
                    var boolean = _.invert(_this.boolean);

                    var groups = Object.keys(this.filters);
                    groups.forEach(function(group) {
                        // get all group filters
                        var filters = _this.filters[group];

                        filters.forEach(function(filter) {
                            // get all filter fields// get all filter fields
                            fields = Object.keys(filter);

                            fields.forEach(function(field, idx) {
                                // load value of filter field
                                var val = flows[filter[field]];

                                // if value exists
                                if (val !== undefined) {
                                    // if value is Array
                                    if (Array.isArray(val)) {
                                        if (val.every(function(v) {return boolean[v] !== undefined})) {
                                            // if so, turn into real boolean values
                                            var _val = [];
                                            val.forEach(function(v) {
                                                _val.push(boolean[v]);
                                            })
                                            val = _val;
                                        }

                                        // find all parent fields
                                        // highest -> lowest in hierarchy
                                        var parents = fields.slice(0, idx).reverse();
                                        load(group, [field, val], parents);
                                    } else {
                                        // convert values to pseudo-boolean
                                        val = boolean[val];
                                        $(_this[group][field + 'Select']).selectpicker("val", val);
                                    }
                                }
                            })
                        })
                    })

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
            // FILTER MODAL //


            resetFiltersToDefault: function () {
                _this = this;

                // origin / destination role & in-or-out toggle
                var groups = ['origin', 'destination']
                groups.forEach(function(group) {
                    $("#" + group + "-role-radio-both").click();
                    $(_this[group].inOrOut).bootstrapToggle("off");
                })

                // get all groups
                var groups = Object.keys(this.filters);
                groups.forEach(function(group) {
                    // reset group areas
                    _this[group].selectedAreas = [];
                    _this[group].adminLevel = _this.idOfCountryLevel;

                    // reset area selections
                    $(".areaSelections-" + group).hide();
                    $("#areaSelections-Textarea-" + group).html("");

                    // reset all group filters
                    var filters = _this.filters[group];
                    filters.forEach(function(filter) {
                        // get all filter fields
                        var fields =  Object.keys(filter);

                        // reset selectors
                        fields.forEach(function(field) {
                            var selector = $(_this[group][field + 'Select']),
                                options = selector[0];
                            if (options.length > 0) {
                                selector.selectpicker('deselectAll');
                                options[0].selected = true;
                            }
                        })
                    })
                })

                // Empty all textareas:
                $(".selections").html("");
                $(".selections").textareaAutoSize();

                // Refresh all selectpickers:
                $(".selectpicker").selectpicker('refresh');
            },

            getFilterParams: function () {
                var _this = this;

                // request parameters
                let filterParams = {
                    origin: {},
                    destination: {},
                    flows: {},
                }

                // dataset filter -> to flows filters
                var datasets = this.collections['datasets'],
                    ids = $(this.flows.datasetSelect).val();
                // if 'all' is selected
                if (ids[0] == '-1') {
                    ids = [];
                    datasets.forEach(dataset => {
                        ids.push(dataset.get("id"));
                    });
                }
                filterParams.flows['datasets'] = ids;

                // origin/destination in-or-out & role
                let group = ['origin', 'destination']
                group.forEach(function(group) {
                    var inOrOut = _this[group].inOrOut;
                    filterParams[group].inOrOut = $(inOrOut).prop('checked') ? 'out' : 'in';

                    var role = _this[group].role;
                    if (role != 'both') {
                        // save to flows (non-spatial) filters
                        filterParams.flows[group + '_role'] = role;
                    }
                })

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
                        value = _this.boolean[value];
                    }
                    return value;
                }

                // load filters to request
                var groups = Object.keys(this.filters);
                groups.forEach(function(group) {
                    // get group areas
                    filterParams[group].adminLevel = _this[group].adminLevel;
                    if (_this[group].selectedAreas !== undefined &&
                        _this[group].selectedAreas.length > 0) {
                        filterParams[group].selectedAreas = [];
                        _this[group].selectedAreas.forEach(function (area) {
                            filterParams[group].selectedAreas.push(area.id);
                        });
                    }

                    // get group filters
                    var filters = _this.filters[group];
                    filters.forEach(function(filter) {
                        // get filter fields
                        var fields = Object.keys(filter);

                        var _field = _value = null;
                        fields.forEach(function(field) {
                            // retrieve filter value
                            var value = $(_this[group][field + 'Select']).val();

                            // forbidden values
                            var conditions = [
                                value !== 'both', // not 'both' option
                                value.length > 0, // not an empty array
                                value[0] !== "-1", // not 'all' option
                            ]

                            // if no forbidden values, process
                            if (!conditions.includes(false)) {
                                _field = filter[field];
                                _value = process(value);
                            }
                        })

                        // if no value, do not include filter in request
                        if (_value) {
                            // save activity (group) only on 'production' role
                            if (_this[group].role !== 'production' && _field.includes('activity')) {return;}

                            // save process (group) only on 'treatment' role
                            if (_this[group].role !== 'treatment' && _field.includes('process')) {return;}

                            // save to flows (non-spatial) fields
                            filterParams.flows[_field] = _value;
                        }
                    })
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