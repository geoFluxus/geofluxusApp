var CircularSankey = require('geofluxus-circular-sankey').default;

define(['views/common/baseview',
        'underscore',
        'react',
        'react-dom',
    ],

    function (
        BaseView,
        _,
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
                    let absolutePosition = {
                        top: 40,
                        left: 300,
                        right: 300,
                        bottom: 60
                    }

                    // ReactDOM.render( < CircularSankey data = {
                    //             this.options.circularData
                    //         }
                    //         width = {
                    //             this.options.height
                    //         }
                    //         height = {
                    //             this.options.width
                    //         }
                    //         absolutePosition = {
                    //             absolutePosition
                    //         }
                    //         />, document.getElementById(this.options.el)); return this;

                    ReactDOM.render(React.createElement(CircularSankey, {
                        data: this.options.circularData,
                        width: this.options.width / 2,
                        height: this.options.height,
                        absolutePosition: absolutePosition,
                        fontColor: this.options.fontColor,
                        unitString: this.options.label + " t",
                    }), document.querySelector(this.options.el));
                    return this;

                },

                close() {
                    ReactDOM.unmountComponentAtNode(document.querySelector(this.options.el));
                    Backbone.View.prototype.remove.call(this);
                }
            });
        return CircularSankeyComponentView;
    }
);