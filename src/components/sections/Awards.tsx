import { AnimatedSection, Card } from '../ui';
import { HiStar } from 'react-icons/hi';
import awardsData from '../../data/awards.json';

export const Awards = () => {
  return (
    <section id="awards" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Honors & Awards
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {awardsData.map((award, index) => (
              <AnimatedSection key={award.id} delay={index * 0.1}>
                <Card className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                        <HiStar className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {award.title}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {award.issuer}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-3">
                      {award.description}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {award.date}
                    </p>
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
