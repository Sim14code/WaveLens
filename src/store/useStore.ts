import { create } from 'zustand';

export type SimulationMode = 'single' | 'double' | 'grating';

interface WaveParams {
  wavelength: number;     // in nanometers (nm)
  slitWidth: number;      // in micrometers (µm) "a"
  slitSeparation: number; // in micrometers (µm) "d"
  intensity: number;      // I0
  distanceToScreen: number; // in meters (m) "L" (usually fixed or interactive)
  slitCount: number;      // N (for grating)
  sourcePos: { x: number; y: number }; // x, y (microns) relative to center of slit screen
}

interface AppState {
  mode: SimulationMode;
  params: WaveParams;
  setMode: (mode: SimulationMode) => void;
  updateParams: (newParams: Partial<WaveParams>) => void;
  resetSourcePos: () => void;
  resetParams: () => void;
}

const defaultParams: Record<SimulationMode, WaveParams> = {
  single: {
    wavelength: 500, // Green light
    slitWidth: 10,
    slitSeparation: 0, // Not applicable
    intensity: 1.0,
    distanceToScreen: 1.0,
    slitCount: 1,
    sourcePos: { x: -20, y: 0 } // Start 20um left of slits
  },
  double: {
    wavelength: 500,
    slitWidth: 2, // Smaller slit for cleaner diffraction point-source look
    slitSeparation: 10, // Closer slits for visual clarity (20 fringes)
    intensity: 1.0,
    distanceToScreen: 1.0,
    slitCount: 2,
    sourcePos: { x: -20, y: 0 }
  },
  grating: {
    wavelength: 500,
    slitWidth: 2,
    slitSeparation: 10,
    intensity: 1.0,
    distanceToScreen: 1.0,
    slitCount: 5,
    sourcePos: { x: -20, y: 0 }
  }
};

export const useStore = create<AppState>((set) => ({
  mode: 'double',
  params: defaultParams['double'],

  setMode: (mode) => set((state) => ({ 
    mode, 
    // Optional: Reset params when switching modes to sensible defaults
    params: { ...state.params, ...defaultParams[mode] }
  })),

  updateParams: (newParams) => set((state) => ({
    params: { ...state.params, ...newParams }
  })),

  resetSourcePos: () => set((state) => ({
    params: { ...state.params, sourcePos: defaultParams[state.mode].sourcePos }
  })),

  resetParams: () => set((state) => ({
    params: defaultParams[state.mode]
  }))
}));
