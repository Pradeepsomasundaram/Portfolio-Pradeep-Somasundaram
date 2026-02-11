import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { HiDownload } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button } from '../ui';

const roles = [
  'Data Scientist',
  2000,
  'Data Engineer',
  2000,
  'AI/ML Engineer',
  2000,
  'Full-Stack Developer',
  2000,
];

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Hello, I'm
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Pradeep Somasundaram
            </h1>
            <div className="text-2xl md:text-3xl text-primary font-semibold h-12 mb-6">
              <TypeAnimation
                sequence={roles}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
              MS in Data Science graduate from The George Washington University.
              Data Engineer / Data Scientist at Beauty Manufacturing Solutions Corp,
              specializing in Machine Learning, AI Engineering, and scalable data solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button
                href="/assets/Pradeep_Somasundaram_Res.pdf"
                download="Pradeep_Somasundaram_Resume.pdf"
                icon={<HiDownload />}
              >
                Download Resume
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                Contact Me
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-6 mt-8 justify-center md:justify-start">
              <motion.a
                href="https://github.com/PradeepSomasundaram1512"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                whileHover={{ scale: 1.2 }}
              >
                <FaGithub className="w-8 h-8" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/pradeep-somasundaram-835230192/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                whileHover={{ scale: 1.2 }}
              >
                <FaLinkedin className="w-8 h-8" />
              </motion.a>
            </div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary shadow-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img
                  src="/assets/profile.png"
                  alt="Pradeep Somasundaram"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/profile.svg';
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};