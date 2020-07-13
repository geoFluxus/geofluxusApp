// Flows
define(['views/common/baseview',
        'views/analyse/monitor',
        'underscore',
        'd3',
        'openlayers',
        'visualizations/map',
        'collections/collection',
        'utils/utils',
        'bootstrap',
        'bootstrap-select',
        'bootstrap-toggle',
        'textarea-autosize',
    ],
    function (
        BaseView,
        MonitorView,
        _,
        d3,
        ol,
        Map,
        Collection,
        utils,
    ) {

        var ImpactView = BaseView.extend({

            // Initialization
            initialize: function (options) {
                var _this = this;
                ImpactView.__super__.initialize.apply(this, [options]);

                this.filtersView = options.filtersView;

                this.dimensions = {};
                this.maxNumberOfDimensions = 1;
                this.selectedDimensionStrings = [];
                this.impactSourceStrings = [];

                this.areaLevels = new Collection([], {
                    apiTag: 'arealevels',
                    comparator: "level",
                });

                var promises = [
                    this.areaLevels.fetch(),
                ];
                Promise.all(promises).then(function () {
                    _this.render();
                })
            },

            // DOM events
            events: {
                // 'click #apply-filters': 'fetchFlows',
                'click #reset-dim-viz': 'resetDimAndVizToDefault',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html)

                this.el.innerHTML = template({
                    levels: this.areaLevels,
                    maxNumberOfDimensions: this.maxNumberOfDimensions
                });

                this.renderMonitorView();

                this.initializeControls();
                this.addEventListeners();
            },

            renderMonitorView: function () {
                var el = document.querySelector('#impact-dimensions-container');
                this.monitorView = new MonitorView({
                    el: el,
                    template: 'monitor-template',
                    filtersView: this.filtersView,
                    mode: "impact",
                    maxNumberOfDimensions: 2,
                    indicator: this.indicator,
                    titleNumber: 5,
                    impactSourceStrings: this.impactSourceStrings,
                    levels: this.areaLevels,
                });
            },

            initializeControls: function () {
                // Impact source controls:
                this.impactSources = {};
                this.impactSources.transportation = this.el.querySelector('#impact-source-toggle-transportation');
                this.dimensions.treatment = this.el.querySelector('#impact-source-toggle-treatment');

                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // Indicator toggle
                $('.impact-indicator-radio-label').on("click", function (event) {
                    let clickedIndicator = $(this).attr("data-indicator");

                    if (clickedIndicator != _this.indicator) {
                        _this.indicator = clickedIndicator;
                        $(".impactSourceContainer").fadeIn();
                    }
                    event.preventDefault();
                });

                // Impact source toggles:
                $(".impactSourceToggle").change(function (event) {
                    let checkedToggles = [];
                    let uncheckedToggles = [];
                    _this.impactSourceStrings = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.impactSourceToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked')
                        if (!checked) {
                            uncheckedToggles.push($(this));
                        } else {
                            checkedToggles.push($(this));
                            _this.impactSourceStrings.push($(this).attr("data-source"));
                        }
                    });

                    if (_this.impactSourceStrings.length > 0) {
                        $("#impact-dimensions-container").fadeIn();
                    } else {
                        $("#impact-dimensions-container").fadeOut();
                    }
                });

            },

            close: function () {                
                if (this.impactView) this.impactView.close();
                this.undelegateEvents(); // remove click events
                this.unbind(); // Unbind all local event bindings
            }

        });
        return ImpactView;
    });