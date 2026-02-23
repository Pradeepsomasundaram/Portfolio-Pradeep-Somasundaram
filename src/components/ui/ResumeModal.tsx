import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiDownload, HiExternalLink } from 'react-icons/hi';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal = ({ isOpen, onClose }: ResumeModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Resume viewer"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resume
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href="/assets/Pradeep_Somasundaram_Res.pdf"
                  download="Pradeep_Somasundaram_Resume.pdf"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <HiDownload className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close resume viewer"
                >
                  <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* PDF Viewer or Mobile Fallback */}
            <div className="h-full pb-16">
              {isMobile ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <HiDownload className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      PDF preview is not available on mobile
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      Download the resume or open it in a new tab to view.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="/assets/Pradeep_Somasundaram_Res.pdf"
                      download="Pradeep_Somasundaram_Resume.pdf"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <HiDownload className="w-5 h-5" />
                      Download Resume
                    </a>
                    <a
                      href="/assets/Pradeep_Somasundaram_Res.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
                    >
                      <HiExternalLink className="w-5 h-5" />
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src="/assets/Pradeep_Somasundaram_Res.pdf"
                  className="w-full h-full"
                  title="Resume"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
