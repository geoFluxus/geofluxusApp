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
                    titleNumber: 5,
                });
            },

            initializeControls: function () {
                $(".bootstrapToggle").bootstrapToggle();
            },

            addEventListeners: function () {
                var _this = this;

                // Indicator toggle
                $('.impact-indicator-radio-label').on("click", function (event) {
                    _this.monitorView.indicator = $(event.currentTarget).attr("data-indicator");
                    
                    $(".impactSourceContainer").fadeIn();
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

            },

            close: function () {                
                if (this.monitorView) this.monitorView.close();
                this.undelegateEvents(); // remove click events
                this.unbind(); // Unbind all local event bindings
            }

        });
        return ImpactView;
    });