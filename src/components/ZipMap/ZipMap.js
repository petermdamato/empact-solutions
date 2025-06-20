import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Map, { Source, Layer } from "react-map-gl";
import { stateAbbreviations } from "@/utils/stateAbbreviations";

const ZipMap = ({ csvData, selectedYear = 2024 }) => {
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

  // Count ZIPs
  const zipCounts = useMemo(() => {
    const counts = {};
    csvData.forEach((entry) => {
      const zip = entry["Home_Zip_Code"];
      const year = new Date(entry["Admission_Date"]).getFullYear();
      if (zip && year === selectedYear) {
        counts[zip] = (counts[zip] || 0) + 1;
      }
    });
    return counts;
  }, [csvData, selectedYear]);

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
      <Source id="zcta" type="geojson" data={filteredGeoJSON}>
        <Layer {...layerStyle} />
      </Source>
    </Map>
  );
};

export default ZipMap;
