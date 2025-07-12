import React, { useEffect, useState, useMemo, useRef } from "react";
import Map, { Source, Layer } from "react-map-gl";
import { stateAbbreviations } from "@/utils/stateAbbreviations";
import { computeZipCounts } from "@/utils/mapAggregate";

const ZipMap = ({
  csvData,
  selectedYear = 2024,
  persistMap,
  setPersistMap,
  setShowMap,
  metric,
  detentionType = "secure-detention",
}) => {
  const [zctaGeoJSON, setZctaGeoJSON] = useState(null);
  const [county, setCounty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef();

  // Extract county
  useEffect(() => {
    if (csvData?.length > 0) {
      setCounty(csvData[0]["CountyName"]);
    }
  }, [csvData]);

  // Fetch ZIP GeoJSON
  useEffect(() => {
    if (county?.includes(",")) {
      const state = county.split(", ")[1];
      const fetchStateZips = async () => {
        try {
          const url = `https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/${state.toLowerCase()}_${stateAbbreviations[
            state
          ]
            .toLowerCase()
            .replace(/ /g, "_")}_zip_codes_geo.min.json`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to load ZCTA for ${state}`);
          const data = await res.json();
          setZctaGeoJSON(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchStateZips();
    }
  }, [county]);
  const handleClick = () => {
    setPersistMap(false);
    setShowMap(false);
  };

  const { zipCounts, outOfStateCount } = useMemo(() => {
    return computeZipCounts({
      csvData,
      zctaGeoJSON,
      selectedYear,
      detentionType,
      metric,
    });
  }, [csvData, selectedYear, detentionType, metric, zctaGeoJSON]);

  // Filter GeoJSON + attach counts
  const filteredGeoJSON = useMemo(() => {
    if (!zctaGeoJSON) return null;
    const features = zctaGeoJSON.features
      .filter((f) => {
        const zip = f.properties.ZCTA5CE10;
        return zip && zipCounts[zip];
      })
      .map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          count: zipCounts[f.properties.ZCTA5CE10] || 0,
        },
      }));
    return { type: "FeatureCollection", features };
  }, [zctaGeoJSON, zipCounts]);

  // Bounding box
  const bounds = useMemo(() => {
    if (!filteredGeoJSON) return null;
    const coords = filteredGeoJSON.features.flatMap((f) => {
      if (f.geometry.type === "Polygon") return f.geometry.coordinates.flat();
      if (f.geometry.type === "MultiPolygon")
        return f.geometry.coordinates.flat(2);
      return [];
    });

    const validCoords = coords.filter(
      (c) =>
        Array.isArray(c) &&
        c.length === 2 &&
        typeof c[0] === "number" &&
        typeof c[1] === "number"
    );
    if (!validCoords.length) return null;

    const lons = validCoords.map(([lon]) => lon);
    const lats = validCoords.map(([_, lat]) => lat);
    return [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];
  }, [filteredGeoJSON]);

  // Fit map to bounds *only when map is loaded*
  useEffect(() => {
    if (mapLoaded && bounds) {
      const map = mapRef.current?.getMap?.();
      if (map) {
        map.fitBounds(bounds, { padding: 40, duration: 1000 });
      }
    }
  }, [bounds, mapLoaded]);

  const layerStyle = {
    id: "zcta-fill",
    type: "fill",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "count"],
        1,
        "#fee5d9",
        10,
        "#fcae91",
        50,
        "#fb6a4a",
        100,
        "#cb181d",
      ],
      "fill-opacity": 0.7,
    },
  };

  const labelLayer = {
    id: "zcta-labels",
    type: "symbol",
    layout: {
      "text-field": ["concat", ["get", "ZCTA5CE10"], "\n", ["get", "count"]],
      "text-size": 16,
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-justify": "center",
      "text-anchor": "center",
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#fff",
      "text-halo-width": 1,
    },
  };

  if (!filteredGeoJSON) return <div>Loading map data...</div>;

  return (
    <Map
      ref={mapRef}
      onLoad={() => setMapLoaded(true)}
      mapLib={import("maplibre-gl")}
      initialViewState={{
        longitude: -95,
        latitude: 37,
        zoom: 3.5,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(255, 255, 255, 0.9)",
          color: "#666",
          fontSize: "14px",
          padding: "6px 10px",
          borderRadius: "4px",
          opacity: persistMap ? 0 : 1,
          zIndex: 1000,
        }}
      >
        Click the statistics bar to interact with the map
      </div>
      <Source id="zcta" type="geojson" data={filteredGeoJSON}>
        <Layer {...layerStyle} />
        <Layer {...labelLayer} />
      </Source>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          zIndex: 1000,
          opacity: persistMap ? 1 : 0,
          pointerEvents: persistMap ? "auto" : "none",
        }}
        onClick={() => handleClick()}
      >
        ×
      </div>
      {/* Out of state admissions count */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(255, 255, 255, 0.95)",
          color: "#333",
          fontSize: "14px",
          fontWeight: "bold",
          padding: "6px 10px",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        Out of state: {outOfStateCount}
      </div>
    </Map>
  );
};

export default ZipMap;
