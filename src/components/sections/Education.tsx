import { AnimatedSection, Card, Badge } from '../ui';
import { HiAcademicCap } from 'react-icons/hi';
import educationData from '../../data/education.json';

export const Education = () => {
  return (
    <section id="education" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Education
          </h2>

          <div className="space-y-8 max-w-4xl mx-auto">
            {educationData.map((edu, index) => (
              <AnimatedSection key={edu.id} delay={index * 0.15}>
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-start justify-center">
                      <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <HiAcademicCap className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {edu.institution}
                          </h3>
                          <p className="text-lg text-primary font-semibold">
                            {edu.degree}, {edu.field}
                          </p>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm text-right">
                          <p className="font-medium">{edu.dateRange}</p>
                          <p>{edu.location}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <Badge text={`Grade: ${edu.grade}`} />
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        {edu.description}
                      </p>

                      {edu.activities && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Activities:</span>{' '}
                          {edu.activities}
                        </p>
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
