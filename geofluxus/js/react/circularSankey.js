// /** @jsx React.DOM */
// var React = require('react');
// var ReactBackbone = require('react.backbone');
// var CircularSankey = require('geofluxus-circular-sankey')

define(['views/common/baseview',
    'underscore',
    'd3',
    'collections/collection',
    'app-config',
    'save-svg-as-png',
    'file-saver',
    'utils/utils',
    'utils/enrichFlows',
    'geofluxus-circular-sankey',
    'react',
    'react-dom',
],

    function (
        BaseView,
        _,
        d3,
        Collection,
        config,
        saveSvgAsPng,
        FileSaver,
        utils,
        enrichFlows,
        CircularSankey,
        React,
        ReactDOM,
        Slider) {
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
                 * @param {HTMLElement} options.el                   element the view will be rendered in
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
                    ReactDOM.render(<CircularSankey circularData={this.options.flows} />, this.options.el); return this;
                },
                close() {
                    ReactDOM.unmountComponentAtNode(this.options.el); Backbone.View.prototype.remove.call(this);
                }
            });
        return CircularSankeyComponentView;
    }
);