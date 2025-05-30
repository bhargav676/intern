import React from 'react';
import { motion } from 'framer-motion';
import { IconWrapper, PhIcon, TurbidityIcon, TdsIcon, ClockIcon, CloseIcon } from './Icons';

const SensorDataItem = ({ icon, label, value, valueColor, bgColor }) => (
  <div className={`flex items-center p-3.5 rounded-xl shadow-md ${bgColor} border border-white/30`}>
    <IconWrapper colorClass={valueColor} bgColorClass="bg-white/80 shadow-lg" p="p-2.5">
      {icon}
    </IconWrapper>
    <div className="ml-2">
      <p className="text-xs text-slate-700 font-medium">{label}</p>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

const SensorDataPanel = ({ device, sensorData, isLoading, onClose, getStatusInfo }) => {
  return (
    <motion.aside
      className="w-full md:w-80 lg:w-96 frosted-glass-light border-l border-white/20 flex flex-col fixed lg:relative inset-y-0 right-0 z-20 shadow-2xl lg:shadow-lg"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
    >
      <div className="p-4 border-b border-white/20 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 truncate pr-2">{device.name}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            <CloseIcon className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">ID: {device.deviceId}</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {isLoading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}
        {!isLoading && sensorData && (
          <>
            <SensorDataItem
              icon={<PhIcon />}
              label="pH Level"
              value={getStatusInfo(sensorData.ph, 'ph').text}
              valueColor={getStatusInfo(sensorData.ph, 'ph').color}
              bgColor={getStatusInfo(sensorData.ph, 'ph').bgColor}
            />
            <SensorDataItem
              icon={<TurbidityIcon />}
              label="Turbidity"
              value={getStatusInfo(sensorData.turbidity, 'turbidity').text}
              valueColor={getStatusInfo(sensorData.turbidity, 'turbidity').color}
              bgColor={getStatusInfo(sensorData.turbidity, 'turbidity').bgColor}
            />
            <SensorDataItem
              icon={<TdsIcon />}
              label="TDS"
              value={getStatusInfo(sensorData.tds, 'tds').text}
              valueColor={getStatusInfo(sensorData.tds, 'tds').color}
              bgColor={getStatusInfo(sensorData.tds, 'tds').bgColor}
            />
            <div className={`flex items-center p-3.5 rounded-xl shadow-md bg-slate-100/80 border border-white/30`}>
              <IconWrapper colorClass="text-slate-600" bgColorClass="bg-white/80 shadow-lg" p="p-2.5"><ClockIcon /></IconWrapper>
              <div className="ml-2">
                <p className="text-xs text-slate-600 font-medium">Last Reading</p>
                <p className="text-sm font-semibold text-slate-700">{new Date(sensorData.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </>
        )}
        {!isLoading && !sensorData && <p className="text-center text-sm text-slate-500 py-10">No sensor data available for this device.</p>}
      </div>
    </motion.aside>
  );
};

export default SensorDataPanel;