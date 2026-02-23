import { motion } from 'framer-motion';
import { AnimatedSection, Card } from '../ui';
import aboutData from '../../data/about.json';

const stats = [
  { label: 'Years Experience', value: aboutData.stats.yearsExperience },
  { label: 'Projects Completed', value: aboutData.stats.projectsCompleted },
  { label: 'Skills Mastered', value: aboutData.stats.skillsLearned },
  { label: 'Certifications', value: aboutData.stats.certifications },
];

export const About = () => {
  const [firstParagraph, ...rest] = aboutData.bio.split('. My expertise');
  const secondParagraph = rest.length > 0 ? 'My expertise' + rest.join('. My expertise') : '';

  return (
    <section id="about" className="py-20 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            About Me
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <motion.div
              className="flex justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                <img
                  src="/assets/about.png"
                  alt={`About ${aboutData.name}`}
                  loading="lazy"
                  className="w-full h-full object-cover scale-125"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/about.svg';
                  }}
                />
              </div>
            </motion.div>

            {/* About Content */}
            <div>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {firstParagraph}.
              </p>
              {secondParagraph && (
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {secondParagraph}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} hover={false}>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-primary mb-2">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {stat.label}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};