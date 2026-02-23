import { useState, useEffect } from 'react';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

const particlesOptions: ISourceOptions = {
  fullScreen: false,
  background: {
    color: { value: 'transparent' },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: { enable: true, mode: 'push' },
      onHover: { enable: true, mode: 'grab' },
    },
    modes: {
      push: { quantity: 4 },
      grab: {
        distance: 200,
        links: { opacity: 0.5 },
      },
      repulse: { distance: 150, duration: 0.4 },
    },
  },
  particles: {
    color: { value: '#818cf8' },
    links: {
      color: '#818cf8',
      distance: 150,
      enable: true,
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: 'none' as const,
      random: true,
      straight: false,
      outModes: { default: 'bounce' as const },
    },
    number: {
      density: { enable: true },
      value: 80,
    },
    opacity: {
      value: { min: 0.3, max: 0.7 },
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 1, max: 4 },
    },
  },
  detectRetina: true,
};

export const ParticleBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Particles
      id="tsparticles"
      options={particlesOptions}
      className="fixed inset-0 z-0"
    />
  );
};
