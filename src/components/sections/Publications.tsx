import { AnimatedSection, Card, Badge, TiltCard } from '../ui';
import { HiDocumentText, HiExternalLink } from 'react-icons/hi';
import publicationsData from '../../data/publications.json';

const accents = [
  'from-primary via-accent to-primary',
  'from-secondary via-primary to-secondary',
];

export const Publications = () => {
  return (
    <section id="publications" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Publications
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {publicationsData.map((pub, index) => (
              <AnimatedSection key={pub.id} delay={index * 0.12}>
                <TiltCard maxTilt={4} scale={1.015} className="h-full rounded-lg">
                  <Card className="h-full !p-0 overflow-hidden">
                    <div
                      className={`h-24 bg-gradient-to-br ${accents[index % accents.length]} flex items-center px-6`}
                    >
                      <HiDocumentText className="w-9 h-9 text-white/90 shrink-0" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2">
                        {pub.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge text={pub.publisher} />
                        <Badge text={pub.type} />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {pub.date}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {pub.description}
                      </p>

                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-sm"
                        >
                          View Publication
                          <HiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </Card>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
