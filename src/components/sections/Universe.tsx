import { Suspense, lazy } from 'react';
import { useInView } from 'react-intersection-observer';
import { AnimatedSection } from '../ui';

const ToolUniverse = lazy(() =>
  import('../three/ToolUniverse').then((m) => ({ default: m.ToolUniverse }))
);

/**
 * "The Universe" — a dedicated 3D scene section sitting between Skills and
 * the tech marquee, echoing the floating-icon/glowing-ribbon moment from
 * the reference reel. Lazy-loaded so the ~150KB three.js chunk only
 * downloads once a visitor actually scrolls this far.
 */
export const Universe = () => {
  // Don't even request the 3D chunk until the section is close to the viewport
  const [ref, inView] = useInView({ triggerOnce: true, rootMargin: '400px' });
  return (
    <section id="universe" className="py-16 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-2 heading-shimmer">
            The Toolkit
          </h2>
          <p className="text-center font-mono text-xs text-secondary/80 mb-8">
            // his core stack, orbiting
          </p>
          {inView ? (
          <Suspense
            fallback={
              <div className="h-[480px] md:h-[560px] flex items-center justify-center">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            }
          >
            <ToolUniverse />
          </Suspense>
          ) : (
            <div className="h-[480px] md:h-[560px]" aria-hidden="true" />
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
