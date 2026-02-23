import { AnimatedSection, Badge, SkillBar } from '../ui';
import skillsData from '../../data/skills.json';

const skillCategories: Record<string, string[]> = skillsData;

const proficiencyLevels = [
  { name: 'Python', level: 95, color: '#3B82F6' },
  { name: 'Machine Learning', level: 92, color: '#8B5CF6' },
  { name: 'Data Engineering', level: 90, color: '#10B981' },
  { name: 'SQL & Databases', level: 88, color: '#F59E0B' },
  { name: 'Deep Learning / NLP', level: 85, color: '#EF4444' },
  { name: 'Cloud (AWS/GCP)', level: 82, color: '#6366F1' },
  { name: 'Web Development', level: 78, color: '#EC4899' },
  { name: 'Data Visualization', level: 85, color: '#14B8A6' },
];

export const Skills = () => {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Skills & Technologies
          </h2>

          {/* Animated Proficiency Bars */}
          <div className="max-w-3xl mx-auto mb-16">
            <AnimatedSection delay={0.1}>
              <h3 className="text-2xl font-bold text-white mb-6">
                Core Proficiencies
              </h3>
              {proficiencyLevels.map((skill) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  color={skill.color}
                />
              ))}
            </AnimatedSection>
          </div>

          {/* Skill Badges by Category */}
          <div className="space-y-10">
            {Object.entries(skillCategories).map(([category, skills], index) => (
              <AnimatedSection key={category} delay={index * 0.1}>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
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
