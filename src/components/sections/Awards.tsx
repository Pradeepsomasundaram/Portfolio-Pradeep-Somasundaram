import { AnimatedSection, Card, TiltCard } from '../ui';
import { HiStar } from 'react-icons/hi';
import awardsData from '../../data/awards.json';

const accents = [
  'from-accent to-primary',
  'from-primary to-secondary',
  'from-secondary to-accent',
];

export const Awards = () => {
  return (
    <section id="awards" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Honors & Awards
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {awardsData.map((award, index) => {
              const accent = accents[index % accents.length];
              return (
                <AnimatedSection key={award.id} delay={index * 0.08}>
                  <TiltCard maxTilt={5} scale={1.02} className="h-full rounded-lg">
                    <Card className="h-full" title={award.description}>
                      <div className="flex flex-col h-full">
                        <div
                          className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}
                        >
                          <HiStar className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
                          {award.title}
                        </h3>
                        <p className="text-primary text-sm font-semibold mb-3">
                          {award.issuer}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 font-mono">
                          {award.date}
                        </p>
                      </div>
                    </Card>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
