import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import io from 'socket.io-client';
import L from 'leaflet';
import Navbar from './Navbar';
import DeviceListPanel from './DeviceListPanel';
import SensorDataPanel from './SensorDataPanel';
import MapControls from './MapControls';
import MapViewController from './MapViewController';
import DeviceMarker from './DeviceMarker';
import 'leaflet/dist/leaflet.css';

const MAPTILER_API_KEY = '7mouERLf0uvhtKp0E7Xz';
const API_BASE_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

const MAP_LAYERS = {
  hybrid: {
    name: 'Hybrid',
    url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
    attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  },
  streets: {
    name: 'Streets',
    url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
    attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  }
};

const INDIA_INITIAL_BOUNDS = [[6.5546079, 68.1113787], [35.6745457, 97.395561]];
const DEVICE_ZOOM_LEVEL = 14;

const AdminDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [userSensors, setUserDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [isLoading, setIsLoading] = useState({ devices: true, sensorData: false });
  const [mapView, setMapView] = useState({ bounds: INDIA_INITIAL_BOUNDS });
  const [activeMapLayer, setActiveMapLayer] = useState('hybrid');
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mapRef = useRef();

  const fetchDevices = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, devices: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/devices`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDevices(response.data.map(d => ({ ...d, status: 'device', type: 'admin' })));
    } catch (error) {
      console.error('Error fetching admin devices:', error);
      setDevices([]);
    } finally {
      setIsLoading(prev => ({ ...prev, devices: false }));
    }
  }, []);

  const fetchUserDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/user-sensor-data`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const grouped = response.data.reduce((acc, data) => {
        const key = data.userId._id;
        if (!acc[key]) {
          const status = data.ph > 8.5 || data.ph < 6.5 || data.turbidity > 25 || data.tds > 1000 ? 'alert' : 
                         data.ph >= 6.0 && data.ph <= 9.0 || data.turbidity <= 25 || data.tds <= 1000 ? 'Active' : 'normal';
          acc[key] = {
            deviceId: `user-${key}`,
            userId: key,
            name: data.userId.username,
            location: { coordinates: [data.longitude, data.latitude] },
            latestData: data,
            status: status,
            type: 'user'
          };
        }
        return acc;
      }, {});
      setUserDevices(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching user sensor data:', error);
      setUserDevices([]);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchUserDevices();

    socket.on('newUserSensorData', (data) => {
      setUserDevices((prev) => {
        const existing = prev.find((d) => d.userId === data.userId);
        const status = data.ph > 8.5 || data.ph < 6.5 || data.turbidity > 25 || data.tds > 1000 ? 'alert' : 
                         data.ph >= 6.0 && data.ph <= 9.0 || data.turbidity <= 25 || data.tds <= 1000 ? 'Active' : 'normal';
        if (existing) {
          return prev.map((d) =>
            d.userId === data.userId
              ? { ...d, location: { coordinates: [data.longitude, data.latitude] }, latestData: data, status: status }
              : d
          );
        }
        return [
          ...prev,
          {
            deviceId: `user-${data.userId}`,
            userId: data.userId,
            name: data.username,
            location: { coordinates: [data.longitude, data.latitude] },
            latestData: data,
            status: status,
            type: 'user'
          }
        ];
      });
    });

 return () => socket.off('newUserSensorData');
}, [fetchDevices, fetchUserDevices]);

  const handleMarkerClick = useCallback(async (device) => {
    if (selectedDevice?.deviceId === device.deviceId && sensorData) {
      return;
    }

    setSelectedDevice(device);
    setSensorData(null);
    setIsLoading(prev => ({ ...prev, sensorData: true }));
    setMapView({
      center: [device.location.coordinates[1], device.location.coordinates[0]],
      zoom: DEVICE_ZOOM_LEVEL
    });
    setIsDeviceListOpen(false);

    try {
      let response;
      if (device.type === 'admin') {
        response = await axios.get(`${API_BASE_URL}/admin/devices/${device.deviceId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        response = { data: device.latestData };
      }
      setSensorData(response.data && (response.data.length > 0 ? response.data[0] : response.data));
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setSensorData(null);
    } finally {
      setIsLoading(prev => ({ ...prev, sensorData: false }));
    }
  }, [selectedDevice, sensorData]);

  const handleCloseDevicePanel = useCallback(() => {
    setSelectedDevice(null);
    setSensorData(null);
  }, []);

  const zoomToFitAllDevices = useCallback(() => {
    const allDevices = [...devices, ...userSensors];
    if (allDevices.length > 0) {
      const deviceBounds = L.latLngBounds(allDevices.map(d => [d.location.coordinates[1], d.location.coordinates[0]]));
      setMapView({ bounds: deviceBounds });
    } else {
      setMapView({ bounds: INDIA_INITIAL_BOUNDS });
    }
    setSelectedDevice(null);
  }, [devices, userSensors]);

  const getStatusInfo = (value, type) => {
    let color = 'text-slate-500';
    let bgColor = 'bg-slate-100';
    let text = 'N/A';
    if (value === null || value === undefined) return { color, bgColor, text };
    if (type === 'ph') {
      text = value.toFixed(2);
      if (value >= 6.5 && value <= 8.5) { color = 'text-green-700'; bgColor = 'bg-green-100'; }
      else if ((value >= 6.0 && value < 6.5) || (value > 8.5 && value <= 9.0)) { color = 'text-yellow-700'; bgColor = 'bg-yellow-100'; }
      else { color = 'text-red-700'; bgColor = 'bg-red-100'; }
    } else if (type === 'turbidity') {
      text = `${value.toFixed(1)} NTU`;
      if (value <= 5) { color = 'text-green-700'; bgColor = 'bg-green-100'; }
      else if (value <= 25) { color = 'text-yellow-700'; bgColor = 'bg-yellow-100'; }
      else { color = 'text-red-700'; bgColor = 'bg-red-100'; }
    } else if (type === 'tds') {
      text = `${value} ppm`;
      if (value <= 500) { color = 'text-green-700'; bgColor = 'bg-green-100'; }
      else if (value <= 1000) { color = 'text-yellow-700'; bgColor = 'bg-yellow-100'; }
      else { color = 'text-red-700'; bgColor = 'bg-red-100'; }
    }
    return { color, bgColor, text };
  };

  const filteredDevices = [...devices, ...userSensors].filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-slate-100 flex flex-col antialiased overflow-hidden">
      <Navbar
        onToggleDeviceList={() => setIsDeviceListOpen(!isDeviceListOpen)}
        hasAlerts={devices.some(d => d.status === 'alert') || userSensors.some(d => d.status === 'alert')}
      />
      <main className="flex-1 flex overflow-hidden relative">
        <DeviceListPanel
          isOpen={isDeviceListOpen}
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onDeviceClick={handleMarkerClick}
          searchTerm={searchTerm}
          onSearch={(e) => setSearchTerm(e.target.value)}
          isLoading={isLoading.devices}
        />
        <section className="flex-1 h-full bg-slate-200 relative">
          <MapContainer
            ref={mapRef}
            center={undefined}
            zoom={undefined}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={true}
          >
          <MapViewController bounds={mapView.bounds} center={mapView.center} zoom={mapView.zoom} />
            <TileLayer
              key={activeMapLayer}
              url={MAP_LAYERS[activeMapLayer].url}
              attribution={MAP_LAYERS[activeMapLayer].attribution}
            />
            {[...devices, ...userSensors].map((device) => (
              <DeviceMarker key={device.deviceId} device={device} onMarkerClick={handleMarkerClick} />
            ))}
          </MapContainer>
          <MapControls
            activeMapLayer={activeMapLayer}
            onSetMapLayer={setActiveMapLayer}
            onZoomToFit={zoomToFitAllDevices}
          />
        </section>
        {selectedDevice && (
          <SensorDataPanel
            device={selectedDevice}
            sensorData={sensorData}
            isLoading={isLoading.sensorData}
            onClose={handleCloseDevicePanel}
            getStatusInfo={getStatusInfo}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;