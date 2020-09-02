// Flows
define(['views/common/baseview',
        'views/analyse/monitor',
        'underscore',
        'bootstrap',
        'bootstrap-select',
        'bootstrap-toggle',
        'textarea-autosize',
    ],
    function (
        BaseView,
        MonitorView,
        _,
    ) {

        var ImpactView = BaseView.extend({
            // Initialization
            initialize: function (options) {
                var _this = this;
                ImpactView.__super__.initialize.apply(this, [options]);

                this.filtersView = options.filtersView;
                this.areaLevels = options.levels;

                this.render();
            },

            // DOM events
            events: {
                'click #reset-dim-viz': 'resetDimAndVizToDefault',
            },

            // Rendering
            render: function () {
                var html = document.getElementById(this.template).innerHTML;
                var template = _.template(html)

                this.el.innerHTML = template();

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
                    levels: this.areaLevels,
                    mode: "impact",
                    titleNumber: 4,
                });
            },

            initializeControls: function () {
                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // Indicator toggle
                $('.impact-indicator-radio-label').on("click", function (event) {
                    // reset dimensions & visualizations
                    _this.monitorView.resetDimAndVizToDefault();
                    $('#impact-source-toggle-econ-activity').bootstrapToggle('disable')

                    _this.monitorView.indicator = $(event.currentTarget).attr("data-indicator");
                    
                    $(".impactSourceContainer").fadeIn();
                    $('.impactSourceToggle').each(function (index, value) {
                        $(this).bootstrapToggle('off');
                    });

                    if (_this.monitorView.indicator == 'co2') {
                        $('#impact-source-toggle-treatment').bootstrapToggle('enable');
                    }
                    else {
                        $('#impact-source-toggle-treatment').bootstrapToggle('disable');
                    }

                    event.preventDefault();
                });

                // Impact source toggles:
                $(".impactSourceToggle").change(function (event) {
                    let checkedToggles = [];

                    // Divide the toggles in arrays of checked and unchecked toggles:
                    $('.impactSourceToggle').each(function (index, value) {
                        let checked = $(this.parentElement.firstChild).prop('checked');
                        if (checked) {
                            checkedToggles.push($(this));
                        }
                    });

                    $("#impact-dimensions-container")[checkedToggles.length ? 'fadeIn' : 'fadeOut']();
                });

                // selected visualization
                $('.viz-selector-button').on("click", function (event) {
                    if ($(this).attr("data-viz") == 'networkmap') {
                        $('#impact-source-toggle-treatment').bootstrapToggle('off');
                        $('#impact-source-toggle-treatment').bootstrapToggle('disable');
                    }
                    else {
                        $('#impact-source-toggle-treatment').bootstrapToggle('enable');
                    }

                    event.preventDefault();
                });
            },

            close: function () {                
                if (this.monitorView) this.monitorView.close();
                this.undelegateEvents(); // remove click events
                this.unbind(); // Unbind all local event bindings
            }

        });
        return ImpactView;
    });