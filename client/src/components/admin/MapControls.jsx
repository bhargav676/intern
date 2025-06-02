import React from 'react';
import { LayersIcon, ExpandIcon, SatelliteIcon } from './Icons';

const MapControls = ({ activeMapLayer, onSetMapLayer, onZoomToFit }) => {
  return (
    <div id="mapcontrols" className="absolute top-3 right-3 z-[1000] space-y-2 bg-white p-1.5 rounded-lg shadow-lg">
      <button
        title="Streets View"
        onClick={() => onSetMapLayer('streets')}
        className={`p-2 rounded hover:bg-slate-100 ${activeMapLayer === 'streets' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
      >
        <LayersIcon className="h-5 w-5" />
      </button>
      <button
        title="Satellite/Hybrid View"
        onClick={() => onSetMapLayer('hybrid')}
        className={`p-2 rounded hover:bg-slate-100 ${activeMapLayer === 'hybrid' ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
      >
        <SatelliteIcon className="h-5 w-5" />
      </button>
      <button
        title="Zoom to Fit All Devices"
        onClick={onZoomToFit}
        className="p-2 rounded hover:bg-slate-100 text-slate-600"
      >
        <ExpandIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MapControls;