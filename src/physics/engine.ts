export const calculateIntensity = (
  x: number, // Position on screen (meters, centered at 0)
  wavelength: number, // nm
  slitWidth: number,  // µm
  slitSeparation: number, // µm
  mode: 'single' | 'double' | 'grating',
  distanceToScreen: number, // m
  slitCount: number, // for grating
  sourcePos: { x: number, y: number } = { x: -300, y: 0 } // Default fallback
): number => {
  // 1. Calculate the incident angle theta_in from the source position
  // Source is at (sourcePos.x, sourcePos.y) microns relative to center of slits
  // x is negative (to the left). 
  // tan(theta_in) = y / |x|
  // Incident angle shifts the phase difference by d * sin(theta_in)
  
  const sp = sourcePos || { x: -300, y: 0 }; // Extra safety
  const sx = Math.abs(sp.x * 1e-6); // meters (positive distance)
  const sy = sp.y * 1e-6; // meters

  // If source is very close, we strictly need to do path differences from point source.
  // But for the Fraunhofer approx with a tilted incidence, we simulate the shift using theta_in.
  // path_diff = d * (sin(theta) - sin(theta_in))
  // Effective angle becomes (theta - theta_in).
  
  // Angle of incidence
  const thetaIn = Math.atan(sy / sx);
  const sinThetaIn = Math.sin(thetaIn);

  const theta = Math.atan(x / distanceToScreen);
  const sinTheta = Math.sin(theta);
  
  // Effective sinTheta for interference path difference
  // If source is moved up (y>0), the beam goes "down", so the central max shifts down (negative theta).
  // So effective path diff is d(sinTheta - sinThetaIn).
  // If theta = thetaIn, path diff = 0 -> central max.
  const effectiveSinTheta = sinTheta - sinThetaIn;
  
  // Convert units to meters
  const lambda = wavelength * 1e-9;
  const a = slitWidth * 1e-6;
  const d = slitSeparation * 1e-6;
  
  const PI = Math.PI;
  
  // Single Slit Diffraction Factor (Envelope)
  // The envelope also shifts because the diffraction pattern center aligns with the incident ray.
  // beta = (pi * a * effectiveSinTheta) / lambda
  const beta = (PI * a * effectiveSinTheta) / lambda;
  
  // Sinc function: (sin(beta)/beta)^2. Handle limit as beta -> 0
  let diffractionFactor = 1;
  if (Math.abs(beta) > 1e-6) {
    diffractionFactor = Math.pow(Math.sin(beta) / beta, 2);
  }

  if (mode === 'single') {
    return diffractionFactor;
  }

  // Interference Factor
  // alpha = (pi * d * effectiveSinTheta) / lambda
  const alpha = (PI * d * effectiveSinTheta) / lambda;

  let interferenceFactor = 1;

  if (mode === 'double') {
    // Cos^2(alpha)
    interferenceFactor = Math.pow(Math.cos(alpha), 2);
  } else if (mode === 'grating') {
    // (sin(N * alpha) / sin(alpha))^2  normalized by 1/N^2 usually to keep peak = 1, 
    // or just return raw relative intensity. 
    // Standard formula: I = I0 * (sin(N*alpha)/sin(alpha))^2
    // If alpha -> 0, limit is N^2.
    // So distinct peaks are very bright. We might want to normalize so max is 1 for visualization.
    // Let's normalize by dividing by N^2.
    
    // Check for alpha ~ m*pi (principal maxima)
    // If sin(alpha) is close to 0, use L'Hopital limit -> N^2
    
    // We can use a small epsilon or just check sin(alpha)
    
    // Normalized Intensity for grating: (1/N^2) * (...)
    
    const N = slitCount;
    if (Math.abs(Math.sin(alpha)) < 1e-6) {
      interferenceFactor = 1; // Limit is N^2, normalized by N^2 is 1
    } else {
      const num = Math.sin(N * alpha);
      const den = Math.sin(alpha);
      interferenceFactor = (1 / (N * N)) * Math.pow(num / den, 2);
    }
  }

  return diffractionFactor * interferenceFactor;
};
