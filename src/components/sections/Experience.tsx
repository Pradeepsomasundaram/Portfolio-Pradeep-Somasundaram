import { useState } from 'react';
import { AnimatedSection, Card, Badge, ShowMoreButton, CareerPath } from '../ui';
import experiencesData from '../../data/experience.json';

const INITIAL_COUNT = 4;

export const Experience = () => {
  const [expanded, setExpanded] = useState(false);
  const visibleExperiences = expanded ? experiencesData : experiencesData.slice(0, INITIAL_COUNT);

  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-2 heading-shimmer">
            Experience
          </h2>
          <p className="text-center font-mono text-xs text-secondary/80 mb-8">
            // a journey through time
          </p>

          <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-glow mb-12 overflow-x-auto">
            <CareerPath items={experiencesData} />
          </div>

          <div className="relative">
            {/* Timeline connector line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />

            <div className="space-y-8">
              {visibleExperiences.map((exp, index) => (
                <AnimatedSection key={exp.id} delay={index * 0.1}>
                  <div className="relative md:pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-8 w-5 h-5 rounded-full border-4 border-primary bg-white dark:bg-void z-10 hidden md:block" />
                    {exp.featured && (
                      <div className="absolute left-[1.15rem] top-6 w-7 h-7 rounded-full bg-primary/20 animate-ping hidden md:block" />
                    )}

                    <Card>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 flex-wrap">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {exp.role}
                            </h3>
                            {exp.featured && (
                              <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-lg text-primary font-semibold mt-1">
                            {exp.company}
                          </p>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm">
                          <p className="font-medium">{exp.dateRange}</p>
                          <p>{exp.location}</p>
                          <p className="font-medium">{exp.type}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {exp.description}
                      </p>

                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Key Achievements:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill) => (
                          <Badge key={skill} text={skill} />
                        ))}
                      </div>
                    </Card>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {experiencesData.length > INITIAL_COUNT && (
            <ShowMoreButton
              expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
              hiddenCount={experiencesData.length - INITIAL_COUNT}
              itemLabel="earlier roles"
            />
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
