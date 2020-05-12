/** @jsx React.DOM */
var React = require('react');
var ReactBackbone = require('react.backbone');
var CircularSankey = require('geofluxus-circular-sankey')

var CircularSankeyComponent = React.createBackboneClass({
  render: function (options) {
    const pageMargins = {
      top: 50,
      left: 300,
      right: 50,
      bottom: 0
    }

    return (
      <CircularSankey
        circularData={options.flows}
        width={900}
        height={1000}
        absolutePosition={pageMargins}
      />
    )
  }
});

module.exports = CircularSankeyComponent;

