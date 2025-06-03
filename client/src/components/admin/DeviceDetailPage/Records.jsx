import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Dnavbar';

const API_BASE_URL = 'http://localhost:5000/api';

const Records = () => {
  const { deviceId: paramDeviceId } = useParams();
  const { state } = useLocation();
  const rawDeviceId = paramDeviceId || state?.deviceId;
  const deviceId = rawDeviceId?.startsWith('user-') ? rawDeviceId.replace('user-', '') : rawDeviceId;
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [parameter, setParameter] = useState('ph');
  const [page, setPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    const fetchRecords = async () => {
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
        setRecords(response.data.sensorData || []);
        setFilteredRecords(response.data.sensorData || []);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err.response?.data?.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [deviceId]);

  useEffect(() => {
    const filtered = records.filter((record) => {
      const value = record[parameter]?.toString().toLowerCase();
      const timestamp = new Date(record.timestamp).toLocaleString().toLowerCase();
      return value?.includes(search.toLowerCase()) || timestamp.includes(search.toLowerCase());
    });
    setFilteredRecords(filtered);
    setPage(1);
  }, [search, parameter, records]);

  const paginatedRecords = filteredRecords.slice((page - 1) * recordsPerPage, page * recordsPerPage);

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
    <div className="min-h-screen bg-gray-100 mt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sensor Data Records</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">Search:</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by value or timestamp..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">Filter by Parameter:</label>
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
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Timestamp</th>
                  <th className="p-2 text-left">pH</th>
                  <th className="p-2 text-left">Turbidity (NTU)</th>
                  <th className="p-2 text-left">TDS (ppm)</th>
                  <th className="p-2 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((data, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(data.timestamp).toLocaleString()}</td>
                    <td className="p-2">{data.ph?.toFixed(1)}</td>
                    <td className="p-2">{data.turbidity?.toFixed(1)}</td>
                    <td className="p-2">{data.tds}</td>
                    <td className="p-2">[{data.latitude}, {data.longitude}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((prev) => (filteredRecords.length > page * recordsPerPage ? prev + 1 : prev))}
              disabled={filteredRecords.length <= page * recordsPerPage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;