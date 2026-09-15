import { useState } from 'react';
import { AnimatedSection, Card, TiltCard, ShowMoreButton } from '../ui';
import { HiBadgeCheck } from 'react-icons/hi';
import certificationsData from '../../data/certifications.json';

const accents = [
  'from-primary to-accent',
  'from-secondary to-primary',
  'from-accent to-secondary',
];

const INITIAL_COUNT = 4;

export const Certifications = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? certificationsData : certificationsData.slice(0, INITIAL_COUNT);

  return (
    <section id="certifications" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Certifications
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((cert, index) => {
              const accent = accents[index % accents.length];
              return (
                <AnimatedSection key={cert.id} delay={index * 0.08}>
                  <TiltCard maxTilt={5} scale={1.02} className="h-full rounded-lg">
                    <Card className="h-full" title={cert.description}>
                      <div className="flex flex-col h-full">
                        <div
                          className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}
                        >
                          <HiBadgeCheck className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
                          {cert.name}
                        </h3>
                        <p className="text-primary text-sm font-semibold mb-3">
                          {cert.issuer}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 font-mono">
                          {cert.date}
                        </p>
                      </div>
                    </Card>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>

          {certificationsData.length > INITIAL_COUNT && (
            <ShowMoreButton
              expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
              hiddenCount={certificationsData.length - INITIAL_COUNT}
            />
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
