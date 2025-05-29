import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const MapTilerMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/satellite/style.json?key=GJbwNsLuj1lH9Nd3r6HA`,
      center: [83.2185, 17.6868], // Vizag
      zoom: 12,
    });

    new maplibregl.Marker()
      .setLngLat([83.2185, 17.6868])
      .addTo(map.current);

    return () => map.current.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "400px", position: "relative" }}
    />
  );
};

export default MapTilerMap;
