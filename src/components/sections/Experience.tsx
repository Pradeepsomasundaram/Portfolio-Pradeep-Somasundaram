import { AnimatedSection, Card, Badge } from '../ui';
import experiencesData from '../../data/experience.json';

export const Experience = () => {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Experience
          </h2>

          <div className="space-y-8">
            {experiencesData.map((exp, index) => (
              <AnimatedSection key={exp.id} delay={index * 0.1}>
                <Card>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-white">
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
                    <div className="text-gray-300 text-sm">
                      <p className="font-medium">{exp.dateRange}</p>
                      <p>{exp.location}</p>
                      <p className="font-medium">{exp.type}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">
                        Key Achievements:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
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
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};