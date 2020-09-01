import React, { useState, useMemo } from "react";
import { render } from "react-dom";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import { scaleQuantile } from "d3-scale";
import utils from "utils/utils";

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

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

function calculateArcs(data, selectedCounty) {
  if (!data || !data.length) {
    return null;
  }
  if (!selectedCounty) {
    selectedCounty = data.find((f) => f.properties.name === "Los Angeles, CA");
  }
  const { flows, centroid } = selectedCounty.properties;

  const arcs = Object.keys(flows).map((toId) => {
    const f = data[toId];
    return {
      source: centroid,
      target: f.properties.centroid,
      value: flows[toId],
    };
  });

  const scale = scaleQuantile()
    .domain(arcs.map((a) => Math.abs(a.value)))
    .range(inFlowColors.map((c, i) => i));

  arcs.forEach((a) => {
    a.gain = Math.sign(a.value);
    a.quantile = scale(Math.abs(a.value));
  });

  return arcs;
}

function getTooltip({ object }) {
  return object && object.properties.name;
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  isDarkMode,
  mapStyle,
  radius,
  label,
  isActorLevel,
  coverage = 1,
  strokeWidth = 2,
}) {
  const [selectedCounty, selectCounty] = useState(null);

//   const arcs = useMemo(() => calculateArcs(data, selectedCounty), [
//     data,
//     selectedCounty,
//   ]);

  if (isDarkMode) {
    mapStyle = "mapbox://styles/mapbox/dark-v9";
  } else {
    mapStyle = "mapbox://styles/mapbox/light-v9";
  }

  var center = utils.getCenter(data);

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
    //   getSourceColor: (d) =>
    //     (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
    //   getTargetColor: (d) =>
    //     (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
    //   getWidth: strokeWidth,
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
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

export function renderToDOM(container) {
  render(<App />, container);

  fetch(DATA_URL)
    .then((response) => response.json())
    .then(({ features }) => {
      render(<App data={features} />, container);
    });
}
