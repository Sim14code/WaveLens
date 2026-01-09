import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useStore } from '../store/useStore';
import { calculateIntensity } from '../physics/engine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IntensityGraph: React.FC = () => {
  const { mode, params } = useStore();

  const data = useMemo(() => {
    // Generate data points
    // x range: -0.1m to 0.1m (10cm screen?) depending on distance
    // Let's assume view angle -5 to +5 degrees
    // L = params.distanceToScreen (m)
    // x_max = L * tan(5 deg) ~ L * 0.087
    
    const L = params.distanceToScreen;
    
    // We want mainly the central pattern.
    // Let's adapt range based on wavelength/slit width to ensure we see the main peaks
    // Beta = pi * a * sin(theta) / lambda. First zero at beta = pi => sin(theta) = lambda/a
    // if lambda=500e-9, a=10e-6 => ratio = 0.05.
    // So first min is at sin(theta) = 0.05.
    // If we show range up to 0.1, we see 2 lobes.
    
    const rangeLimit = (params.wavelength * 1e-9) / (params.slitWidth * 1e-6) * 4; 
    // Show 4 "lobes" width approx
    
    const X_MAX = L * rangeLimit * 1.5; // Meters
    const POINTS = 300;
    
    const labels = [];
    const intensities = [];
    
    for (let i = 0; i < POINTS; i++) {
        const x = -X_MAX + (2 * X_MAX * i) / (POINTS - 1);
        const I = calculateIntensity(
            x, 
            params.wavelength, 
            params.slitWidth,
            params.slitSeparation,  
            mode, 
            params.distanceToScreen, 
            params.slitCount,
            params.sourcePos || { x: -300, y: 0 }
        );
        labels.push(x.toFixed(3)); // Just labels
        intensities.push(I);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Intensity',
          data: intensities,
          borderColor: 'rgb(0, 240, 255)',
          backgroundColor: 'rgba(0, 240, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.1
        },
      ],
    };
  }, [params, mode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0 // Instant update
    },
    scales: {
      x: {
        display: false, // Hide x axis labels for cleanliness
        grid: {
            color: '#333'
        }
      },
      y: {
        display: false, // Normalize visuals
        min: 0,
        // max: 1.1, // Normalized
        grid: {
            color: '#333'
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Intensity Distribution vs Position',
        color: '#fff'
      },
    },
  };

  return (
    <div className="bg-surface p-4 rounded-lg shadow-lg h-64 border border-gray-800">
      <Line data={data} options={options} />
    </div>
  );
};

export default IntensityGraph;
