define(['views/common/baseview',
            'underscore',
            'geofluxus-circular-sankey',
            'react',
            'react-dom',
        ],

        function (
            BaseView,
            _,
            CircularSankey,
            React,
            ReactDOM) {
            /**
             *
             * @name module:views/CircularSankeyComponentView
             * @augments module:views/BaseView
             */
            var CircularSankeyComponentView = BaseView.extend(
                /** @lends module:views/CircularSankeyComponentView.prototype */
                {
                    /**
                     * @param {Object} options
                     * @param {HTMLElement} options.el  element the view will be rendered in
                     *
                     * @constructs
                     * @see http://backbonejs.org/#View
                     */
                    initialize: function (options) {
                        CircularSankeyComponentView.__super__.initialize.apply(this, [options]);


                        this.options = options;
                        this.render();
                    },

                    events: {

                    },

                    render() {


                        ReactDOM.render( < CircularSankey circularData = {
                                    this.options.circularData
                                }
                                />, document.getElementsByClassName(this.options.el)); return this;

                        // This works:
                        // ReactDOM.render(<p>Hello</p>, document.getElementById("circularsankey-wrapper")); return this;
                    },

                    close() {
                        ReactDOM.unmountComponentAtNode(this.options.el);
                        Backbone.View.prototype.remove.call(this);
                    }
                });
                return CircularSankeyComponentView;
            }
        );