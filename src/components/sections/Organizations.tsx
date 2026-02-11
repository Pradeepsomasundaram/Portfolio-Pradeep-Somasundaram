import { AnimatedSection, Card } from '../ui';
import { HiUserGroup } from 'react-icons/hi';
import organizationsData from '../../data/organizations.json';

export const Organizations = () => {
  return (
    <section id="organizations" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Organizations
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {organizationsData.map((org, index) => (
              <AnimatedSection key={org.id} delay={index * 0.1}>
                <Card className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <HiUserGroup className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {org.name}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {org.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-3">
                      {org.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
