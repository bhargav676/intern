import React from 'react';
import { motion } from 'framer-motion';

const DeviceListPanel = ({
  devices,
  selectedDevice,
  onDeviceClick,
  searchTerm,
  onSearch,
  isLoading,
  isMobile,
  onClose,
}) => {

  return (
    <motion.aside
      className={`
        w-72 bg-white border-r border-slate-200 flex flex-col shadow-lg
        fixed inset-y-0 left-0 z-30 h-full
        lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:z-auto
      `}
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="p-3 border-b border-slate-200">
        {isMobile ? (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-700">Devices</h2>
            {onClose && ( // Ensure onClose is passed before rendering button
              <button
                onClick={onClose}
                className="p-1 text-slate-500 hover:text-slate-700"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          // Desktop: Search bar directly in this top section
          <input
            type="text"
            placeholder="Search devices..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={onSearch}
          />
        )}
      </div>

      {/* Mobile-only Search Bar (if header structure differs significantly) */}
      {isMobile && (
        <div className="p-3 border-b border-slate-200">
          <input
            type="text"
            placeholder="Search devices..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={onSearch}
          />
        </div>
      )}

      {/* Device List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="p-3 text-sm text-slate-500">Loading devices...</p>}
        {!isLoading && devices.length === 0 && <p className="p-3 text-sm text-slate-500">No devices found.</p>}
        {!isLoading && devices.map(device => (
          <button
            key={device.deviceId}
            onClick={() => {
              onDeviceClick(device);
              if (isMobile && onClose) {
                onClose();
              }
            }}
            className={`w-full text-left px-3 py-3 text-sm hover:bg-slate-100 border-b border-slate-100 last:border-b-0 ${selectedDevice?.deviceId === device.deviceId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
          >
            <div className="flex items-center justify-between">
              <span>{device.name}</span>
              {device.status === 'alert' && <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
              {device.status === 'warning' && <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>}
            </div>
            <p className="text-xs text-slate-500">{device.deviceId}</p>
          </button>
        ))}
      </div>
    </motion.aside>
  );
};

export default DeviceListPanel;