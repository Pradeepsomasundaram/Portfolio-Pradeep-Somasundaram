import { AnimatedSection, Badge } from '../ui';
import skillsData from '../../data/skills.json';

const skillCategories: Record<string, string[]> = skillsData;

export const Skills = () => {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Skills & Technologies
          </h2>

          <div className="space-y-10">
            {Object.entries(skillCategories).map(([category, skills], index) => (
              <AnimatedSection key={category} delay={index * 0.1}>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill) => (
                      <Badge key={skill} text={skill} />
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};