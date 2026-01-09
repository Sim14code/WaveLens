import React from 'react';
import Sketch from 'react-p5';
import { useStore } from '../store/useStore';

const WaveCanvas: React.FC = () => {
  const { mode, params, updateParams } = useStore();
  
  // Interaction State
  const isDragging = React.useRef(false);

  // Helper to get source positions
  const getSources = (p: typeof params, m: typeof mode) => {
    const sources: number[] = []; 
    // Convert physical units to simulation pixels
    // Let's pick a scale: 50um = 100 pixels => 1um = 2px
    const scale = 20; 

    // Safety check for params
    if (!p) return { sources, scale };
    
    // Default fallbacks to prevent NaN/Undefined
    const slitWidth = p.slitWidth || 2;
    const slitSeparation = p.slitSeparation || 10;
    const slitCount = p.slitCount || 2;

    const w = slitWidth * scale;
    const sep = slitSeparation * scale;

    const addSlit = (centerY: number, width: number, count: number) => {
      // Ensure width is valid
      const safeWidth = width || 10;
      const step = safeWidth / (count + 1);
      const start = centerY - safeWidth / 2 + step;
      for (let i = 0; i < count; i++) {
        sources.push(start + i * step);
      }
    };

    if (m === 'single') {
      addSlit(0, w, 20); 
    } else if (m === 'double') {
      addSlit(-sep / 2, w, 10);
      addSlit(sep / 2, w, 10);
    } else if (m === 'grating') {
        const N = slitCount;
        const totalH = (N - 1) * sep;
        let startY = -totalH / 2;
        for (let i = 0; i < N; i++) {
            addSlit(startY + i * sep, w, 5); 
        }
    }
    return { sources, scale };
  };

  const setup = (p5: any, canvasParentRef: Element) => {
    // Prevent duplicate canvases on HMR / Strict Mode re-renders
    canvasParentRef.innerHTML = '';
    // Calculate width based on parent container to match frontend layout
    const parentWidth = canvasParentRef.clientWidth;
    p5.createCanvas(parentWidth || 800, 400).parent(canvasParentRef);
    p5.frameRate(30);
  };

  const mousePressed = (p5: any) => {
    const { scale } = getSources(params, mode);
    // const width = p5.width;
    const height = p5.height;
    const centerY = height / 2;
    const slitScreenX = p5.width / 2;
    
    const sp = params.sourcePos || { x: -20, y: 0 };

    // Calculate Source Pixel Position
    const sourcePixelX = slitScreenX + sp.x * scale; // x is negative
    const sourcePixelY = centerY + sp.y * scale;

    const d = p5.dist(p5.mouseX, p5.mouseY, sourcePixelX, sourcePixelY);
    if (d < 20) {
        isDragging.current = true;
    }
  };

  const mouseDragged = (p5: any) => {
    if (isDragging.current) {
        const width = p5.width;
        const height = p5.height;
        const centerY = height / 2;
        const slitScreenX = width / 2;
        const { scale } = getSources(params, mode);

        // Convert back to physical units (microns)
        // x = (pixelX - slitScreenX) / scale
        // y = (pixelY - centerY) / scale
        
        let newPixelX = p5.mouseX;
        let newPixelY = p5.mouseY;

        // Constraint: Must be to the left of the slit screen
        if (newPixelX > slitScreenX - 20) newPixelX = slitScreenX - 20;
        if (newPixelX < 10) newPixelX = 10;
        if (newPixelY < 10) newPixelY = 10;
        if (newPixelY > height - 10) newPixelY = height - 10;

        const newX = (newPixelX - slitScreenX) / scale; // will be negative
        const newY = (newPixelY - centerY) / scale;

        updateParams({ sourcePos: { x: newX, y: newY } });
    }
  };

  const mouseReleased = () => {
    isDragging.current = false;
  };

  const draw = (p5: any) => {
    p5.background(0);
    
    // Cache constants
    const { sources, scale } = getSources(params, mode);
    const wavelengthPx = (params.wavelength / 1000) * scale; // nm -> um -> px
    
    // Optimization: Low res render
    const res = 3; 
    const k = 2 * Math.PI / (wavelengthPx || 10); // Prevention against div/0
    // Slow down time for visualization
    const t = p5.millis() / 100 * -1; 
    
    const width = p5.width;
    const height = p5.height;

    // Safety check for critical dimensions
    if (width === 0 || height === 0) return;

    // Remove loadPixels if only using shapes
    // p5.loadPixels();
    
    p5.noStroke();
    
    // Center Y on canvas
    const centerY = height / 2;
    // Slit Screen is now in the middle of simulation window.
    const slitScreenX = width / 2;
    
    // PRIMARY SOURCE POSITION
    // Safe access with fallback if store hasn't updated yet
    const sp = params.sourcePos || { x: -20, y: 0 };
    const primarySourceX = slitScreenX + sp.x * scale; // x is negative
    const primarySourceY = centerY + sp.y * scale;
    
    // Draw waves
    for (let x = 0; x < width; x += res) {
      if (x > width) continue; 

      for (let y = 0; y < height; y += res) {
        let amplitude = 0;
        
        if (x < slitScreenX) {
          // Incident Wave from primary source (Point source)
          const dx = x - primarySourceX;
          const dy = y - primarySourceY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const decay = 1 / Math.sqrt(dist + 1);
          amplitude = Math.sin(k * dist - t) * decay * 2; 
        } else {
            // ...existing secondary wave logic...
            // Secondary sources need a PHASE SHIFT based on their distance from Primary Source
            // The secondary sources (slits) are at x=slitScreenX, y=(centerY + s)
            // Distance from Primary (PS) to Slit (S):
            // r_ps = dist(primarySourceX, primarySourceY, slitScreenX, centerY+s)
            // Phase at S = k * r_ps - wt
            // So we add k*r_ps to the wave phase emitted from S.
          
          for (let s of sources) {
              const slitY = centerY + s;
              // Distance from Primary Source to this specific Huygens source point
              const distFromSource = Math.sqrt(
                  Math.pow(slitScreenX - primarySourceX, 2) + 
                  Math.pow(slitY - primarySourceY, 2)
              ); // In pixels
              
              // Phase shift due to travel from source to slit
              const phaseShift = k * distFromSource;

              const dy = y - slitY;
              const dx = x - slitScreenX;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const decay = 1 / Math.sqrt(dist + 1); 
              
              // Wave: sin(k*r - wt + phaseShift)
              amplitude += Math.sin(k * dist - t + phaseShift) * decay;
          }
        }
        
        const val = amplitude * 100;
        let r, g, b;
        const intensity = Math.min(255, Math.abs(val));
        
        if (val > 0) {
            r = 0; g = intensity; b = intensity;
        } else {
            r = intensity; g = 0; b = intensity;
        }
        
        p5.fill(r, g, b);
        p5.rect(x, y, res, res);
      }
    }
    
    // Draw Slit Screen (Baffle)
    p5.fill(30); 
    p5.rect(slitScreenX - 4, 0, 8, height);
    
    // Draw the baffle in blocks to leave hole gaps (slits)
    p5.fill(20); 
    const wPx = params.slitWidth * scale;
    
    const drawBaffleSegment = (y: number, h: number) => {
        if (h <= 0) return;
        p5.fill(40);
        p5.rect(slitScreenX - 4, y, 8, h);
        // Highlight edges
        p5.stroke(60);
        p5.line(slitScreenX - 4, y, slitScreenX + 4, y);
        p5.line(slitScreenX - 4, y + h, slitScreenX + 4, y + h);
        p5.noStroke();
    };

    const drawSlitHighlight = (slitY: number) => {
        p5.fill(255, 255, 255, 50);
        p5.rect(slitScreenX - 4, slitY - wPx/2, 8, wPx);
    };

    if (mode === 'single') {
        drawBaffleSegment(0, centerY - wPx/2);
        drawBaffleSegment(centerY + wPx/2, height - (centerY + wPx/2));
        drawSlitHighlight(centerY);
    } else {
        const sepPx = params.slitSeparation * scale;
        const count = mode === 'double' ? 2 : params.slitCount;
        const totalHeight = (count - 1) * sepPx;
        const startY = centerY - totalHeight / 2;

        drawBaffleSegment(0, startY - wPx/2); // Top part
        drawSlitHighlight(startY);

        for(let i=0; i<count-1; i++) {
            const gapStart = startY + i*sepPx + wPx/2;
            const gapEnd = startY + (i+1)*sepPx - wPx/2;
            drawBaffleSegment(gapStart, gapEnd - gapStart);
            drawSlitHighlight(startY + (i+1)*sepPx);
        }
        const lastGapEnd = startY + (count-1)*sepPx + wPx/2;
        drawBaffleSegment(lastGapEnd, height - lastGapEnd); // Bottom part
    }

    // Draw Primary Source - Now interactive
    p5.fill(255, 255, 0);
    p5.circle(primarySourceX, primarySourceY, 15);
    // Glow/Drag Handle
    if (isDragging.current) {
        p5.fill(255, 255, 0, 150);
        p5.circle(primarySourceX, primarySourceY, 30);
    } else {
        p5.fill(255, 255, 0, 50);
        p5.circle(primarySourceX, primarySourceY, 25);
    }
    
    p5.fill(255, 255, 0);
    p5.textSize(12);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text("Primary Source", primarySourceX, primarySourceY - 30);
    p5.fill(200);
    p5.textSize(10);
    p5.text("(Drag to move)", primarySourceX, primarySourceY - 15);

    // Draw Labels for Slits
    p5.fill(255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text("Slit Screen", slitScreenX, 15);
    
    // Draw Screen Line (Observation)
    p5.stroke(0, 240, 255); // Primary color for the screen
    p5.strokeWeight(5); // Thicker line effectively covering the edge
    p5.line(width - 2, 0, width - 2, height);
    p5.noStroke();
    p5.fill(0, 240, 255);
    p5.textSize(14);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);
    p5.text("Observation Screen", width - 15, height - 10);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-800 w-full" style={{ touchAction: 'none' }}>
      <Sketch 
        setup={setup} 
        draw={draw} 
        mousePressed={mousePressed}
        mouseDragged={mouseDragged}
        mouseReleased={mouseReleased}
      />
    </div>
  );
};

export default WaveCanvas;
