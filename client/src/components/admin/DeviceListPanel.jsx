import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeviceItem = ({ device, selectedDevice, onDeviceClick, onClose }) => {
  const navigate = useNavigate();

  // Debug: Log the device object and deviceId
  console.log('DeviceItem device:', device);
  console.log('DeviceItem deviceId:', device.deviceId);

  const handleUserClick = () => {
  const deviceIdRaw = device.deviceId;
  const actualDeviceId = deviceIdRaw.startsWith('user-')
    ? deviceIdRaw.replace('user-', '')
    : deviceIdRaw;

  console.log('Navigating to DeviceDetailsPage with deviceId:', actualDeviceId);

  if (!actualDeviceId) {
    console.error('Device ID is invalid:', device.deviceId);
    return;
  }

  onDeviceClick(device);

  navigate(`/device-detail/${actualDeviceId}`, {
    state: { deviceId: actualDeviceId },
  });

  if (onClose) onClose();
};


  return (
    <motion.div
      className={`flex items-center p-4 rounded-lg shadow-lg bg-[rgba(0,0,0,0.5)] ${
        selectedDevice?.deviceId === device.deviceId ? 'border border-[rgba(96,165,250,0.5)]' : ''
      } cursor-pointer transition-all duration-200 ease-in-out`}
      onClick={handleUserClick}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.7)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-1 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[rgba(96,165,250,0.2)] flex items-center justify-center">
          <span className="text-blue-300 font-medium">
            {device.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-medium text-white truncate">{device.name}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-white/60" />
    </motion.div>
  );
};

const DeviceListPanel = ({
  devices,
  selectedDevice,
  onDeviceClick,
  searchTerm,
  onSearch,
  isLoading,
  onClose,
}) => {
  // Debug: Log the devices array
  console.log('DeviceListPanel devices:', devices);

  return (
    <motion.aside
      className="w-72 bg-[rgba(0,0,0,0.8)] border-r ml-5 mt-3 border-[rgba(255,255,255,0.2)] flex flex-col fixed top-20 left-0 h-[calc(100vh-5rem)] z-30 backdrop-blur-md rounded-r-xl shadow-2xl"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 border-b border-[rgba(255,255,255,0.2)] flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Devices</h2>
        <button
          onClick={onClose}
          className="p-2 text-white/70 rounded-full hover:text-white hover:bg-[rgba(153,27,27,0.6)] transition-colors duration-200"
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 border-b border-[rgba(255,255,255,0.2)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search devices..."
            className="w-full pl-11 pr-4 py-2.5 bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.3)] rounded-lg text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-[rgba(96,165,250,1)] focus:border-[rgba(96,165,250,1)] transition-all duration-200"
            value={searchTerm}
            onChange={onSearch}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-sm text-white/80 animate-pulse">Loading devices...</p>}
        {!isLoading && devices.length === 0 && (
          <p className="text-sm text-white/80 text-center">No devices found.</p>
        )}
        {!isLoading &&
          devices.map((device) => (
            <DeviceItem
              key={device.deviceId}
              device={device}
              selectedDevice={selectedDevice}
              onDeviceClick={onDeviceClick}
              onClose={onClose}
            />
          ))}
      </div>
    </motion.aside>
  );
};

export default DeviceListPanel;