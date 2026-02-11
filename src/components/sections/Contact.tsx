import { AnimatedSection, Card } from '../ui';
import { HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    icon: HiMail,
    label: 'Email',
    value: 'aadhi1501@gmail.com',
    href: 'mailto:aadhi1501@gmail.com',
  },
  {
    icon: HiLocationMarker,
    label: 'Location',
    value: 'Atlanta, Georgia',
  },
];

const socialLinks = [
  {
    icon: FaGithub,
    label: 'GitHub',
    href: 'https://github.com/PradeepSomasundaram1512',
  },
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/pradeep-somasundaram-835230192/',
  },
];

export const Contact = () => {
  return (
    <section
      id="contact"
      className="py-20 px-4 bg-gray-50 dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Get In Touch
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
              I'm currently open to exploring new technologies and collaborations. Feel
              free to reach out if you'd like to connect!
            </p>

            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {contactInfo.map((item) => (
                <Card key={item.label} hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary bg-opacity-10 rounded-full">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-8">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-md">
                    <social.icon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};