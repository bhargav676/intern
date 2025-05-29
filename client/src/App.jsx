import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css'; // <--- IMPORT LEAFLET CSS HERE
import './App.css';

const App = () => {
  const [devices, setDevices] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState(''); 

  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };
    fetchDevices();
  }, []);

  
  const handleMarkerClick = async (deviceId, deviceName) => { 
    setSelectedDeviceName(deviceName);
    try {
      const response = await axios.get(`http://localhost:5000/api/sensor-data/${deviceId}`);
      if (response.data && response.data.length > 0) {
        setSensorData(response.data[0]);
      } else {
        setSensorData(null); 
        console.warn(`No sensor data found for deviceId: ${deviceId}`);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Water Quality Dashboard</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Container */}
        <div className="lg:w-2/3 w-full h-[600px] bg-white shadow-lg rounded-lg overflow-hidden">
          <MapContainer
            center={[12.9716, 77.5946]} // Default center (Bangalore)
            zoom={10}
            className="w-full h-full"
            // style={{ height: '100%', width: '100%' }} // Alternative way to ensure size
          >
            <TileLayer
              // Satellite Tile Layer (Esri World Imagery)
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
            {/* You can optionally add a layer for labels/roads on top of satellite */}
            {/* <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              pane="overlayPane" // Ensure it renders on top
            /> */}
            {devices.map((device) => (
              <Marker
                key={device.deviceId}
                position={[device.location.coordinates[1], device.location.coordinates[0]]} // [lat, lon]
                eventHandlers={{
                  click: () => handleMarkerClick(device.deviceId, device.name), // Pass name
                }}
              >
                <Popup>{device.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {/* Sensor Data Panel */}
        <div className="lg:w-1/3 w-full bg-white p-6 rounded-lg shadow-lg">
          {sensorData ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedDeviceName || 'Sensor Data'} {/* Use selectedDeviceName */}
              </h3>
              <p className="text-gray-600">pH: <span className="font-medium">{sensorData.ph !== undefined && sensorData.ph !== null ? sensorData.ph : 'N/A'}</span></p>
              <p className="text-gray-600">Turbidity: <span className="font-medium">{sensorData.turbidity !== undefined && sensorData.turbidity !== null ? `${sensorData.turbidity} NTU` : 'N/A'}</span></p>
              <p className="text-gray-600">TDS: <span className="font-medium">{sensorData.tds !== undefined && sensorData.tds !== null ? `${sensorData.tds} ppm` : 'N/A'}</span></p>
              <p className="text-gray-600">Timestamp: <span className="font-medium">{new Date(sensorData.timestamp).toLocaleString()}</span></p>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {selectedDeviceName ? `Fetching data for ${selectedDeviceName}...` : 'Click a marker to view sensor data'}
            </p>
          )}
        </div>
      </div>
    </div>
  ); 
};

export default App;