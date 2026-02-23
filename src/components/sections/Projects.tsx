import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedSection, Card, Badge } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaStar } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import type { Project } from '../../types/project.types';
import projectsData from '../../data/projects.json';

const projects: Project[] = projectsData;

const categories = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
];

export const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="projects"
      className="py-20 px-4 bg-gray-100/50 dark:bg-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Projects
          </h2>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search projects..."
              aria-label="Search projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md mx-auto block px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card hover>
                    <div className="h-full flex flex-col">
                      {/* Featured Badge */}
                      {project.featured && (
                        <div className="flex items-center gap-1 mb-3">
                          <FaStar className="text-yellow-500 w-4 h-4" />
                          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                            Featured
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {project.title}
                      </h3>

                      <p className="text-sm text-gray-400 mb-3">
                        {project.dateRange}
                      </p>

                      <p className="text-gray-300 mb-4 flex-1 line-clamp-3">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <Badge key={tech} text={tech} />
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="text-xs text-gray-400 self-center">
                            +{project.technologies.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaGithub />
                          GitHub
                        </a>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors"
                        >
                          Details
                          <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <p className="text-center text-gray-400 mt-8 text-lg">
              No projects found matching your criteria.
            </p>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};
