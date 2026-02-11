import { HiMail } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary dark:bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {currentYear} Pradeep Somasundaram. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/PradeepSomasundaram1512"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <FaGithub className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/pradeep-somasundaram-835230192/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:aadhi1501@gmail.com"
              className="hover:text-primary transition-colors"
              aria-label="Email"
            >
              <HiMail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};