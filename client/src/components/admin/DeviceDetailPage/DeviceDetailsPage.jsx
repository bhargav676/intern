import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Navbar from './Dnavbar';

const API_BASE_URL = 'http://localhost:5000/api';

const DeviceDetailsPage = () => {
  const { deviceId: paramDeviceId } = useParams();
  const { state } = useLocation();
  const rawDeviceId = paramDeviceId || state?.deviceId;
  const deviceId = rawDeviceId?.startsWith('user-') ? rawDeviceId.replace('user-', '') : rawDeviceId;
  const navigate = useNavigate();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameter, setParameter] = useState('ph');

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
      } catch (err) {
        console.error('Error fetching device data:', err);
        setError(err.response?.data?.message || 'Failed to load device data');
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [deviceId]);

  const chartData = {
    labels: deviceData?.sensorData?.map((data) => new Date(data.timestamp).toLocaleString()) || [],
    datasets: [
      {
        label: parameter.toUpperCase(),
        data: deviceData?.sensorData?.map((data) => data[parameter]) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mt-20 mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Device Details: {deviceData?.name || deviceId}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Select Parameter:</label>
            <select
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ph">pH</option>
              <option value="turbidity">Turbidity</option>
              <option value="tds">TDS</option>
            </select>
          </div>
          <div className="mb-6 h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Device ID:</span> {rawDeviceId}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Device Type:</span>{' '}
            {deviceData?.deviceType === 'user' ? 'User Sensor' : 'Admin Device'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Name:</span> {deviceData?.name || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsPage;