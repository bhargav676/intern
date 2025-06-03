import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import Navbar from './Dnavbar';

const API_BASE_URL = 'http://localhost:5000/api';

const Download = () => {
  const { deviceId: paramDeviceId } = useParams();
  const { state } = useLocation();
  const rawDeviceId = paramDeviceId || state?.deviceId;
  const deviceId = rawDeviceId?.startsWith('user-') ? rawDeviceId.replace('user-', '') : rawDeviceId;
  const navigate = useNavigate();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!deviceId) {
        setError('Device ID is missing.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id; // Extract userId from JWT
        const response = await axios.get(`${API_BASE_URL}/admin/user-sensor-data/${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId }, // Include userId as query param
        });
        setDeviceData(response.data);
        setFilteredData(response.data.sensorData || []);
      } catch (err) {
        console.error('Error fetching device data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [deviceId]);

  const filterDataByDate = () => {
    if (!startDate || !endDate || !deviceData?.sensorData) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = deviceData.sensorData.filter((data) => {
      const dataDate = new Date(data.timestamp);
      return dataDate >= start && dataDate <= end;
    });
    setFilteredData(filtered);
  };

  const csvData = filteredData.map((data) => ({
    Timestamp: new Date(data.timestamp).toLocaleString(),
    pH: data.ph?.toFixed(1),
    Turbidity: data.turbidity?.toFixed(1),
    TDS: data.tds,
    Latitude: data.latitude,
    Longitude: data.longitude,
  }));

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 ">
        <div className="text-center">
          <p className="text-lg text-red-500">{error}</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Download Sensor Data</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={filterDataByDate}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Filter Data
            </button>
            <CSVLink
              data={csvData}
              filename={`device_data_${deviceId}_${format(new Date(), 'yyyyMMdd')}.csv`}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              Download CSV
            </CSVLink>
          </div>
          <p className="text-gray-600">
            {filteredData.length} records ready for download.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Download;