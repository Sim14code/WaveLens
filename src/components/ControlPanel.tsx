import React from 'react';
import { useStore, SimulationMode } from '../store/useStore';

const ControlPanel: React.FC = () => {
  const { mode, params, setMode, updateParams, resetSourcePos } = useStore();

  return (
    <div className="bg-surface p-4 rounded-lg shadow-lg text-white w-full max-w-sm">
      <h2 className="text-xl font-bold mb-4 text-primary">Controls</h2>

      {/* Mode Switcher */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-400">Mode</label>
        <div className="flex bg-dark rounded p-1">
          {(['single', 'double', 'grating'] as SimulationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1 px-2 rounded capitalize text-sm transition-colors ${
                mode === m ? 'bg-primary text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'grating' ? 'Multi-Slit' : `${m} Slit`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Wavelength Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm">Wavelength (λ)</label>
            <span className="text-sm text-primary">{params.wavelength} nm</span>
          </div>
          <input
            type="range"
            min="380"
            max="750"
            value={params.wavelength}
            onChange={(e) => updateParams({ wavelength: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
                background: `linear-gradient(to right, #4b0082, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000)`
            }}
          />
        </div>

        {/* Slit Width Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm">Slit Width (a)</label>
            <span className="text-sm text-primary">{params.slitWidth} µm</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={params.slitWidth}
            onChange={(e) => updateParams({ slitWidth: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
          />
        </div>

        {/* Slit Separation - Single slit doesn't use this */}
        {mode !== 'single' && (
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm">Slit Separation (d)</label>
              <span className="text-sm text-primary">{params.slitSeparation} µm</span>
            </div>
            <input
              type="range"
              min={params.slitWidth + 2} // Must be > slitWidth usually
              max="200"
              value={params.slitSeparation}
              onChange={(e) => updateParams({ slitSeparation: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>
        )}
        
        {/* Slit Count - Only for Grating */}
        {mode === 'grating' && (
          <div>
             <div className="flex justify-between mb-1">
              <label className="text-sm">Slit Count (N)</label>
              <span className="text-sm text-primary">{params.slitCount}</span>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={params.slitCount}
              onChange={(e) => updateParams({ slitCount: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>
        )}

        {/* Source Reset Button */}
        <div className="pt-2 border-t border-gray-700">
           <button
             onClick={resetSourcePos}
             className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded transition-colors text-gray-300"
           >
            Reset Source Position
           </button>
        </div>
      </div>
    </div>
  );
};


export default ControlPanel;
