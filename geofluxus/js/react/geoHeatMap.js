import React from "react";
import { StaticMap } from "react-map-gl";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import utils from "utils/utils";

var d3plus = require("visualizations/d3plus");

// Set your mapbox token here
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXZlcnR2aCIsImEiOiJja2VjaXE3MXMwaWNwMnpydmI2bXAwOTN4In0.dzmqNRHwb0qj20iHHr5K1Q"; // eslint-disable-line

// Source data CSV
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv"; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];


export default function App({
  data,
  isDarkMode,
  mapStyle,
  radius,
  label,
  isActorLevel,
  upperPercentile = 100,
  coverage = 1,
}) {
  var center = utils.getCenter(data);
  var maxValue = Math.max.apply(
    Math,
    data.map(function (o) {
      return o[2];
    })
  );

  if (isDarkMode) {
    mapStyle = "mapbox://styles/mapbox/dark-v9"
  } else {
    mapStyle = "mapbox://styles/mapbox/light-v9" 
  }

  function getValues(points) {
    return points.reduce((a, b) => a + (b[2] || 0), 0);
  }

  function getTooltip({ object }) {
    if (!object) {
      return null;
    }

    const total = object.points.reduce((a, b) => a + (b[2] || 0), 0);

    // latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
    // longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
    return (
      label +
      `\: ${
        d3plus.formatAbbreviate(total, utils.returnD3plusFormatLocale()) + " t"
      }`
    );
  }

  function getTooltipHtml({ object }) {
    if (!object) {
      return null;
    }

    const total = object.points.reduce((a, b) => a + (b[2] || 0), 0);
    const tooltipTitleValue = isActorLevel ? "This area:" : object.points[0][3];

    var html = `<div class="d3plus-tooltip flowMapToolTip pointToolTIp" x-placement="top">
        <div class="d3plus-tooltip-title">${tooltipTitleValue}</div>
        <div class="d3plus-tooltip-body"></div>
        <table class="d3plus-tooltip-table" style='display: block !important'>
            <thead class="d3plus-tooltip-thead"></thead>
            <tbody class="d3plus-tooltip-tbody" style="display: inline-table !important; width: 100%; padding-bottom: 0.5rem;">
                <tr>
                    <td>${label}</td>
                    <td>${d3plus.formatAbbreviate(
                      total,
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

  const INITIAL_VIEW_STATE = {
    longitude: center.lon,
    latitude: center.lat,
    zoom: 6.6,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
    bearing: 0, // Up == north
  };

  const layers = [
    new HexagonLayer({
      id: "heatmap",
      colorRange,
      coverage,
      data,
      elevationRange: [0, 3000],
      elevationScale: data && maxValue ? 50 : 0,
      extruded: true,
      getPosition: (d) => d,
      getElevationValue: getValues,
      pickable: true,
      radius,
      upperPercentile,
      material,
      transitions: {
        elevationScale: 3000,
      },
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltipHtml}
    >
      <StaticMap
        reuseMaps
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      />{" "}
    </DeckGL>
  );
}

// export function renderToDOM(container) {
//   render(<App />, container);

//   require("d3-request").csv(DATA_URL, (error, response) => {
//     if (!error) {
//       const data = response.map((d) => [Number(d.lng), Number(d.lat)]);
//       render(<App data={data} />, container);
//     }
//   });
// }
