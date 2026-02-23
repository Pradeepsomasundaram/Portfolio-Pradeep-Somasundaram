import { Link } from 'react-router-dom';
import { HiMail, HiHeart } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const quickLinks = [
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Contact', to: '/contact' },
];

const moreLinks = [
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Publications', to: '/publications' },
  { label: 'Awards', to: '/awards' },
  { label: 'Organizations', to: '/organizations' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold text-primary">
              Pradeep S.
            </Link>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Data Scientist & AI/ML Engineer passionate about building
              scalable data solutions and leveraging machine learning
              to drive impactful insights.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com/PradeepSomasundaram1512"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/pradeep-somasundaram-835230192/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:aadhi1501@gmail.com"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                aria-label="Email"
              >
                <HiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              More
            </h3>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Pradeep Somasundaram. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Made with <HiHeart className="w-4 h-4 text-red-500" /> using React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};
