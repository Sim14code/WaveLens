# WaveLens - Wave Interference & Diffraction Simulator

WaveLens is an interactive, browser-based physics visualization platform designed to help students and educators visualize wave phenomena. It provides real-time simulations of Single Slit Diffraction, Double Slit Interference, and Diffraction Gratings.

**Live Link**: https://wavelens.netlify.app/

## Features

- **Real-Time Parameter Control**: Manipulate Wavelength, Slit Width, and Slit Separation instantly.
- **Multi-Mode Simulation**: Switch between Single Slit, Double Slit, and Diffraction Grating modes.
- **Live Wave Animation**: Visualize wave propagation and interference using a high-performance particle/wave rendering engine.
- **Analytical Intensity Graph**: View the precise Intensity vs Position graph calculated from physical wave equations.

## Tech Stack

- **Frontend**: React + TypeScript
- **State Management**: Zustand
- **Visualization**: p5.js (Wave Animation)
- **Charting**: Chart.js (Intensity Graph)
- **Styling**: Tailwind CSS / CSS Modules
- **Build Tool**: Vite

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components/`: UI Components (Controls, Canvas, Graph)
- `src/physics/`: Physics physics calculation engine
- `src/store/`: Zustand state management
- `src/App.tsx`: Main application layout

## Physics Model

The simulator uses the standard wave intensity equations:
- **Single Slit**: $I(\theta) = I_0 (\text{sinc}(\beta))^2$
- **Double Slit**: $I(\theta) = I_{diff}(\theta) \cos^2(\alpha)$
- **Grating**: $I(\theta) = I_{diff}(\theta) (\frac{\sin(N\alpha)}{\sin(\alpha)})^2$

Where $\beta$ and $\alpha$ are functions of slit width $a$, separation $d$, and wavelength $\lambda$.
