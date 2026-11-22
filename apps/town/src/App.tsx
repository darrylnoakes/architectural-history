import { useEffect, useRef } from 'react';
import { useApp } from './state';
import { Engine } from './world/engine';
import { REGIONS, scaleOf } from './regions';
import { Brand, Crosshair, Help, Intro, ModeSwitch, SlowNotice, StreetBanner, TouchControls } from './ui/Chrome';
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
  const eraColor = useApp((s) => scaleOf(REGIONS[s.regionId]).era(s.year).color);
  const mode = useApp((s) => s.mode);
  const street = useApp((s) => s.street);
  const quality = useApp((s) => s.quality);

  useEffect(() => {
    if (!canvas.current || !overlay.current) return;
    const engine = new Engine(canvas.current, overlay.current);
    return () => engine.dispose();
    // a change of quality needs a new renderer, and so a new canvas
  }, [quality]);

  return (
    <div className={`app mode-${mode}${street ? ' in-street' : ''}`} style={{ ['--era' as string]: hexToCss(eraColor) }}>
      <canvas key={quality} ref={canvas} className="scene" />
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
        <SlowNotice />
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
