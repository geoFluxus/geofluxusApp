import React, { useState, useMemo } from "react";
import { render } from "react-dom";
import { StaticMap, WebMercatorViewport } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import { scaleQuantile } from "d3-scale";
import utils from "utils/utils";

var d3plus = require("visualizations/d3plus");

// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXZlcnR2aCIsImEiOiJja2VjaXE3MXMwaWNwMnpydmI2bXAwOTN4In0.dzmqNRHwb0qj20iHHr5K1Q"; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json"; // eslint-disable-line

export const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

export const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38],
];

// function calculateArcs(data, selectedCounty) {
//   if (!data || !data.length) {
//     return null;
//   }
//   if (!selectedCounty) {
//     selectedCounty = data.find((f) => f.properties.name === "Los Angeles, CA");
//   }
//   const { flows, centroid } = selectedCounty.properties;

//   const arcs = Object.keys(flows).map((toId) => {
//     const f = data[toId];
//     return {
//       source: centroid,
//       target: f.properties.centroid,
//       value: flows[toId],
//     };
//   });

//   const scale = scaleQuantile()
//     .domain(arcs.map((a) => Math.abs(a.value)))
//     .range(inFlowColors.map((c, i) => i));

//   arcs.forEach((a) => {
//     a.gain = Math.sign(a.value);
//     a.quantile = scale(Math.abs(a.value));
//   });

//   return arcs;
// }

function getTooltip({ object }) {
  return object && object.properties.name;
}

/* eslint-disable react/no-deprecated */
export default function App({
  element,
  data,
  isDarkMode,
  mapStyle,
  radius,
  label,
  isActorLevel,
  coverage = 1,
  strokeWidth,
}) {
  //   const arcs = useMemo(() => calculateArcs(data, selectedCounty), [
  //     data,
  //     selectedCounty,
  //   ]);

  if (isDarkMode) {
    mapStyle = "mapbox://styles/mapbox/dark-v9";
  } else {
    mapStyle = "mapbox://styles/mapbox/light-v9";
  }

  var maxFlowValue = Math.max.apply(
    Math,
    data.map(function (o) {
      return o.amount;
    })
  );

  const maxFlowWidth = 50;
  const minFlowWidth = 1;
  const normFactor = maxFlowWidth / maxFlowValue;

  // Calculate center of the map based on all coordinates of origin and destination of the flows/arcs:
  var points = [];
  data.forEach((item) => {
    points.push([item.origin.lon, item.origin.lat]);
    points.push([item.destination.lon, item.destination.lat]);
  });

  const applyToArray = (func, array) => func.apply(Math, array);

  // Calculate corner values of bounds
  const pointsLong = points.map((point) => point[0]);
  const pointsLat = points.map((point) => point[1]);
  const cornersLongLat = [
    [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
    [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)],
  ];

  // const viewportWidth = $(element).width();
  // const viewportHeight = $(element).height();

  // const viewport = new WebMercatorViewport({
  //   width: viewportWidth,
  //   height: viewportHeight,
  // })
  // Use WebMercatorViewport to get center longitude/latitude and zoom
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 600,
  }).fitBounds(cornersLongLat, { padding: 0 }); // Can also use option: offset: [0, -100]
  var longitude = viewport.longitude,
    latitude = viewport.latitude,
    zoom = viewport.zoom;
  // console.log(longitude, latitude, zoom);

  function getTooltipHtml({ object }) {
    if (!object) {
      return null;
    }

    // const total = object.points.reduce((a, b) => a + (b[2] || 0), 0);
    const tooltipTitleValue =
      object.origin.name + " &#10132; " + object.destination.name;

    var html = `<div class="d3plus-tooltip flowMapToolTip pointToolTIp" x-placement="top">
    <div class="d3plus-tooltip-title">${tooltipTitleValue}</div>
    <div class="d3plus-tooltip-body"></div>
        <table class="d3plus-tooltip-table" style='display: block !important'>
            <thead class="d3plus-tooltip-thead"></thead>
            <tbody class="d3plus-tooltip-tbody" style="display: inline-table !important; width: 100%; padding-bottom: 0.5rem;">
                <tr>
                    <td>Amount</td>
                    <td>${d3plus.formatAbbreviate(
                      object.amount,
                      utils.returnD3plusFormatLocale()
                    )} t</td>
                </tr>
            </tbody>
        </table>
    </div>`;

    return {
      html: html,
      style: {
        "z-index": 1,
        position: "absolute",
        color: "black",
        "background-color": "transparent",
        padding: "10px",
      },
    };
  }
  console.log(longitude, latitude, zoom);
  const INITIAL_VIEW_STATE = {
    longitude: longitude,
    latitude: latitude,
    zoom: zoom,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
    bearing: 0, // Up == north
  };

  function getRgbArray(str) {
    var match = str.match(
      /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/
    );
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : [];
  }

  const layers = [
    // new GeoJsonLayer({
    //   id: "geojson",
    //   data,
    //   stroked: false,
    //   filled: true,
    //   getFillColor: [0, 0, 0, 0],
    //   onClick: ({ object }) => selectCounty(object),
    //   pickable: true,
    // }),
    new ArcLayer({
      id: "arc",
      data: data,
      getSourcePosition: (d) => [d.origin.lon, d.origin.lat],
      getTargetPosition: (d) => [d.destination.lon, d.destination.lat],
      getSourceColor: (d) => getRgbArray(d.color),
      getTargetColor: (d) => getRgbArray(d.color),
      getWidth: (d) => Math.max(minFlowWidth, d.amount * normFactor),
      autoHighlight: true,
      pickable: true,
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      // getTooltip={getTooltipHtml}
      getTooltip={(d) => getTooltipHtml(d)} //{getTooltipHtml}
      // getTooltip={(object) => object && `${object} to ${object}`}
    >
      <StaticMap
        reuseMaps
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      />
    </DeckGL>
  );
}

// export function renderToDOM(container) {
//   render(<App />, container);

//   fetch(DATA_URL)
//     .then((response) => response.json())
//     .then(({ features }) => {
//       render(<App data={features} />, container);
//     });
// }
