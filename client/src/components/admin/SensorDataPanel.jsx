import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconWrapper, PhIcon, TurbidityIcon, TdsIcon, ClockIcon, CloseIcon } from './Icons';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const API_BASE_URL = 'http://localhost:5000/api';

const SensorDataItem = ({ icon, label, value, valueColor, bgColor, onClick }) => (
  <div
    className={`flex items-center p-3.5 rounded-md shadow-md ${bgColor} cursor-pointer hover:bg-black/70`}
    onClick={onClick}
  >
    <IconWrapper colorClass={valueColor} bgColorClass="bg-black/50 rounded-full" p={3}>
      {icon}
    </IconWrapper>
    <div className="ml-3">
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

const SensorDataPanel = ({ device, sensorData, isLoading, onClose, getStatusInfo }) => {
  const [phHistory, setPhHistory] = useState([]);
  const [isPhLoading, setIsPhLoading] = useState(false);
  const [phError, setPhError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('ph'); // Default to pH

  useEffect(() => {
    const fetchPhHistory = async () => {
      if (!device) return;
      setIsPhLoading(true);
      setPhError(null);
      try {
        let response;
        if (device.type === 'user') {
          response = await axios.get(`${API_BASE_URL}/admin/user-sensor-data`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { userId: device.userId }
          });
          setPhHistory(response.data || []);
        } else {
          response = await axios.get(`${API_BASE_URL}/admin/devices/${device.deviceId}/ph-history`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setPhHistory(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        setPhHistory([]);
        setPhError('Unable to fetch history data. Please try again later.');
      } finally {
        setIsPhLoading(false);
      }
    };

    fetchPhHistory();
  }, [device]);

  // Define ranges for each metric
  const ranges = {
    ph: {
      safe: { min: 6.5, max: 8.5, label: 'Safe (6.5-8.5)' },
      warning: [
        { min: 6.0, max: 6.5 },
        { min: 8.5, max: 9.0 },
      ],
      warningLabel: 'Warning (6.0-6.5 or 8.5-9.0)',
      alert: { min: 0, max: 6.0, min2: 9.0, max2: Infinity, label: 'Alert (<6.0 or >9.0)' },
    },
    turbidity: {
      safe: { min: 0, max: 5, label: 'Safe (<5 NTU)' },
      warning: [{ min: 5, max: 10 }],
      warningLabel: 'Warning (5-10 NTU)',
      alert: { min: 10, max: Infinity, label: 'Alert (>10 NTU)' },
    },
    tds: {
      safe: { min: 0, max: 500, label: 'Safe (<500 ppm)' },
      warning: [{ min: 500, max: 1000 }],
      warningLabel: 'Warning (500-1000 ppm)',
      alert: { min: 1000, max: Infinity, label: 'Alert (>1000 ppm)' },
    },
  };

  // Calculate data for the selected metric
  const values = phHistory
    .map(data => data[selectedMetric])
    .filter(val => val !== null && val !== undefined);
  const metricRanges = ranges[selectedMetric];
  const counts = {
    safe: values.filter(val => val >= metricRanges.safe.min && val <= metricRanges.safe.max).length,
    warning: values.filter(val =>
      metricRanges.warning.some(range => val >= range.min && val <= range.max)
    ).length,
    alert: values.filter(val =>
      (val >= metricRanges.alert.min && val <= metricRanges.alert.max) ||
      (metricRanges.alert.min2 && val >= metricRanges.alert.min2 && val <= metricRanges.alert.max2)
    ).length,
  };

  const chartData = {
    labels: [
      metricRanges.safe.label,
      metricRanges.warningLabel,
      metricRanges.alert.label,
    ],
    datasets: [
      {
        data: [counts.safe, counts.warning, counts.alert].filter(val => val > 0),
        backgroundColor: [
          'rgba(22, 163, 74, 0.8)', // Green for Safe
          'rgba(202, 138, 4, 0.8)', // Yellow for Warning
          'rgba(220, 38, 38, 0.8)', // Red for Alert
        ],
        borderColor: ['#000000', '#000000', '#000000'],
        borderWidth: 1,
        offset: [20, 20, 20], // Explode effect
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -45,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start', // Align legend to the left
        labels: {
          color: '#ffffff', // White text for legend
          font: { size: 12 },
          padding: 10,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: false, // Use rectangles instead of circles
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor[i],
              lineWidth: data.datasets[0].borderWidth,
              hidden: !chart.getDataVisibility(i),
              index: i,
              fontColor: '#ffffff', // Explicitly set text color to white
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} readings`,
        },
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { weight: '600', size: 12 },
        anchor: 'end',
        align: 'end',
        offset: 10,
        formatter: (value, context) => context.chart.data.labels[context.dataIndex],
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  };

  return (
    <motion.aside
      className="w-80 bg-[#000000CC] border-l mt-[90px] mr-5 border-white/20 flex flex-col fixed inset-y-0 right-0 z-20 backdrop-blur-sm"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <style>
        {`
          .chart-container {
            perspective: 1000px;
            transform: rotateX(-15deg);
          }
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          /* Ensure legend text is white */
          .chart-legend span, .chart-legend div {
            color: #ffffff !important; /* Force white text */
          }
        `}
      </style>
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white truncate">{device.name}</h2>
        <button
          onClick={onClose}
          className="p-1 text-white/70 rounded-full hover:text-white hover:bg-red-800/50"
          aria-label="Close panel"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-white/70 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!isLoading && sensorData && (
          <>
            <SensorDataItem
              icon={<PhIcon />}
              label="pH Level"
              value={getStatusInfo(sensorData.ph, 'ph').text}
              valueColor={getStatusInfo(sensorData.ph, 'ph').color}
              bgColor="bg-black/50"
              onClick={() => setSelectedMetric('ph')}
            />
            <SensorDataItem
              icon={<TurbidityIcon />}
              label="Turbidity"
              value={getStatusInfo(sensorData.turbidity, 'turbidity').text}
              valueColor={getStatusInfo(sensorData.turbidity, 'turbidity').color}
              bgColor="bg-black/50"
              onClick={() => setSelectedMetric('turbidity')}
            />
            <SensorDataItem
              icon={<TdsIcon />}
              label="TDS"
              value={getStatusInfo(sensorData.tds, 'tds').text}
              valueColor={getStatusInfo(sensorData.tds, 'tds').color}
              bgColor="bg-black/50"
              onClick={() => setSelectedMetric('tds')}
            />
            <div className="flex items-center p-3.5 rounded-md shadow-md bg-black/50">
              <IconWrapper colorClass="text-white/80" bgColorClass="bg-black/50 rounded-full" p={3}>
                <ClockIcon />
              </IconWrapper>
              <div className="ml-3">
                <p className="text-sm font-medium text-white/80">Last Updated</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(sensorData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
        {!isLoading && !sensorData && (
          <p className="text-center text-sm text-white/70 py-6">No sensor data available for this device.</p>
        )}
        <div className="p-3.5 rounded-md shadow-md bg-black/50">
          <h3 className="text-sm font-medium text-white/80 mb-2">{selectedMetric.toUpperCase()} Value Distribution</h3><br/>
          {isPhLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-4 border-white/70 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : phError ? (
            <p className="text-center text-sm text-white/70 py-4">{phError}</p>
          ) : phHistory.length > 0 && chartData.datasets[0].data.length > 0 ? (
            <div className="h-48 chart-container">
              <Doughnut data={chartData} options={chartOptions} /><br/>
            </div>
          ) : (
            <p className="text-center text-sm text-white/70 py-4">No {selectedMetric.toUpperCase()} history data available.</p>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default React.memo(SensorDataPanel);