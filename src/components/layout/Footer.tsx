import { HiMail, HiHeart } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const statusMetrics = [
  { label: 'model', value: 'online' },
  { label: 'latency', value: '12ms' },
  { label: 'uptime', value: '99.98%' },
  { label: 'build', value: 'v2.0.0-neural' },
];

const quickLinks = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
];

const moreLinks = [
  { label: 'Education', id: 'education' },
  { label: 'Certifications', id: 'certifications' },
  { label: 'Publications', id: 'publications' },
  { label: 'Awards', id: 'awards' },
  { label: 'Organizations', id: 'organizations' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-100 dark:bg-void border-t border-transparent dark:border-white/10 text-gray-900 dark:text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <a href="#hero" className="text-2xl font-display font-bold heading-shimmer">
              Pradeep Somasundaram
            </a>
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
                className="p-2 bg-gray-200 dark:bg-white/10 rounded-lg hover:bg-primary transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/pradeep-somasundaram-835230192/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-white/10 rounded-lg hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:aadhi1501@gmail.com"
                className="p-2 bg-gray-200 dark:bg-white/10 rounded-lg hover:bg-primary transition-colors"
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
                  <a
                    href={`#${link.id}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
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
                  <a
                    href={`#${link.id}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* System status strip */}
        <div className="py-3 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {statusMetrics.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5">
              {m.label === 'model' && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
                </span>
              )}
              {m.label}: <span className="text-secondary">{m.value}</span>
            </span>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
