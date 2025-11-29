import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { AppState, ShapeType, THEMES } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentShape: ShapeType.Sierpinski,
    theme: THEMES[0], // Deep Space
    zoom: 50,
    particleCount: 0,
    brightness: 2.5,
  });

  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Simple FPS counter
  useEffect(() => {
    const loop = requestAnimationFrame(function tick() {
        