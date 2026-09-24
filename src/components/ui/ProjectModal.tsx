import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { Badge } from './Badge';
import type { Project } from '../../types/project.types';

interface ProjectModalProps {
  project: Project | null;
  relatedProjects: Project[];
  onClose: () => void;
  onSelectRelated: (project: Project) => void;
}

/** Full project detail, shown as an in-place modal — keeps the whole
 * portfolio a single continuous scroll instead of separate routed pages. */
export const ProjectModal = ({ project, relatedProjects, onClose, onSelectRelated }: ProjectModalProps) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] glass-panel rounded-2xl shadow-glow overflow-hidden z-10 flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Close project details"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary dark:text-secondary rounded-full text-sm font-medium">
                  {project.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {project.dateRange}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-bold heading-shimmer mb-4">
                {project.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {project.description}
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <Badge key={tech} text={tech} />
                ))}
              </div>

              <div className="flex gap-3 mb-8 flex-wrap">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <FaGithub className="w-4 h-4" />
                    View Source
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-glow transition-shadow text-sm"
                  >
                    <FaExternalLinkAlt className="w-3.5 h-3.5" />
                    Live Demo
                  </a>
                )}
              </div>

              {relatedProjects.length > 0 && (
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Related Projects
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {relatedProjects.map((rp) => (
                      <button
                        key={rp.id}
                        onClick={() => onSelectRelated(rp)}
                        className="text-left p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-primary/10 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm">
                          {rp.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {rp.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
