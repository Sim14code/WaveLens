import ControlPanel from './components/ControlPanel';
import WaveCanvas from './components/WaveCanvas';
import IntensityGraph from './components/IntensityGraph';

function App() {
  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          WaveLens
        </h1>
        <p className="text-gray-400 mt-2">Interactive Wave Interference & Diffraction Simulator</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Controls */}
        <div className="w-full lg:w-1/4 min-w-[300px]">
          <ControlPanel />
          
          <div className="mt-8 p-4 bg-surface rounded-lg text-sm text-gray-400">
            <h3 className="font-bold text-white mb-2">Instructions</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Select a mode (Single, Double, Multi-Slit)</li>
              <li>Adjust Slit Width (a) to see diffraction envelope.</li>
              <li>Adjust Wavelength (λ) to change color and spread.</li>
              <li>Adjust Slit Separation (d) to change interference fringe spacing.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top: Wave Animation */}
          <div className="relative">
            <h3 className="text-lg font-semibold mb-2 text-primary">Wave Propagation</h3>
            <WaveCanvas />
            <div className="absolute top-0 right-0 p-2 text-xs text-gray-500">
              Real-time Simulation
            </div>
          </div>

          {/* Bottom: Intensity Graph */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Intensity Profile</h3>
            <IntensityGraph />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
