import { useState } from 'react';
import { AnimatedSection, Card, TiltCard, ShowMoreButton } from '../ui';
import { HiUserGroup } from 'react-icons/hi';
import organizationsData from '../../data/organizations.json';

const accents = [
  'from-secondary to-accent',
  'from-accent to-primary',
  'from-primary to-secondary',
];

const INITIAL_COUNT = 4;

export const Organizations = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? organizationsData : organizationsData.slice(0, INITIAL_COUNT);

  return (
    <section id="organizations" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Organizations
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {visible.map((org, index) => {
              const accent = accents[index % accents.length];
              return (
                <AnimatedSection key={org.id} delay={index * 0.1}>
                  <TiltCard maxTilt={5} scale={1.02} className="h-full rounded-lg">
                    <Card className="h-full" title={org.description}>
                      <div className="flex flex-col h-full">
                        <div
                          className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}
                        >
                          <HiUserGroup className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1">
                          {org.name}
                        </h3>
                        <p className="text-primary text-sm font-semibold mb-3">
                          {org.role}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {org.dateRange}
                          </p>
                          {'association' in org && org.association && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {org.association}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>

          {organizationsData.length > INITIAL_COUNT && (
            <ShowMoreButton
              expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
              hiddenCount={organizationsData.length - INITIAL_COUNT}
            />
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
