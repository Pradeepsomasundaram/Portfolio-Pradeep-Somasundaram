import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiArrowRight } from 'react-icons/hi';
import { Badge } from './Badge';
import type { Project } from '../../types/project.types';

interface ProjectCarouselProps {
  projects: Project[];
  gradientFor: (category: string) => string;
  onSelect: (project: Project) => void;
}

const VISIBLE_RANGE = 3;

/**
 * A fanned coverflow of project cards: the active card faces forward while
 * neighbours rotate away in 3D depth on both sides. Wraps around, so it
 * loops in either direction.
 */
export const ProjectCarousel = ({ projects, gradientFor, onSelect }: ProjectCarouselProps) => {
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const dragged = useRef(false);
  const n = projects.length;

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setActive((a) => (a >= n ? 0 : a));
  }, [n]);

  if (n === 0) return null;

  const go = (delta: number) => setActive((a) => (a + delta + n) % n);

  const spacing = compact ? 120 : 250;
  const cardW = compact ? 230 : 290;

  return (
    <div
      className="relative outline-none overflow-x-clip"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects carousel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      <motion.div
        className="relative h-[430px] sm:h-[460px] select-none touch-pan-y"
        style={{ perspective: 1400 }}
        onPanStart={() => {
          dragged.current = false;
        }}
        onPan={(_, info) => {
          if (Math.abs(info.offset.x) > 6) dragged.current = true;
        }}
        onPanEnd={(_, info) => {
          if (info.offset.x < -50) go(1);
          else if (info.offset.x > 50) go(-1);
        }}
      >
        {projects.map((project, i) => {
          let offset = i - active;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const abs = Math.abs(offset);
          const hidden = abs > VISIBLE_RANGE;
          const isActive = offset === 0;

          return (
            <motion.div
              key={project.id}
              className="absolute top-4 left-1/2 rounded-2xl overflow-hidden glass-panel shadow-glow cursor-pointer"
              style={{
                width: cardW,
                marginLeft: -cardW / 2,
                zIndex: 10 - abs,
                pointerEvents: hidden ? 'none' : 'auto',
              }}
              initial={false}
              animate={{
                x: offset * spacing,
                z: -abs * 160,
                rotateY: offset === 0 ? 0 : offset > 0 ? -38 : 38,
                scale: 1 - abs * 0.06,
                opacity: hidden ? 0 : 1 - abs * 0.18,
              }}
              transition={{ type: 'spring', stiffness: 170, damping: 22 }}
              onClick={() => {
                if (dragged.current) return;
                if (isActive) onSelect(project);
                else setActive(i);
              }}
              aria-hidden={hidden}
            >
              <div
                className={`h-28 flex items-center justify-center text-white text-xl font-bold px-3 text-center ${gradientFor(
                  project.category
                )}`}
              >
                {project.category}
              </div>
              <div className="p-5 h-[calc(100%-7rem)] flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">
                  {project.dateRange}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} text={tech} />
                  ))}
                </div>
                <span
                  className={`mt-auto inline-flex items-center gap-1 text-sm font-medium transition-opacity ${
                    isActive ? 'text-primary opacity-100' : 'opacity-0'
                  }`}
                >
                  View details
                  <HiArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex items-center justify-center gap-5 mt-2">
        <button
          onClick={() => go(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-primary/20 text-gray-700 dark:text-gray-200 transition-colors"
          aria-label="Previous project"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 min-w-[3.5rem] text-center">
          {active + 1} / {n}
        </span>
        <button
          onClick={() => go(1)}
          className="p-2 rounded-full bg-white/10 hover:bg-primary/20 text-gray-700 dark:text-gray-200 transition-colors"
          aria-label="Next project"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
