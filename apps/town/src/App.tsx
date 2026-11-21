import { useEffect, useRef } from 'react';
import { useApp } from './state';
import { Engine, timeScale } from './world/engine';
import { Brand, Crosshair, Help, Intro, ModeSwitch, StreetBanner, TouchControls } from './ui/Chrome';
import { Card } from './ui/Card';
import { EraPanel } from './ui/EraPanel';
import { Explorer } from './ui/Explorer';
import { IdeasDialog } from './ui/Ideas';
import { RegionsDialog } from './ui/Regions';
import { Timeline } from './ui/Timeline';

function hexToCss(n: number) {
  return '#' + n.toString(16).padStart(6, '0');
}

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const eraColor = useApp((s) => timeScale.era(s.year).color);
  const mode = useApp((s) => s.mode);
  const street = useApp((s) => s.street);

  useEffect(() => {
    if (!canvas.current || !overlay.current) return;
    const engine = new Engine(canvas.current, overlay.current);
    return () => engine.dispose();
  }, []);

  return (
    <div className={`app mode-${mode}${street ? ' in-street' : ''}`} style={{ ['--era' as string]: hexToCss(eraColor) }}>
      <canvas ref={canvas} className="scene" />
      <div ref={overlay} className="overlay" />
      <div className="hud">
        <header className="top">
          <Brand />
          <ModeSwitch />
        </header>
        <StreetBanner />
        <div className="middle">
          <EraPanel />
          <Card />
        </div>
        <Intro />
        <TouchControls />
        <Timeline />
      </div>
      <Crosshair />
      <Explorer />
      <Help />
      <IdeasDialog />
      <RegionsDialog />
    </div>
  );
}
