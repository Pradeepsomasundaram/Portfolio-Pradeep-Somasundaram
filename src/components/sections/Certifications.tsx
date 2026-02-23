import { AnimatedSection, Card } from '../ui';
import { HiBadgeCheck } from 'react-icons/hi';
import certificationsData from '../../data/certifications.json';

export const Certifications = () => {
  return (
    <section
      id="certifications"
      className="py-20 px-4 bg-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Certifications
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificationsData.map((cert, index) => (
              <AnimatedSection key={cert.id} delay={index * 0.1}>
                <Card className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <HiBadgeCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {cert.name}
                        </h3>
                        <p className="text-primary font-semibold text-sm">
                          {cert.issuer}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-3">
                      {cert.description}
                    </p>

                    <p className="text-xs text-gray-400 font-medium">
                      Issued {cert.date}
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
