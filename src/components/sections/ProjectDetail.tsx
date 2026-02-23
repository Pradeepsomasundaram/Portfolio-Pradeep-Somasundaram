import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft } from 'react-icons/hi';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { Badge } from '../ui';
import type { Project } from '../../types/project.types';
import projectsData from '../../data/projects.json';

const projects: Project[] = projectsData;

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary hover:underline"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary mb-8 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Projects
        </motion.button>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {project.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {project.dateRange}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {project.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {project.description}
          </p>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-3">
            {project.technologies.map((tech) => (
              <Badge key={tech} text={tech} />
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 mb-12"
        >
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-gray-900 dark:text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <FaGithub className="w-5 h-5" />
            View Source Code
          </a>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
              Live Demo
            </a>
          )}
        </motion.div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Projects
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <button
                  key={rp.id}
                  onClick={() => navigate(`/projects/${rp.id}`)}
                  className="text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {rp.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {rp.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
