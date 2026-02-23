import { AnimatedSection, Card, Badge } from '../ui';
import { HiHeart } from 'react-icons/hi';
import volunteeringData from '../../data/volunteering.json';

export const Volunteering = () => {
  return (
    <section
      id="volunteering"
      className="py-20 px-4 bg-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Volunteering
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto">
            {volunteeringData.map((vol, index) => (
              <AnimatedSection key={vol.id} delay={index * 0.15}>
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-start justify-center">
                      <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <HiHeart className="w-7 h-7 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {vol.organization}
                          </h3>
                          <p className="text-primary font-semibold">
                            {vol.role}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {vol.dateRange}
                        </p>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {vol.description}
                      </p>

                      <Badge text={vol.cause} />
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
