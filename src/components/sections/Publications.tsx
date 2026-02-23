import { AnimatedSection, Card, Badge } from '../ui';
import { HiDocumentText, HiExternalLink } from 'react-icons/hi';
import publicationsData from '../../data/publications.json';

export const Publications = () => {
  return (
    <section id="publications" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Publications
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto">
            {publicationsData.map((pub, index) => (
              <AnimatedSection key={pub.id} delay={index * 0.15}>
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-start justify-center">
                      <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <HiDocumentText className="w-7 h-7 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                          {pub.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge text={pub.publisher} />
                        <Badge text={pub.type} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {pub.date}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
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
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
