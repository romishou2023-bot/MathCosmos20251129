import React, { useState, useEffect } from 'react';
import { AppState, ShapeType, THEMES, ColorTheme } from '../types';

interface UIOverlayProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  fps: number;
}

// Helper to get enum keys
const shapeKeys = Object.values(ShapeType);

const UIOverlay: React.FC<UIOverlayProps> = ({ state, setState, fps }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleShapeChange = (shape: ShapeType) => {
    setState(prev => ({ ...prev, currentShape: shape }));
  };

  const handleThemeChange = (themeName: string) => {
    const theme = THEMES.find(t => t.name === themeName) || THEMES[0];
    setState(prev => ({ ...prev, theme }));
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, zoom: parseInt(e.target.value) }));
  };

  return (
    <>
      {/* Main HUD Panel - Top Left */}
      <div className={`absolute top-4 left-4 z-10 w-80 bg-black/80 border border-cyan-500/50 rounded-lg backdrop-blur-md text-cyan-500 font-mono transition-all duration-300 p-4 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-cyan-500/30 pb-2">
            <h1 className="text-xl font-bold tracking-widest uppercase text-cyan-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                MathCosmos
            </h1>
            <div className="text-xs text-cyan-300">SYS.READY</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
            <div className="bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
                <span className="block text-cyan-400 opacity-70">FPS</span>
                <span className="text-lg font-bold text-white">{fps}</span>
            </div>
            <div className="bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
                <span className="block text-cyan-400 opacity-70">PARTICLES</span>
                <span className="text-lg font-bold text-white">{state.particleCount.toLocaleString()}</span>
            </div>
            <div className="col-span-2 bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
                <span className="block text-cyan-400 opacity-70">CURRENT TOPOLOGY</span>
                <span className="text-sm font-bold text-white uppercase truncate">{state.currentShape}</span>
            </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
            
            {/* Zoom Slider */}
            <div>
                <label className="block text-xs uppercase mb-1 tracking-wider text-cyan-300">Optical Zoom</label>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={state.zoom} 
                    onChange={handleZoom}
                    className="w-full h-1 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
            </div>

            {/* Theme Selector */}
            <div>
                <label className="block text-xs uppercase mb-1 tracking-wider text-cyan-300">Spectral Theme</label>
                <select 
                    value={state.theme.name}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/50 text-cyan-100 text-sm rounded p-1 focus:outline-none focus:border-cyan-400"
                >
                    {THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
            </div>

             {/* Shapes Grid */}
             <div>
                <label className="block text-xs uppercase mb-2 tracking-wider text-cyan-300">Select Structure</label>
                <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {shapeKeys.map((shape) => (
                        <button
                            key={shape}
                            onClick={() => handleShapeChange(shape)}
                            className={`text-xs text-left px-2 py-2 rounded border transition-all duration-200 ${
                                state.currentShape === shape 
                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                                : 'bg-transparent border-cyan-900/50 text-cyan-600 hover:bg-cyan-900/30 hover:text-cyan-300'
                            }`}
                        >
                            {shape}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-4 left-4 z-20 p-2 bg-black/50 border border-cyan-500/50 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all backdrop-blur-sm"
        style={{ opacity: isMenuOpen ? 0 : 1, pointerEvents: isMenuOpen ? 'none' : 'auto' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Footer / Credits */}
      <div className="absolute bottom-4 right-4 text-right pointer-events-none">
        <div className="text-[10px] text-cyan-900/80 font-mono">
            MATH.COSMOS.VISUALIZER v1.0 <br />
            RENDERING ENGINE: THREE.R3F
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5); 
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8); 
        }
      `}</style>
    </>
  );
};

export default UIOverlay;
